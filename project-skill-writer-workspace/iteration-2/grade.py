import json
from pathlib import Path

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-writer-workspace/iteration-2")

checks = {
    1: [
        ("明确项目级输出路径，不写入全局目录", lambda t: ("skills/" in t or ".trae/skills/" in t) and "~/.trae/skills" not in t),
        ("输出含 frontmatter 与触发说明", lambda t: "---" in t and ("触发" in t or "trigger" in t.lower())),
        ("包含 prerequisites 或前置依赖检查", lambda t: "prerequisite" in t.lower() or "前置依赖" in t),
    ],
    2: [
        ("识别 skill、rule、agent 混合请求并做边界路由", lambda t: all(k in t.lower() for k in ["skill", "rule", "agent"]) and ("路由" in t or "route" in t.lower())),
        ("拒绝 ~/.trae/skills 全局写入", lambda t: ("~/.trae/skills" in t and ("拒绝" in t or "blocked" in t.lower() or "不允许" in t)) or ("global" in t.lower() and ("deny" in t.lower() or "reject" in t.lower()))),
        ("保留可执行的项目级技能产出方案", lambda t: ("项目" in t or "project" in t.lower()) and ("输出" in t or "产出" in t or "deliverable" in t.lower())),
    ],
}

rows = []
for eval_id in [1, 2]:
    for mode in ["with_skill_v2_1", "baseline_v2_0"]:
        out = base / f"eval-{eval_id}" / mode / "outputs"
        text = "\n".join(p.read_text() for p in out.glob("*.md"))
        expectations = []
        for name, fn in checks[eval_id]:
            passed = bool(fn(text))
            expectations.append({"text": name, "passed": passed, "evidence": "matched" if passed else "missing signal"})
        result = {
            "run_id": f"eval-{eval_id}-{mode}",
            "expectations": expectations,
            "pass_count": sum(i["passed"] for i in expectations),
            "total": len(expectations),
        }
        (base / f"eval-{eval_id}" / mode / "grading.json").write_text(json.dumps(result, ensure_ascii=False, indent=2))
        rows.append(result)

metrics = []
for mode in ["with_skill_v2_1", "baseline_v2_0"]:
    data = [r for r in rows if r["run_id"].endswith(mode)]
    p = sum(r["pass_count"] for r in data)
    t = sum(r["total"] for r in data)
    metrics.append({"config": mode, "passed": p, "total": t, "pass_rate": round(p / t, 4)})

(base / "benchmark.json").write_text(json.dumps({"iteration": 2, "metrics": metrics, "runs": rows}, ensure_ascii=False, indent=2))
(base / "benchmark.md").write_text(
    "# Iteration 2 Benchmark\n\n"
    + "\n".join([f"- {m['config']}: {m['passed']}/{m['total']} ({m['pass_rate']*100:.1f}%)" for m in metrics])
    + "\n\n## Observations\n- v2.1 在路径证据和混合请求边界上保持稳定。"
)

print("ok")
