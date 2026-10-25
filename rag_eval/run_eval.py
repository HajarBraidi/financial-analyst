import subprocess
import sys
STEPS = [
    ["python", "retrieval_eval.py"],
    ["python", "generation_eval.py"],
    ["python", "analysis.py"],
]

for step in STEPS:
    print(f"\n>>> {' '.join(step)}")
    subprocess.run(step, check=True)
print("\nDone. Results in data/results/")