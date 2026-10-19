"""Embeddings Hugging Face avec sentence-transformers (modèle BGE-M3)."""
import torch
from langchain_huggingface import HuggingFaceEmbeddings

from config import EMBEDDING_MODEL


def charger_embeddings():
    """Charge le modèle BGE-M3 depuis Hugging Face.
    - La première fois, le modèle (~2,2 Go) est téléchargé, puis gardé en cache.
    - Utilise la carte graphique (GPU) si elle existe (Colab), sinon le processeur (CPU)."""
    appareil = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Chargement de {EMBEDDING_MODEL} sur {appareil}...")
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": appareil},
        encode_kwargs={
            "normalize_embeddings": True,  # vecteurs de longueur 1 (recommandé pour BGE)
            "batch_size": 32 if appareil == "cuda" else 8,
        },
    )
