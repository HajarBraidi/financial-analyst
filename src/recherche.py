"""Retrouver dans Qdrant les passages utiles à une analyse, et vérifier les citations."""
import json
import os
import re
from functools import lru_cache

import requests
from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore
from qdrant_client import models

from analyse_config import DECALAGE_PAGE, K_PAR_REQUETE, K_QUESTION, TYPES_ANNUELS
from config import COLLECTION_NAME, METADATA_URL

load_dotenv()


# --- Noms des entreprises -------------------------------------------------------------
@lru_cache(maxsize=1)
def _catalogue():
    """Liste officielle des documents FinanceBench (téléchargée une seule fois). Elle sert
    uniquement à connaître les noms d'entreprises : ce qui est réellement indexé est
    demandé à Qdrant (voir annees_indexees)."""
    reponse = requests.get(METADATA_URL, timeout=60)
    reponse.raise_for_status()
    return [json.loads(ligne) for ligne in reponse.text.splitlines() if ligne.strip()]


def entreprises_disponibles():
    return sorted({d["company"] for d in _catalogue()})


def trouver_entreprise(nom):
    """Accepte une écriture approximative : '3m', 'american' (si un seul résultat)..."""
    noms = entreprises_disponibles()
    cible = nom.strip().lower()
    for candidat in noms:
        if candidat.lower() == cible:
            return candidat
    partiels = [c for c in noms if cible and cible in c.lower()]
    if len(partiels) == 1:
        return partiels[0]
    raise ValueError(
        f"Entreprise '{nom}' introuvable ou ambiguë. Entreprises disponibles : {', '.join(noms)}"
    )


# --- Recherche dans Qdrant ----------------------------------------------------------
def ouvrir_base(embeddings=None):
    """Ouvre la collection Qdrant existante. Le modèle d'embeddings doit être le même
    que celui utilisé pour l'indexation (BGE-M3, voir config.py)."""
    if embeddings is None:
        from embeddings import charger_embeddings  # import tardif : PyTorch est lourd
        embeddings = charger_embeddings()
    return QdrantVectorStore.from_existing_collection(
        embedding=embeddings,
        url=os.getenv("QDRANT_URL"),
        api_key=os.getenv("QDRANT_API_KEY"),
        collection_name=COLLECTION_NAME,
    )


def _filtre(entreprise, annees):
    """Rapports annuels de l'entreprise pour les années données."""
    return models.Filter(must=[
        models.FieldCondition(key="metadata.company", match=models.MatchValue(value=entreprise)),
        models.FieldCondition(key="metadata.doc_type", match=models.MatchAny(any=TYPES_ANNUELS)),
        models.FieldCondition(key="metadata.year", match=models.MatchAny(any=list(annees))),
    ])


def annees_indexees(base, entreprise, annees):
    """Parmi les années données, celles pour lesquelles Qdrant contient un rapport annuel
    de l'entreprise (un comptage filtré par année : rapide, grâce aux index de la collection)."""
    return [
        a for a in annees
        if base.client.count(
            collection_name=COLLECTION_NAME, count_filter=_filtre(entreprise, [a])
        ).count > 0
    ]


def chercher(base, entreprise, annees, requetes, k=K_PAR_REQUETE):
    """Pour chaque requête, garde les k passages les plus proches parmi les rapports annuels
    de l'entreprise (filtre sur l'entreprise, le type de document et les années).
    Les doublons sont supprimés."""
    filtre = _filtre(entreprise, annees)
    vus, resultats = set(), []
    for requete in requetes:
        # Les chunks commencent par "[entreprise année type]" : on le reprend dans la question.
        question = f"[{entreprise} {min(annees)} 10k] {requete}"
        for doc in base.similarity_search(question, k=k, filter=filtre):
            m = doc.metadata
            cle = (m["doc_name"], m["page"], doc.page_content[:80])
            if cle not in vus:
                vus.add(cle)
                resultats.append(doc)
    return resultats


# --- Présentation des passages au LLM et vérification -----------------------------------
def page_affichee(doc):
    return doc.metadata["page"] + DECALAGE_PAGE


def source(doc):
    return f"{doc.metadata['doc_name']}, p. {page_affichee(doc)}"


def formater_passages(docs):
    """Texte envoyé au LLM : chaque passage est précédé de son document et de sa page."""
    return "\n\n".join(
        f"[doc_name: {d.metadata['doc_name']} | page: {page_affichee(d)}]\n{d.page_content}"
        for d in docs
    )


def _formes(valeur):
    """Écritures possibles d'un montant dans le texte : 1577 -> '1,577' et '1577'."""
    v = abs(valeur)
    if float(v).is_integer():
        n = int(v)
        return {f"{n:,}", str(n)}
    formes = set()
    for decimales in (1, 2, 3):
        formes.add(f"{v:,.{decimales}f}")
        formes.add(f"{v:.{decimales}f}")
    return formes


