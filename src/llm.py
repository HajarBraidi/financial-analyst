"""Connexion au LLM (Gemini)."""
import os

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

from analyse_config import MODELE_LLM

load_dotenv()


def charger_llm(temperature=0.0):
    """Renvoie le LLM Gemini. Température 0 : réponses stables, adaptées à l'extraction de chiffres.
    La clé est lue dans la variable d'environnement GOOGLE_API_KEY (fichier .env)."""
    if not os.getenv("GOOGLE_API_KEY"):
        raise RuntimeError(
            "GOOGLE_API_KEY est absente. Ajoutez-la dans le fichier .env (voir .env.example)."
        )
    return ChatGoogleGenerativeAI(model=MODELE_LLM, temperature=temperature)
