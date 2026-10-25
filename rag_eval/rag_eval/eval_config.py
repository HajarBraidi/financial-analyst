import hashlib
import os
import random
import time
from dotenv import load_dotenv

load_dotenv()

 
QDRANT_URL = os.environ["QDRANT_URL"]
QDRANT_API_KEY = os.environ["QDRANT_API_KEY"]
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "financebench")

# Gemini
GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]
GENERATOR_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
JUDGE_MODEL = os.getenv("GEMINI_JUDGE_MODEL", "gemini-2.0-flash")

# Embeddings (must match the pipeline: BGE-M3)
EMBED_MODEL = os.getenv("EMBED_MODEL", "BAAI/bge-m3")

# Your colleagues' code: the folder you cloned, next to rag_eval
COLLEAGUES_SRC = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "colleagues_repo", "src")
)

TOP_K = 8  # same as their K_QUESTION
GOLDEN_SET_PATH = "data/golden_set.jsonl"
RESULTS_DIR = "data/results"


def get_chunk_id(text: str) -> str:
    """Stable chunk ID. The collection has no chunk_id field, so we hash the text."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()



def with_retry(fn, tries=6, base_wait=10):
    """Retry a Gemini call when the service is busy (503) or rate-limited (429)."""
    for attempt in range(tries):
        try:
            return fn()
        except Exception as e:
            msg = str(e)
            busy = "503" in msg or "UNAVAILABLE" in msg or "429" in msg or "RESOURCE_EXHAUSTED" in msg
            if not busy or attempt == tries - 1:
                raise
            wait = base_wait * (2 ** attempt) + random.uniform(0, 3)
            print(f"Gemini busy, retrying in {wait:.0f}s (attempt {attempt + 1}/{tries})")
            time.sleep(wait)