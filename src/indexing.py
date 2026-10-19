"""Étape B : transformer les chunks en vecteurs et les stocker dans Qdrant Cloud.

Version accélérée :
  - les PDF sont lus en parallèle (sur le processeur) pendant que la carte
    graphique calcule les vecteurs du document précédent ;
  - les documents déjà dans Qdrant sont sautés : si le script s'arrête,
    il suffit de le relancer, il reprend là où il s'était arrêté.

Utilisation :
    python src/indexing.py          (entreprises de config.py)
    python src/indexing.py --tout   (les 40 entreprises)"""
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient, models

from config import COLLECTION_NAME, EMBEDDING_SIZE
from embeddings import charger_embeddings
from ingestion import charger_liste_documents, preparer_document

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
        url=os.getenv("QDRANT_URL"), api_key=os.getenv("QDRANT_API_KEY"), timeout=300
    )
    creer_collection_si_absente(client)

    # 1. Quels documents reste-t-il à faire ?
    documents = charger_liste_documents(tout=tout)
    a_faire = [d for d in documents if not deja_indexe(client, d["doc_name"])]
    print(f"{len(documents)} documents sélectionnés, {len(documents) - len(a_faire)} déjà indexés, "
          f"{len(a_faire)} à faire.\n")
    if not a_faire:
        print("Rien à faire : tout est déjà dans Qdrant.")
        return

    base = QdrantVectorStore(
        client=client, collection_name=COLLECTION_NAME, embedding=charger_embeddings()
    )

    # 2. Lecture des PDF en parallèle (2 à la fois) pendant que la carte graphique travaille
    debut = time.time()
    with ThreadPoolExecutor(max_workers=2) as lecteurs:
        resultats = lecteurs.map(lambda info: _preparer_sans_planter(info), a_faire)
        for i, (info, chunks, erreur) in enumerate(resultats, start=1):
            nom = info["doc_name"]
            if erreur:
                print(f"[{i}/{len(a_faire)}] {nom} : ERREUR de lecture ({erreur}), on continue.")
                continue
            try:
                # Un seul envoi par document (jusqu'à 512 chunks) : moins d'allers-retours
                base.add_documents(chunks, batch_size=512)
            except Exception as e:
                print(f"[{i}/{len(a_faire)}] {nom} : ERREUR d'envoi ({e}), on continue.")
                continue
            ecoule = time.time() - debut
            restant = ecoule / i * (len(a_faire) - i)
            print(f"[{i}/{len(a_faire)}] {nom} : {len(chunks)} chunks ajoutés "
                  f"(temps restant estimé : {restant / 60:.0f} min)")

    total = client.count(collection_name=COLLECTION_NAME).count
    print(f"\nTerminé en {(time.time() - debut) / 60:.0f} min. La base contient {total} chunks.")


def _preparer_sans_planter(info):
    """Lit un document ; en cas de problème, renvoie l'erreur au lieu de tout arrêter."""
    try:
        info, chunks = preparer_document(info)
        return info, chunks, None
    except Exception as erreur:
        return info, None, erreur


if __name__ == "__main__":
    main(tout="--tout" in sys.argv)
