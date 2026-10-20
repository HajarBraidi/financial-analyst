"""Tests sans réseau ni clé : formules des ratios et vérification des montants.
Utilisation : python src/test_ratios.py"""
from langchain_core.documents import Document

from ratios import croissance, evaluer_expression, marge, marge_brute, nombres_de, roe
from recherche import (
    annees_dans_texte, citation_existe, entreprises_dans_texte, extrait_dans_page, valeur_dans_passages,
)

# --- Ratios ---------------------------------------------------------------------------
assert marge(1400, 13100) == 10.69
assert marge_brute(32765, 16682) == 49.09
assert roe(5349, 9848) == 54.32
assert roe(100, -50) is None          # capitaux propres négatifs : ROE sans signification
assert croissance(32765, 31657) == 3.5
assert croissance(-100, -200) == 50.0  # la perte diminue de moitié : +50 %
assert croissance(100, 0) is None      # division par zéro
assert marge(None, 100) is None        # donnée manquante
assert marge_brute(100, None) is None
print("Ratios : OK")

# --- Vérification des montants dans le passage cité ---------------------------------------
doc = Document(
    page_content=(
        "[3M 2019 10k] Cash Flows from Investing Activities: Years ended December 31 (Millions) "
        "2019 2018 2017 Purchases of property, plant and equipment (PP&E) $ (1,699) $ (1,577) $ (1,373) "
        "Net income 5.5 and growth of 12.50 percent"
    ),
    metadata={"doc_name": "3M_2019_10K", "page": 45},  # page affichée : 46 (décalage de 1)
)
docs = [doc]
assert valeur_dans_passages(-1577, "3M_2019_10K", 46, docs)       # entre parenthèses, signe ignoré
assert valeur_dans_passages(1577, "3M_2019_10K", 46, docs)
assert valeur_dans_passages(5.5, "3M_2019_10K", 46, docs)
assert valeur_dans_passages(12.5, "3M_2019_10K", 46, docs)        # écrit 12.50 dans le texte
assert not valeur_dans_passages(1578, "3M_2019_10K", 46, docs)    # montant absent
assert not valeur_dans_passages(577, "3M_2019_10K", 46, docs)     # 577 n'est pas dans 1,577
assert not valeur_dans_passages(1577, "3M_2019_10K", 47, docs)    # mauvaise page
assert not valeur_dans_passages(1577, "AUTRE_DOC", 46, docs)      # mauvais document
assert not valeur_dans_passages(None, "3M_2019_10K", 46, docs)
assert citation_existe("3M_2019_10K", 46, docs)
assert not citation_existe("3M_2019_10K", 45, docs)
print("Vérification des montants : OK")

# --- Calcul d'une expression (questions libres) -------------------------------------------
assert evaluer_expression("(32765-16682)/32765*100") == 49.09
assert evaluer_expression("-5 + 10") == 5.0
assert evaluer_expression("10/0") is None            # division par zéro
assert evaluer_expression("2**10") is None           # puissance non autorisée
assert evaluer_expression("__import__('os')") is None  # code non autorisé
assert evaluer_expression("abc") is None
assert evaluer_expression("") is None
assert sorted(nombres_de("(32765-16682)/32765*100")) == [100, 16682, 32765, 32765]
print("Calcul d'expressions : OK")

# --- Repérage de l'entreprise et de l'année dans une question ------------------------------
noms = ["3M", "AES Corporation", "American Express", "American Water Works", "Apple", "Block"]
q = "What is the FY2018 capital expenditure amount (in USD millions) for 3M?"
assert entreprises_dans_texte(q, noms) == ["3M"]
assert entreprises_dans_texte("Chiffre d'affaires d'AES en 2019 ?", noms) == ["AES Corporation"]
assert entreprises_dans_texte("american express vs apple", noms) == ["American Express", "Apple"]
assert entreprises_dans_texte("Quel est le résultat net ?", noms) == []
assert entreprises_dans_texte("the 3Mx plan", noms) == []   # mot entier seulement
assert annees_dans_texte(q) == [2018]
assert annees_dans_texte("de 2017 à 2019, soit 12345 dollars") == [2017, 2019]
print("Repérage entreprise / année : OK")

# --- Extrait recopié par le LLM ---------------------------------------------------------------
assert extrait_dans_page("Purchases of property, plant and equipment (PP&E) $ (1,699)", "3M_2019_10K", 46, docs)
assert extrait_dans_page("purchases of property,plant and equipment", "3M_2019_10K", 46, docs)  # espaces, casse
assert not extrait_dans_page("Purchases of property, plant and equipment (PP&E) $ (1,699)", "3M_2019_10K", 47, docs)
assert not extrait_dans_page("texte inventé qui n'existe pas dans la page", "3M_2019_10K", 46, docs)
assert not extrait_dans_page("", "3M_2019_10K", 46, docs)
print("Vérification des extraits : OK")