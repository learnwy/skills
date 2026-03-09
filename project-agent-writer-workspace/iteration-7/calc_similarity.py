from pathlib import Path
from difflib import SequenceMatcher

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-agent-writer-workspace/iteration-7")
pairs = [
    (19, "case-normalization-routing-guard.md"),
    (20, "unicode-homoglyph-detection-guard.md"),
    (21, "multi-source-evidence-priority-matrix-router.md"),
]

for eval_id, name in pairs:
    with_text = (base / f"eval-{eval_id}" / "with_skill" / "outputs" / name).read_text()
    baseline_text = (base / f"eval-{eval_id}" / "without_skill" / "outputs" / name).read_text()
    score = SequenceMatcher(None, with_text, baseline_text).ratio()
    print(f"eval-{eval_id}: {score:.4f}")
