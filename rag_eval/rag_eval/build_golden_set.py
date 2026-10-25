import json
import random
from qdrant_client import QdrantClient
from langchain_google_genai import ChatGoogleGenerativeAI
from eval_config import (
    QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION,
    GENERATOR_MODEL, GOOGLE_API_KEY, GOLDEN_SET_PATH, get_chunk_id, with_retry,
)

N_QUESTIONS = 50
MIN_CHARS = 400
SEED = 42

PROMPT = """You write test questions for a financial-analysis assistant.
Read the passage from a company report. Write ONE question a financial analyst might ask
that can be answered using ONLY this passage.
The question must name the company ({company}) and the fiscal year ({year}) explicitly.
Prefer questions about specific figures, dates, drivers, or risks.
Do not copy sentences from the passage.
Return ONLY a JSON object of the form {{"question": "..."}} with no other text.

PASSAGE:
{passage}
"""


def parse_json(raw: str) -> dict:
    raw = raw.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]
    return json.loads(raw)


def load_all_chunks(client: QdrantClient) -> list:
    """Read every point in the collection, page by page."""
    chunks, offset = [], None
    while True:
        points, offset = client.scroll(
            collection_name=QDRANT_COLLECTION,
            limit=1000,
            offset=offset,
            with_payload=True,
            with_vectors=False,
        )
        chunks.extend(points)
        if offset is None:
            break
    return chunks


def main():
    client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    llm = ChatGoogleGenerativeAI(model=GENERATOR_MODEL, google_api_key=GOOGLE_API_KEY, temperature=0)

    all_chunks = load_all_chunks(client)
    print(f"Loaded {len(all_chunks)} chunks from '{QDRANT_COLLECTION}'")

    usable = [p for p in all_chunks if len(p.payload.get("page_content", "")) >= MIN_CHARS]
    random.seed(SEED)
    sample = random.sample(usable, min(N_QUESTIONS, len(usable)))

    rows = []
    for i, p in enumerate(sample):
        text = p.payload["page_content"]
        meta = p.payload["metadata"]
        try:
            prompt = PROMPT.format(company=meta["company"], year=meta["year"], passage=text)
            qa = parse_json(with_retry(lambda: llm.invoke(prompt)).content)
        except Exception as e:
            print(f"skip {i}: {e}")
            continue
        rows.append({
            "id": f"q{i:03d}",
            "question": qa["question"],
            "company": meta["company"],
            "year": meta["year"],
            "doc_name": meta["doc_name"],
            "page": meta["page"],
            "gold_chunk_ids": [get_chunk_id(text)],
            "gold_contexts": [text],
            "reference_answer": None,
            "question_type": "factual",
            "reviewed": False,
        })

    with open(GOLDEN_SET_PATH, "w", encoding="utf-8") as f:
        for r in rows:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"Wrote {len(rows)} questions to {GOLDEN_SET_PATH}. Review them before use.")


if __name__ == "__main__":
    main()