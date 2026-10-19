"""Étape A : lire la liste des documents, lire les PDF, nettoyer et découper."""
import io
import json
import re

import requests
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from pypdf import PdfReader

from config import BASE_URL, CHUNK_OVERLAP, CHUNK_SIZE, ENTREPRISES, METADATA_URL


def charger_liste_documents(tout=False):
    """Lit le fichier officiel de FinanceBench qui décrit les 361 documents :
    nom, entreprise, secteur, type (10k, 10q, 8k, Earnings...) et année.
    Si tout=True, on garde les 361 documents, sinon seulement ENTREPRISES."""
    reponse = requests.get(METADATA_URL, timeout=60)
    reponse.raise_for_status()
    documents = [json.loads(ligne) for ligne in reponse.text.splitlines() if ligne.strip()]
    if ENTREPRISES and not tout:  # on garde seulement les entreprises choisies dans config.py
        documents = [d for d in documents if d["company"] in ENTREPRISES]
    return documents


def nettoyer(texte):
    """Met chaque ligne de tableau sur une seule ligne.
    Avant : 'Purchases of PP&E\\n \\n(1,577)\\n \\n(1,373)'
    Après : 'Purchases of PP&E (1,577) (1,373)'"""
    return re.sub(r"\s+", " ", texte).strip()


def charger_pages(info):
    """Télécharge un PDF et renvoie une liste de Documents (une par page).
    'info' est une ligne du fichier de FinanceBench."""
    reponse = requests.get(BASE_URL + info["doc_name"] + ".pdf", timeout=180)
    reponse.raise_for_status()
    lecteur = PdfReader(io.BytesIO(reponse.content))

    pages = []
    for numero, page in enumerate(lecteur.pages):
        try:
            texte = nettoyer(page.extract_text() or "")
        except Exception:
            continue  # page illisible : on la saute
        if len(texte) < 50:  # page vide
            continue
        pages.append(Document(
            page_content=texte,
            metadata={
                "doc_name": info["doc_name"],
                "company": info["company"],
                "sector": info.get("gics_sector", ""),
                "doc_type": info["doc_type"].lower(),  # 10k, 10q, 8k, earnings...
                "year": info["doc_period"],
                "page": numero,  # numérotation à partir de 0, comme FinanceBench
            },
        ))
    return pages


def decouper(pages):
    """Découpe les pages en chunks. Chaque chunk garde les métadonnées de sa page."""
    decoupeur = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
    )
    chunks = decoupeur.split_documents(pages)
    # On écrit l'entreprise, l'année et le type au début du texte pour aider la recherche
    for chunk in chunks:
        m = chunk.metadata
        chunk.page_content = f"[{m['company']} {m['year']} {m['doc_type']}] " + chunk.page_content
    return chunks


if __name__ == "__main__":
    # Test rapide, sans rien envoyer à Qdrant
    documents = charger_liste_documents()
    print("Documents sélectionnés :", len(documents))
    for d in documents:
        print("  ", d["doc_name"], "|", d["doc_type"], "|", d["doc_period"])

    pages = charger_pages(documents[0])
    chunks = decouper(pages)
    print("\nPremier document :", documents[0]["doc_name"])
    print("Pages lues :", len(pages), "| Chunks créés :", len(chunks))
    print("Exemple :", chunks[10].page_content[:300])
