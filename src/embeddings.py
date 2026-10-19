"""Embeddings Hugging Face avec sentence-transformers (modèle BGE-M3)."""
import torch
from langchain_huggingface import HuggingFaceEmbeddings

from config import EMBEDDING_MODEL


def charger_embeddings():
    """Charge le modèle BGE-M3 depuis Hugging Face.
    - La première fois, le modèle (~2,2 Go) est téléchargé, puis gardé en cache.
    - Sur carte graphique (Colab) : calcul en demi-précision (float16), 2 à 3 fois plus rapide.
    - Sur processeur (votre PC) : précision normale."""
    if torch.cuda.is_available():
        appareil = "cuda"
        model_kwargs = {"device": "cuda", "model_kwargs": {"torch_dtype": torch.float16}}
        taille_lot = 64
    else:
        appareil = "cpu"
        model_kwargs = {"device": "cpu"}
        taille_lot = 8
    print(f"Chargement de {EMBEDDING_MODEL} sur {appareil}...")
    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs=model_kwargs,
        encode_kwargs={
            "normalize_embeddings": True,  # vecteurs de longueur 1 (recommandé pour BGE)
            "batch_size": taille_lot,
        },
    )
