import json
from pathlib import Path

base = Path("/Users/wangyang.learnwy/learnwy/learnwy/skills/project-skill-writer-workspace/iteration-1")

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
    3: [
        ("拦截并修正绝对路径污染", lambda t: ("/Users/foo/bar" in t and ("修正" in t or "替换" in t or "reject" in t.lower() or "拒绝" in t)) or ("绝对路径" in t and ("禁止" in t or "拒绝" in t))),
        ("保持 prerequisites gate 不可绕过", lambda t: ("prerequisite" in t.lower() and ("不可绕过" in t or "must" in t.lower() or "required" in t.lower())) or ("前置依赖" in t and ("必须" in t or "不可绕过" in t))),
        ("输出项目内相对路径版本的修正内容", lambda t: ("相对路径" in t or "./" in t or "{project_root}" in t) and "~/.trae/skills" not in t),
    ],
}

rows = []
for eval_id in [1, 2, 3]:
    for mode in ["with_skill", "baseline"]:
        out = base / f"eval-{eval_id}" / mode / "outputs"
        md_files = list(out.glob("*.md"))
        text = "\n".join(p.read_text() for p in md_files)
        expectations = []
        for name, fn in checks[eval_id]:
            try:
                passed = bool(fn(text))
            except Exception:
                passed = False
            expectations.append(
                {"text": name, "passed": passed, "evidence": "matched" if passed else "missing signal"}
            )
        grading = {
            "run_id": f"eval-{eval_id}-{mode}",
            "expectations": expectations,
            "pass_count": sum(x["passed"] for x in expectations),
            "total": len(expectations),
        }
        (base / f"eval-{eval_id}" / mode / "grading.json").write_text(
            json.dumps(grading, ensure_ascii=False, indent=2)
        )
        rows.append(grading)

summary = []
for mode in ["with_skill", "baseline"]:
    m = [r for r in rows if r["run_id"].endswith(mode)]
    passed = sum(r["pass_count"] for r in m)
    total = sum(r["total"] for r in m)
    summary.append(
        {
            "config": mode,
            "passed": passed,
            "total": total,
            "pass_rate": round(passed / total, 4) if total else 0,
        }
    )

benchmark = {"skill_name": "project-skill-writer", "iteration": 1, "metrics": summary, "runs": rows}
(base / "benchmark.json").write_text(json.dumps(benchmark, ensure_ascii=False, indent=2))

lines = ["# Iteration 1 Benchmark", ""]
for item in summary:
    lines.append(f"- {item['config']}: {item['passed']}/{item['total']} ({item['pass_rate'] * 100:.1f}%)")
lines.append("")
lines.append("## Observations")
if summary[0]["pass_rate"] >= summary[1]["pass_rate"]:
    lines.append("- with_skill 在路径边界与前置依赖表达上整体更稳。")
else:
    lines.append("- baseline 与 with_skill 接近，需引入更具区分度断言。")
(base / "benchmark.md").write_text("\n".join(lines))

print("ok")
