"""
Minimal HTTP backend for the React interface.
Reuses adapter.py and the colleagues' functions. Does not modify their code.
"""
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from adapter import _base, _llm  # importing adapter also sets the colleagues' import path
from eval_config import with_retry
from analyse_config import K_QUESTION
from analyseur import _valider
from prompts import PROMPT_QUESTION
from ratios import evaluer_expression
from recherche import (
    _filtre_libre, annees_dans_texte, entreprises_dans_texte, extrait_dans_page,
    formater_passages, page_affichee, trouver_entreprise,
)
from schemas import ReponseLLM

app = FastAPI(title="RAG financier")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # demo only: restrict to your frontend URL later
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    question: str
    entreprise: Optional[str] = None
    annee: Optional[int] = None


def chercher_avec_scores(question, entreprises, annees):
    """Same search as chercher_libre() in recherche.py, but keeps the similarity scores.
    If you change chercher_libre(), change this function too."""
    prefixe = ""
    if len(entreprises) == 1:
        prefixe = f"[{entreprises[0]}" + (f" {min(annees)}" if annees else "") + "] "
    essais = []
    if annees:
        essais.append(sorted(set(annees) | {a + 1 for a in annees}))
    essais.append([])
    for filtre_annees in essais:
        resultats = _base().similarity_search_with_score(
            prefixe + question, k=K_QUESTION, filter=_filtre_libre(entreprises, filtre_annees)
        )
        if resultats:
            return resultats
    return []


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/chat")
def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="La question est vide.")
    try:
        entreprises = (
            [trouver_entreprise(req.entreprise)] if req.entreprise
            else entreprises_dans_texte(req.question)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    annees = [req.annee] if req.annee else annees_dans_texte(req.question)

    resultats = chercher_avec_scores(req.question, entreprises, annees)
    if not resultats:
        raise HTTPException(status_code=404, detail="Aucun passage trouvé dans la base.")
    docs = [d for d, _ in resultats]

    messages = PROMPT_QUESTION.format_messages(
        question=req.question, passages=formater_passages(docs)
    )
    sortie = _valider(
        with_retry(lambda: _llm().with_structured_output(ReponseLLM).invoke(messages)),
        ReponseLLM,
    )

    avertissements, preuves = [], []
    for p in sortie.preuves:
        verifiee = extrait_dans_page(p.extrait, p.doc_name, p.page, docs)
        preuves.append({"doc_name": p.doc_name, "page": p.page,
                        "extrait": p.extrait, "verifiee": verifiee})
        if not verifiee:
            avertissements.append(f"Preuve non retrouvée dans la page citée : {p.doc_name}, p. {p.page}")
    if not sortie.suffisant:
        avertissements.append("Les passages ne permettent pas de répondre avec certitude.")

    resultat_calcul = evaluer_expression(sortie.expression_calcul) if sortie.expression_calcul else None

    sources = [
        {
            "rang": i + 1,
            "doc_name": d.metadata["doc_name"],
            "company": d.metadata["company"],
            "year": d.metadata["year"],
            "doc_type": d.metadata["doc_type"],
            "page": page_affichee(d),
            "score": round(float(score), 4),
            "texte": d.page_content,
        }
        for i, (d, score) in enumerate(resultats)
    ]

    return {
        "question": req.question,
        "answer": sortie.reponse,
        "entreprises": entreprises,
        "annees": annees,
        "preuves": preuves,
        "expression_calcul": sortie.expression_calcul,
        "resultat_calcul": resultat_calcul,
        "avertissements": avertissements,
        "sources": sources,
    }