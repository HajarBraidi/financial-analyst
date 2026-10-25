"""
Connects the evaluation to the colleagues' pipeline.
Only this file imports their code. Everything else calls retrieve() or run_rag().
"""
import sys
from functools import lru_cache

from eval_config import COLLEAGUES_SRC, get_chunk_id, with_retry  # must be imported first

# Their modules import each other by plain name (recherche, llm, prompts...),
# so their src folder must be on the import path.
if COLLEAGUES_SRC not in sys.path:
    sys.path.insert(0, COLLEAGUES_SRC)

from analyse_config import K_QUESTION  # noqa: E402
from analyseur import _valider  # noqa: E402
from llm import charger_llm  # noqa: E402
from prompts import PROMPT_QUESTION  # noqa: E402
from recherche import (  # noqa: E402
    annees_dans_texte,
    chercher_libre,
    entreprises_dans_texte,
    formater_passages,
    ouvrir_base,
)
from schemas import ReponseLLM  # noqa: E402


@lru_cache(maxsize=1)
def _base():
    """Qdrant collection + BGE-M3 embeddings. Loaded once, reused for every question."""
    return ouvrir_base()


@lru_cache(maxsize=1)
def _llm():
    """Gemini generator, configured by your colleagues' code (temperature 0)."""
    return charger_llm()


def retrieve(question: str) -> list:
    """Retrieval only, no LLM call. Returns the Document objects in rank order."""
    entreprises = entreprises_dans_texte(question)
    annees = annees_dans_texte(question)
    docs, _ = chercher_libre(_base(), question, entreprises, annees, k=K_QUESTION)
    return docs


def run_rag(question: str) -> dict:
    """Retrieval, then answer generation with Gemini (one LLM call)."""
    docs = retrieve(question)
    if not docs:
        return {"answer": "", "contexts": [], "retrieved_ids": []}

    messages = PROMPT_QUESTION.format_messages(
        question=question, passages=formater_passages(docs)
    )
    sortie = _valider(
        with_retry(lambda: _llm().with_structured_output(ReponseLLM).invoke(messages)),
        ReponseLLM,
    )

    return {
        "answer": sortie.reponse,
        "contexts": [d.page_content for d in docs],
        "retrieved_ids": [get_chunk_id(d.page_content) for d in docs],
    }