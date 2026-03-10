import json
from pathlib import Path

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-installer-workspace/iteration-1")

checks = {
    1: [
        ("包含项目路径证据与项目内安装目标", lambda t: ("project" in t.lower() or "项目" in t) and "~/.trae/skills" not in t),
        ("包含 find-skills 前置检查与委托步骤", lambda t: "find-skills" in t and ("前置" in t or "prerequisite" in t.lower()) and ("委托" in t or "delegate" in t.lower())),
        ("输出完整安装计划和执行摘要", lambda t: ("安装计划" in t or "install plan" in t.lower()) and ("摘要" in t or "summary" in t.lower())),
    ],
    2: [
        ("拒绝全局安装并解释原因", lambda t: "~/.trae/skills" in t and ("拒绝" in t or "blocked" in t.lower() or "不允许" in t)),
        ("给出项目级替代安装方案", lambda t: ("替代" in t or "alternative" in t.lower()) and ("项目" in t or "project" in t.lower())),
        ("保持 project-only 约束不被覆盖", lambda t: "project-only" in t.lower() or "项目内" in t),
    ],
    3: [
        ("识别混合请求并保持 installer 边界", lambda t: all(k in t.lower() for k in ["skill", "agent"]) and ("路由" in t or "route" in t.lower() or "边界" in t)),
        ("不绕过 find-skills prerequisites gate", lambda t: "find-skills" in t and ("不可绕过" in t or "must" in t.lower() or "required" in t.lower())),
        ("路由非 installer 请求并保留可执行安装计划", lambda t: ("project-agent-writer" in t or "route" in t.lower()) and ("安装计划" in t or "install plan" in t.lower())),
    ],
}

runs = []
for eval_id in [1, 2, 3]:
    for mode in ["with_skill", "baseline"]:
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
        runs.append(result)

metrics = []
for mode in ["with_skill", "baseline"]:
    data = [r for r in runs if r["run_id"].endswith(mode)]
    p = sum(r["pass_count"] for r in data)
    t = sum(r["total"] for r in data)
    metrics.append({"config": mode, "passed": p, "total": t, "pass_rate": round(p / t, 4)})

benchmark = {"skill_name": "project-skill-installer", "iteration": 1, "metrics": metrics, "runs": runs}
(base / "benchmark.json").write_text(json.dumps(benchmark, ensure_ascii=False, indent=2))

md = ["# Iteration 1 Benchmark", ""]
for m in metrics:
    md.append(f"- {m['config']}: {m['passed']}/{m['total']} ({m['pass_rate'] * 100:.1f}%)")
md.append("")
md.append("## Observations")
if metrics[0]["pass_rate"] >= metrics[1]["pass_rate"]:
    md.append("- with_skill 在全局安装阻断和边界路由上更稳定。")
else:
    md.append("- baseline 接近 with_skill，需提高断言区分度。")
(base / "benchmark.md").write_text("\n".join(md))

print("ok")
