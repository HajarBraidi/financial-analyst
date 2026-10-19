"""Vérifie que la base Qdrant retrouve les bons passages (en anglais et en français)."""
import os

from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore

from config import COLLECTION_NAME
from embeddings import charger_embeddings

load_dotenv()

base = QdrantVectorStore.from_existing_collection(
    embedding=charger_embeddings(),
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY"),
    collection_name=COLLECTION_NAME,
)

questions = [
    "What is the FY2018 capital expenditure amount for 3M?",
    "Quel est le montant des investissements de 3M en 2018 ?",
]
for question in questions:
    print("\n==============================")
    print("Question :", question)
    for doc in base.similarity_search(question, k=3):
        m = doc.metadata
        print(f"\n--- {m['doc_name']}, page {m['page']} ---")
        print(doc.page_content[:300])
