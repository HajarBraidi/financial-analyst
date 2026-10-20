"""Question libre sur les rapports indexés, avec preuves (document et page).

Principe :
  1. on repère l'entreprise et l'année dans la question (ou on les reçoit en option) ;
  2. on cherche les passages les plus proches dans Qdrant (tous types de documents) ;
  3. le LLM répond uniquement à partir de ces passages et cite ses preuves ;
  4. Python vérifie que chaque preuve existe dans la page citée, et effectue lui-même
     le calcul éventuel (le LLM n'écrit que l'expression, jamais le résultat).

Utilisation :
    python src/question.py "What is the FY2018 capital expenditure amount (in USD millions) for 3M?"
    python src/question.py "Quel est le chiffre d'affaires ?" --entreprise 3M --annee 2018
    python src/question.py "..." --json
"""
import argparse

from analyseur import _valider
from llm import charger_llm
from prompts import PROMPT_QUESTION
from ratios import evaluer_expression, nombres_de
from recherche import (
    annees_dans_texte, chercher_libre, entreprises_dans_texte, extrait_dans_page, formater_passages,
    ouvrir_base, source, trouver_entreprise, valeur_dans_docs,
)
from schemas import Preuve, ReponseLLM, ReponseQuestion

# Constantes qu'une formule peut contenir sans venir des passages (ex. "* 100" pour un pourcentage)
CONSTANTES_LIBRES = {1, 2, 4, 12, 100, 1000}


def repondre(question, entreprise=None, annee=None, base=None, llm=None):
    """Répond à une question libre. Renvoie une ReponseQuestion."""
    if not question or not question.strip():
        raise ValueError("La question est vide.")
    entreprises = [trouver_entreprise(entreprise)] if entreprise else entreprises_dans_texte(question)
    annees = [annee] if annee else annees_dans_texte(question)

    base = base if base is not None else ouvrir_base()
    llm = llm if llm is not None else charger_llm()

    docs, annees_filtrees = chercher_libre(base, question, entreprises, annees)
    if not docs:
        raise ValueError("Aucun passage trouvé dans Qdrant. L'indexation est-elle terminée ?")

    resultat = ReponseQuestion(
        question=question, entreprises=entreprises, annees=annees,
        sources=sorted({source(d) for d in docs}),
    )
    if annees and not annees_filtrees:
        resultat.avertissements.append(
            f"Aucun document de {', '.join(map(str, annees))} trouvé : recherche sans filtre d'année."
        )
    if not entreprises:
        resultat.avertissements.append(
            "Aucune entreprise reconnue dans la question : recherche dans tous les documents. "
            "Précisez --entreprise pour de meilleurs résultats."
        )

    messages = PROMPT_QUESTION.format_messages(question=question, passages=formater_passages(docs))
    sortie = _valider(llm.with_structured_output(ReponseLLM).invoke(messages), ReponseLLM)
    resultat.reponse = sortie.reponse

    # Vérification des preuves annoncées par le LLM
    for p in sortie.preuves:
        verifiee = extrait_dans_page(p.extrait, p.doc_name, p.page, docs)
        resultat.preuves.append(
            Preuve(doc_name=p.doc_name, page=p.page, extrait=p.extrait, verifiee=verifiee)
        )
        if not verifiee:
            resultat.avertissements.append(
                f"Preuve non retrouvée dans la page citée, à vérifier : {p.doc_name}, p. {p.page}."
            )
    if sortie.suffisant and not sortie.preuves:
        resultat.avertissements.append("Réponse sans preuve citée : à ne pas considérer comme fiable.")
    if not sortie.suffisant:
        resultat.avertissements.append(
            "Les passages retrouvés ne permettent pas de répondre avec certitude."
        )

    # Calcul effectué par Python
    if sortie.expression_calcul:
        resultat.expression_calcul = sortie.expression_calcul
        resultat.resultat_calcul = evaluer_expression(sortie.expression_calcul)
        if resultat.resultat_calcul is None:
            resultat.avertissements.append(
                f"Calcul impossible à effectuer : {sortie.expression_calcul}"
            )
        for nombre in nombres_de(sortie.expression_calcul):
            if abs(nombre) not in CONSTANTES_LIBRES and not valeur_dans_docs(nombre, docs):
                resultat.avertissements.append(
                    f"Nombre du calcul non retrouvé dans les passages, à vérifier : {nombre:g}"
                )
    return resultat


def en_texte_question(resultat):
    """Présentation lisible de la réponse dans le terminal."""
    lignes = [f"=== Question : {resultat.question} ==="]
    if resultat.entreprises or resultat.annees:
        lignes.append(
            f"Recherche : {', '.join(resultat.entreprises) or 'toutes entreprises'}"
            f" | {', '.join(map(str, resultat.annees)) or 'toutes années'}"
        )
    lignes += ["", "Réponse", resultat.reponse]
    if resultat.expression_calcul:
        valeur = "impossible" if resultat.resultat_calcul is None else f"{resultat.resultat_calcul:,.2f}"
        lignes += ["", "Calcul (effectué par Python)", f"  {resultat.expression_calcul} = {valeur}"]
    if resultat.preuves:
        lignes += ["", "Preuves"]
        for p in resultat.preuves:
            etat = "vérifiée" if p.verifiee else "à vérifier"
            lignes.append(f"  - {p.doc_name}, p. {p.page} [{etat}] : « {p.extrait} »")
    if resultat.avertissements:
        lignes += ["", "Avertissements"] + [f"  ! {a}" for a in resultat.avertissements]
    lignes += ["", f"Passages utilisés : {' ; '.join(resultat.sources)}"]
    return "\n".join(lignes)


if __name__ == "__main__":
    parseur = argparse.ArgumentParser(description="Question libre sur les rapports FinanceBench")
    parseur.add_argument("question", help="entre guillemets")
    parseur.add_argument("--entreprise", help="par exemple : 3M (sinon détectée dans la question)")
    parseur.add_argument("--annee", type=int, help="par exemple : 2018 (sinon détectée dans la question)")
    parseur.add_argument("--json", action="store_true", help="affiche le résultat en JSON")
    args = parseur.parse_args()

    print("Chargement des modèles et connexion à Qdrant...")
    resultat = repondre(args.question, args.entreprise, args.annee)
    print(resultat.model_dump_json(indent=2) if args.json else en_texte_question(resultat))
