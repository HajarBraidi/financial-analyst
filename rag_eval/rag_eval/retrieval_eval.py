import json
import os
import pandas as pd
from eval_config import GOLDEN_SET_PATH, RESULTS_DIR, TOP_K, get_chunk_id
from adapter import retrieve


def load_golden(path=GOLDEN_SET_PATH):
    with open(path, encoding="utf-8") as f:
        return [json.loads(l) for l in f if l.strip()]


def retrieval_metrics(retrieved_ids, gold_ids, k):
    top = retrieved_ids[:k]
    gold = set(gold_ids)
    hits = [1 if cid in gold else 0 for cid in top]
    hit_rate = 1.0 if any(hits) else 0.0
    recall = len(gold & set(top)) / len(gold) if gold else 0.0
    precision = sum(hits) / k
    rr = 0.0
    for rank, cid in enumerate(top, start=1):
        if cid in gold:
            rr = 1.0 / rank
            break
    return {"hit_rate": hit_rate, "recall": recall, "precision": precision, "rr": rr}


def main():
    golden = [g for g in load_golden() if g.get("reviewed")]
    print(f"Evaluating {len(golden)} reviewed questions, k={TOP_K}")

    rows = []
    for g in golden:
        docs = retrieve(g["question"])
        ids = [get_chunk_id(d.page_content) for d in docs]
        m = retrieval_metrics(ids, g["gold_chunk_ids"], TOP_K)
        m.update({"id": g["id"], "question_type": g["question_type"]})
        rows.append(m)

    df = pd.DataFrame(rows)
    summary = df[["hit_rate", "recall", "precision", "rr"]].mean().rename({"rr": "MRR"})
    print("\n=== Retrieval summary ===")
    print(summary.round(3).to_string())
    print("\n=== By question type ===")
    print(df.groupby("question_type")[["hit_rate", "recall", "precision", "rr"]].mean().round(3))

    os.makedirs(RESULTS_DIR, exist_ok=True)
    df.to_csv(f"{RESULTS_DIR}/retrieval_per_question.csv", index=False)


if __name__ == "__main__":
    main()