def _valeur_dans_textes(valeur, textes):
    if valeur is None:
        return False
    for forme in _formes(valeur):
        motif = r"(?<![\d,.])" + re.escape(forme) + r"(?!\d)(?!,\d)"
        if any(re.search(motif, texte) for texte in textes):
            return True
    return False


def valeur_dans_passages(valeur, doc_name, page, docs):
    """Vrai si le montant s'écrit bien dans le passage du document et de la page cités."""
    textes = [
        d.page_content for d in docs
        if d.metadata["doc_name"] == doc_name and page_affichee(d) == page
    ]
    return _valeur_dans_textes(valeur, textes)


def valeur_dans_docs(valeur, docs):
    """Vrai si le montant s'écrit dans au moins un des passages."""
    return _valeur_dans_textes(valeur, [d.page_content for d in docs])


def _compact(texte):
    """Texte sans espaces ni majuscules, pour comparer un extrait recopié par le LLM."""
    return re.sub(r"\s+", "", texte).lower()


def extrait_dans_page(extrait, doc_name, page, docs):
    """Vrai si l'extrait (recopié par le LLM) se retrouve dans la page citée."""
    if not extrait or len(_compact(extrait)) < 8:
        return False
    cible = _compact(extrait)
    return any(
        cible in _compact(d.page_content)
        for d in docs
        if d.metadata["doc_name"] == doc_name and page_affichee(d) == page
    )


def citation_existe(doc_name, page, docs):
    """Vrai si (document, page) fait partie des passages fournis au LLM."""
    return any(
        d.metadata["doc_name"] == doc_name and page_affichee(d) == page for d in docs
    )


# --- Questions libres ------------------------------------------------------------------
_SUFFIXES = {"corporation", "corp", "inc", "company", "co", "ltd", "plc", "group", "holdings"}


def _formes_nom(nom):
    """'AES Corporation' peut s'écrire 'AES Corporation' ou 'AES' dans une question."""
    mots = nom.split()
    formes = {nom}
    while len(mots) > 1 and mots[-1].lower().strip(".,") in _SUFFIXES:
        mots = mots[:-1]
        formes.add(" ".join(mots))
    return formes


def entreprises_dans_texte(texte, noms=None):
    """Entreprises du catalogue citées dans le texte (insensible à la casse)."""
    noms = noms if noms is not None else entreprises_disponibles()
    trouvees = {}
    for nom in noms:
        for forme in sorted(_formes_nom(nom), key=len, reverse=True):
            if re.search(r"(?<!\w)" + re.escape(forme) + r"(?!\w)", texte, re.IGNORECASE):
                trouvees[nom] = forme.lower()
                break
    # si une forme en contient une autre (ex. "american express" / "american"), on garde la plus longue
    return sorted(
        nom for nom, forme in trouvees.items()
        if not any(forme != autre and forme in autre for autre in trouvees.values())
    )


def annees_dans_texte(texte):
    """Années écrites dans le texte : 'FY2018', 'in 2019'..."""
    return sorted({int(a) for a in re.findall(r"(?<!\d)(19[89]\d|20[0-3]\d)(?!\d)", texte)})


def _filtre_libre(entreprises, annees):
    conditions = []
    if entreprises:
        conditions.append(models.FieldCondition(
            key="metadata.company", match=models.MatchAny(any=list(entreprises))))
    if annees:
        conditions.append(models.FieldCondition(
            key="metadata.year", match=models.MatchAny(any=list(annees))))
    return models.Filter(must=conditions) if conditions else None


def chercher_libre(base, question, entreprises=(), annees=(), k=K_QUESTION):
    """Passages les plus proches de la question, tous types de documents confondus.
    Filtre sur l'entreprise si elle est connue. Si une année est connue, on cherche dans les
    documents de cette année et de l'année suivante (qui contient les chiffres de comparaison) ;
    s'il n'y a rien, on cherche sans filtre d'année.
    Renvoie (passages, années réellement filtrées)."""
    prefixe = ""
    if len(entreprises) == 1:  # les chunks commencent par "[entreprise année type]"
        prefixe = f"[{entreprises[0]}" + (f" {min(annees)}" if annees else "") + "] "
    essais = []
    if annees:
        essais.append(sorted(set(annees) | {a + 1 for a in annees}))
    essais.append([])
    for filtre_annees in essais:
        docs = base.similarity_search(
            prefixe + question, k=k, filter=_filtre_libre(entreprises, filtre_annees)
        )
        if docs:
            return docs, filtre_annees
    return [], []