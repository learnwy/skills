from pathlib import Path
from difflib import SequenceMatcher

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-agent-writer-workspace/iteration-6")
pairs = [
    (16, "evidence-chain-recovery-router.md"),
    (17, "cross-repo-boundary-guard.md"),
    (18, "homograph-target-normalization-guard.md"),
]

for eval_id, name in pairs:
    with_text = (base / f"eval-{eval_id}" / "with_skill" / "outputs" / name).read_text()
    baseline_text = (base / f"eval-{eval_id}" / "without_skill" / "outputs" / name).read_text()
    score = SequenceMatcher(None, with_text, baseline_text).ratio()
    print(f"eval-{eval_id}: {score:.4f}")
