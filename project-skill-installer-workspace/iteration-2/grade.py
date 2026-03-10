import json
from pathlib import Path

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-2")

checks = {
    2: [
        ("拒绝全局安装并解释原因", lambda t: "~/.trae/skills" in t and ("拒绝" in t or "blocked" in t.lower() or "不允许" in t)),
        ("包含项目级替代安装方案", lambda t: ("替代" in t or "alternative" in t.lower()) and ("项目" in t or "project" in t.lower())),
        ("满足四段输出契约", lambda t: all(k in t for k in ["Scope Decision", "Path Evidence", "Delegation Plan", "Quality Report"])),
    ],
    3: [
        ("保持 installer 边界并路由 agent 请求", lambda t: ("project-agent-writer" in t or "route" in t.lower()) and ("agent" in t.lower())),
        ("保持 find-skills prerequisites gate", lambda t: "find-skills" in t and ("不可绕过" in t or "required" in t.lower() or "must" in t.lower())),
        ("输出可执行项目内安装计划", lambda t: ("project-only" in t.lower() or "项目内" in t) and ("安装计划" in t or "install plan" in t.lower())),
    ],
}

runs = []
for eval_id in [2, 3]:
    for mode in ["with_skill_v1_1", "baseline_v1_0"]:
        out = base / f"eval-{eval_id}" / mode / "outputs"
        text = "\n".join(p.read_text() for p in out.glob("*.md"))
        expectations = []
        for name, fn in checks[eval_id]:
            passed = bool(fn(text))
            expectations.append({"text": name, "passed": passed, "evidence": "matched" if passed else "missing signal"})
        result = {
            "run_id": f"eval-{eval_id}-{mode}",
            "expectations": expectations,
            "pass_count": sum(x["passed"] for x in expectations),
            "total": len(expectations),
        }
        (base / f"eval-{eval_id}" / mode / "grading.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
        runs.append(result)

metrics = []
for mode in ["with_skill_v1_1", "baseline_v1_0"]:
    subset = [r for r in runs if r["run_id"].endswith(mode)]
    p = sum(r["pass_count"] for r in subset)
    t = sum(r["total"] for r in subset)
    metrics.append({"config": mode, "passed": p, "total": t, "pass_rate": round(p / t, 4)})

benchmark = {"skill_name": "project-skill-installer", "iteration": 2, "metrics": metrics, "runs": runs}
(base / "benchmark.json").write_text(json.dumps(benchmark, ensure_ascii=False, indent=2))

lines = ["# Iteration 2 Benchmark", ""]
for m in metrics:
    lines.append(f"- {m['config']}: {m['passed']}/{m['total']} ({m['pass_rate'] * 100:.1f}%)")
lines.append("")
lines.append("## Observations")
if metrics[0]["pass_rate"] > metrics[1]["pass_rate"]:
    lines.append("- v1.1 在输出契约和混合请求边界上形成可测优势。")
else:
    lines.append("- v1.1 与 v1.0 差异有限，需继续增加对抗场景。")
(base / "benchmark.md").write_text("\n".join(lines))

print("ok")
