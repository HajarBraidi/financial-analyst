import pandas as pd
from datasets import Dataset  # not needed in 0.2 API, kept for compatibility notes
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings

from ragas import evaluate, EvaluationDataset
from ragas.dataset_schema import SingleTurnSample
from ragas.metrics import (
    LLMContextPrecisionWithReference,
    LLMContextRecall,
    Faithfulness,
    ResponseRelevancy,
)

 
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.run_config import RunConfig
from eval_config import GOOGLE_API_KEY, JUDGE_MODEL, EMBED_MODEL, GOLDEN_SET_PATH, RESULTS_DIR
from adapter import run_rag
from retrieval_eval import load_golden


def build_judge():
    llm = ChatGoogleGenerativeAI(model=JUDGE_MODEL, google_api_key=GOOGLE_API_KEY, temperature=0)
    emb = HuggingFaceEmbeddings(model_name=EMBED_MODEL,
                                encode_kwargs={"normalize_embeddings": True})
    return LangchainLLMWrapper(llm), LangchainEmbeddingsWrapper(emb)


def collect_samples(golden):
    samples = []
    for g in golden:
        out = run_rag(g["question"])
        samples.append(SingleTurnSample(
            user_input=g["question"],
            retrieved_contexts=out["contexts"],
            response=out["answer"],
            reference=g["reference_answer"],
        ))
    return samples


def main():
    golden = [g for g in load_golden() if g.get("reviewed")]
    samples = collect_samples(golden)
    dataset = EvaluationDataset(samples=samples)

    judge_llm, judge_emb = build_judge()
    metrics = [
        LLMContextPrecisionWithReference(),
        LLMContextRecall(),
        Faithfulness(),
        ResponseRelevancy(),
    ]

    result = evaluate(
        dataset=dataset,
        metrics=metrics,
        llm=judge_llm,
        embeddings=judge_emb,
        run_config=RunConfig(max_retries=10, max_wait=120, timeout=300),
        raise_exceptions=False,
        show_progress=True,
    )

    df = result.to_pandas()
    import os
    os.makedirs(RESULTS_DIR, exist_ok=True)
    df.to_csv(f"{RESULTS_DIR}/generation_per_question.csv", index=False)

    cols = ["context_precision", "context_recall", "faithfulness", "answer_relevancy"]
    cols = [c for c in cols if c in df.columns]
    print("\n=== Generation summary (RAGAS) ===")
    print(df[cols].mean().round(3).to_string())


if __name__ == "__main__":
    main()