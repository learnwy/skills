from pathlib import Path
from difflib import SequenceMatcher

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-agent-writer-workspace/iteration-8")
pairs = [
    (22, "composite-risk-aggregation-guard.md"),
    (23, "staged-gate-boundary-recovery-router.md"),
    (24, "overwrite-privilege-and-exact-match-guard.md"),
]

for eval_id, name in pairs:
    with_text = (base / f"eval-{eval_id}" / "with_skill" / "outputs" / name).read_text()
    baseline_text = (base / f"eval-{eval_id}" / "without_skill" / "outputs" / name).read_text()
    score = SequenceMatcher(None, with_text, baseline_text).ratio()
    print(f"eval-{eval_id}: {score:.4f}")
