"""Vérifie la clé et le modèle Gemini, puis que le format de sortie structuré est accepté.
Utilisation : python src/test_llm.py"""
from analyse_config import MODELE_LLM
from analyseur import _texte
from llm import charger_llm
from schemas import Extraction

llm = charger_llm()
print(f"Modèle : {MODELE_LLM}")

print("\n1) Réponse simple")
print(_texte(llm.invoke("Réponds uniquement par le mot : OK")))

print("\n2) Sortie structurée (même format que l'analyse)")
texte = (
    "[doc_name: DEMO_2018_10K | page: 12]\n"
    "Consolidated Statement of Income (Millions) 2018 2017 "
    "Net sales $ 32,765 $ 31,657 Cost of sales 16,682 16,055 Operating income 7,207 7,666 "
    "Net income attributable to 3M 5,349 4,858"
)
resultat = llm.with_structured_output(Extraction).invoke(
    "Extrais les chiffres de l'exercice 2018 (courant) et 2017 (précédent) :\n" + texte
)
print(resultat.model_dump_json(indent=2) if resultat else "Aucune donnée renvoyée")