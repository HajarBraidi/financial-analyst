import pandas as pd
from eval_config import RESULTS_DIR
import matplotlib.pyplot as plt

ret = pd.read_csv(f"{RESULTS_DIR}/retrieval_per_question.csv")
gen = pd.read_csv(f"{RESULTS_DIR}/generation_per_question.csv")

# Align by row order (both come from the same golden set order).
# If you change the golden set, merge on an id column instead.
df = ret.reset_index(drop=True).copy()
for c in ["context_precision", "context_recall", "faithfulness", "answer_relevancy"]:
    if c in gen.columns:
        df[c] = gen[c].values

def show_worst(metric, n=10):
    print(f"\n--- Worst {n} on {metric} ---")
    cols = ["id", "question_type", metric, "hit_rate", "rr"]
    print(df.sort_values(metric).head(n)[[c for c in cols if c in df.columns]].to_string(index=False))

for m in ["faithfulness", "context_recall", "answer_relevancy"]:
    if m in df.columns:
        show_worst(m)

# Diagnostic labels to fill in by hand after reading the worst cases:
df["failure_label"] = ""   # e.g. retrieval_miss | chunking | ranking | hallucination | incomplete | bad_gold

# Charts
fig, ax = plt.subplots(figsize=(8, 4))
metrics = [c for c in ["hit_rate", "context_precision", "context_recall",
                       "faithfulness", "answer_relevancy"] if c in df.columns]
df[metrics].mean().plot(kind="bar", ax=ax, title="Average score per metric")
ax.set_ylim(0, 1)
plt.tight_layout()
plt.savefig(f"{RESULTS_DIR}/summary.png", dpi=150)
print(f"\nChart saved to {RESULTS_DIR}/summary.png")

df.to_csv(f"{RESULTS_DIR}/combined_with_labels.csv", index=False)