"""Paramètres communs à toute l'équipe. Ne pas changer sans prévenir les autres."""

# Les PDF et la liste des documents FinanceBench sont lus directement depuis GitHub
BASE_URL = "https://raw.githubusercontent.com/patronus-ai/financebench/main/pdfs/"
METADATA_URL = (
    "https://raw.githubusercontent.com/patronus-ai/financebench/main/"
    "data/financebench_document_information.jsonl"
)
QUESTIONS_URL = (
    "https://raw.githubusercontent.com/patronus-ai/financebench/main/"
    "data/financebench_open_source.jsonl"
)

# Quelles entreprises indexer ?
#   - None : les 40 entreprises (361 documents)  <- notre choix
#   - ou une liste, par exemple ["3M", "Boeing"]
ENTREPRISES = None

# Sélection pour aller plus vite (229 documents au lieu de 361) :
# on garde tous les 10-Q, 8-K et communiqués de résultats, les 10-K à partir de
# cette année, et tous les documents qui ont des questions FinanceBench.
#   - None : garder tous les 10-K (361 documents)
ANNEE_MIN_10K = 2020

# Modèle d'embeddings Hugging Face (le même pour tout le monde)
# BGE-M3 : multilingue, on peut donc poser les questions en français ou en anglais
EMBEDDING_MODEL = "BAAI/bge-m3"
EMBEDDING_SIZE = 1024  # taille des vecteurs de ce modèle

# Nom de la collection dans Qdrant
COLLECTION_NAME = "financebench"

# Découpage (chunks un peu plus grands pour limiter leur nombre)
CHUNK_SIZE = 1500
CHUNK_OVERLAP = 150
