"""Étape B : transformer les chunks en vecteurs et les stocker dans Qdrant Cloud.

Le script indexe les documents UN PAR UN et saute ceux qui sont déjà dans Qdrant.
Si le script s'arrête (coupure, PC éteint...), il suffit de le relancer :
il reprend là où il s'était arrêté.

Utilisation :
    python src/indexing.py          (entreprises de config.py)
    python src/indexing.py --tout   (les 361 documents)"""
import os
import sys

from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models

from config import COLLECTION_NAME, EMBEDDING_SIZE
from embeddings import charger_embeddings
from ingestion import charger_liste_documents, charger_pages, decouper

load_dotenv()


def creer_collection_si_absente(client):
    """Crée la collection une seule fois, réglée pour tenir dans l'offre gratuite."""
    if client.collection_exists(COLLECTION_NAME):
        return
    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=models.VectorParams(
            size=EMBEDDING_SIZE, distance=models.Distance.COSINE, on_disk=True
        ),
        # Compresse les vecteurs en mémoire (4 fois moins de RAM)
        quantization_config=models.ScalarQuantization(
            scalar=models.ScalarQuantizationConfig(type=models.ScalarType.INT8, always_ram=True)
        ),
        on_disk_payload=True,  # le texte des chunks est stocké sur disque, pas en RAM
    )
    # Index pour filtrer vite par entreprise, année, type de document
    for champ, type_champ in [
        ("metadata.company", models.PayloadSchemaType.KEYWORD),
        ("metadata.doc_name", models.PayloadSchemaType.KEYWORD),
        ("metadata.doc_type", models.PayloadSchemaType.KEYWORD),
        ("metadata.year", models.PayloadSchemaType.INTEGER),
    ]:
        client.create_payload_index(COLLECTION_NAME, field_name=champ, field_schema=type_champ)
    print("Collection créée.")


def deja_indexe(client, doc_name):
    """Vérifie si un document est déjà dans Qdrant."""
    resultat = client.count(
        collection_name=COLLECTION_NAME,
        count_filter=models.Filter(must=[
            models.FieldCondition(key="metadata.doc_name", match=models.MatchValue(value=doc_name))
        ]),
    )
    return resultat.count > 0


def main(client=None, tout=False):
    client = client or QdrantClient(
        url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"), timeout=120
    )
    creer_collection_si_absente(client)
    base = QdrantVectorStore(
        client=client, collection_name=COLLECTION_NAME, embedding=charger_embeddings()
    )

    documents = charger_liste_documents(tout=tout)
    print(len(documents), "documents à traiter.\n")

    for i, info in enumerate(documents, start=1):
        nom = info["doc_name"]
        if deja_indexe(client, nom):
            print(f"[{i}/{len(documents)}] {nom} : déjà indexé, on passe.")
            continue
        try:
            chunks = decouper(charger_pages(info))
            base.add_documents(chunks, batch_size=64)
            print(f"[{i}/{len(documents)}] {nom} : {len(chunks)} chunks ajoutés.")
        except Exception as erreur:
            # Un document en erreur ne bloque pas les autres
            print(f"[{i}/{len(documents)}] {nom} : ERREUR ({erreur}), on continue.")

    total = client.count(collection_name=COLLECTION_NAME).count
    print(f"\nTerminé. La base contient {total} chunks.")


if __name__ == "__main__":
    # python src/indexing.py         -> seulement les ENTREPRISES de config.py
    # python src/indexing.py --tout  -> les 361 documents des 40 entreprises
    main(tout="--tout" in sys.argv)
