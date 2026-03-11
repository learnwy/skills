#!/usr/bin/env python3
"""
Skill initialization script - Problem-Driven Mode

Usage:
    # Old mode: specify name directly
    python init_skill.py --skill-dir ./ --name my-skill --summary "does X"

    # New mode: describe the problem
    python init_skill.py --skill-dir ./ --problem "I keep writing the same React component boilerplate"
"""
import argparse
import pathlib


def render(template: str, mapping: dict[str, str]) -> str:
    out = template
    for k, v in mapping.items():
        out = out.replace("{{" + k + "}}", v)
    return out


def infer_from_problem(problem: str) -> dict[str, str]:
    """Infer skill metadata from user's problem description."""
    problem_lower = problem.lower()

    # Infer skill type from problem patterns
    if "same" in problem_lower and ("write" in problem_lower or "create" in problem_lower):
        skill_type = "generator"
        triggers = ["new ", "create "]
    elif "same" in problem_lower and ("check" in problem_lower or "verify" in problem_lower):
        skill_type = "validator"
        triggers = ["validate ", "check "]
    elif "same" in problem_lower and ("explain" in problem_lower or "document" in problem_lower):
        skill_type = "informer"
        triggers = ["explain ", "document "]
    elif "same" in problem_lower and ("follow" in problem_lower or "steps" in problem_lower):
        skill_type = "workflow"
        triggers = ["run ", "execute "]
    elif "same" in problem_lower and ("fix" in problem_lower or "refactor" in problem_lower):
        skill_type = "remediation"
        triggers = ["fix ", "refactor "]
    else:
        skill_type = "workflow"
        triggers = ["do ", "run "]

    # Extract keywords from problem for triggers
    words = [w.strip().rstrip('.,!?') for w in problem.split() if len(w) > 3]
    key_triggers = [w for w in words[:5] if w not in {
        'every', 'time', 'have', 'need', 'want', 'keep', 'doing', 'thing',
        'stuff', 'lot', 'much', 'really', 'always', 'never', 'just'
    }]

    # Generate name from problem
    base_name = "_".join(key_triggers[:3]).lower()
    name = f"{base_name}-{skill_type}" if base_name else f"{skill_type}-skill"

    title = name.replace("-", " ").replace("_", " ").title()

    return {
        "SKILL_NAME": name,
        "DESCRIPTION": f"Auto-generated from problem: {problem[:100]}",
        "USE_CASES": f"Addresses: {problem[:150]}",
        "TRIGGER1": key_triggers[0] if len(key_triggers) > 0 else f"{skill_type} workflow",
        "TRIGGER2": key_triggers[1] if len(key_triggers) > 1 else "automate this",
        "TRIGGER3": key_triggers[2] if len(key_triggers) > 2 else "make reusable",
        "EXCEPTIONS": "unrelated one-off requests",
        "SKILL_TITLE": title,
        "BRIEF_INTRO": f"Skill to address: {problem}",
        "CONDITION_1": f"The task involves: {key_triggers[0] if key_triggers else 'repeated work'}",
        "CONDITION_2": "The user needs consistent output format",
        "CONDITION_3": "The task benefits from structured steps",
        "EXCEPTION_1": "The task is unrelated to this domain",
        "EXCEPTION_2": "A different specialized skill is a better fit",
        "STEP_1": "Analyze input",
        "STEP_2": f"Apply {skill_type} logic",
        "STEP_3": "Execute steps",
        "STEP_4": "Return structured output",
        "COL1": "Input",
        "COL2": "Action",
        "COL3": "Output",
        "VAL1": "User request / problem",
        "VAL2": f"Skill {skill_type}",
        "VAL3": "Structured result",
        "ISSUE1": "Missing input",
        "SOLUTION1": "Request required fields",
        "ISSUE2": "Unsupported scope",
        "SOLUTION2": "Explain supported boundaries",
        "REF_1": "Reference",
        "REF_1_FILE": "reference.md",
        "REF_1_DESC": "Domain notes",
        "REF_2": "Template",
        "REF_2_FILE": "template.md",
        "REF_2_DESC": "Output template"
    }


def defaults(skill_name: str, summary: str) -> dict[str, str]:
    """Legacy mode: user provides name directly."""
    title = skill_name.replace("-", " ").title()
    return {
        "SKILL_NAME": skill_name,
        "DESCRIPTION": summary or f"{title} capability",
        "USE_CASES": "users need this workflow repeatedly",
        "TRIGGER1": f"{skill_name} workflow",
        "TRIGGER2": "automate this process",
        "TRIGGER3": "make this reusable",
        "EXCEPTIONS": "unrelated one-off requests",
        "SKILL_TITLE": title,
        "BRIEF_INTRO": "Provide a reusable workflow with clear inputs and outputs.",
        "CONDITION_1": "The task is repetitive and should be standardized.",
        "CONDITION_2": "The user needs consistent output format.",
        "CONDITION_3": "The task benefits from structured steps.",
        "EXCEPTION_1": "The task is unrelated to this domain.",
        "EXCEPTION_2": "A different specialized skill is a better fit.",
        "STEP_1": "Analyze input",
        "STEP_2": "Select workflow path",
        "STEP_3": "Execute steps",
        "STEP_4": "Return structured output",
        "COL1": "Input",
        "COL2": "Action",
        "COL3": "Output",
        "VAL1": "User request",
        "VAL2": "Skill workflow",
        "VAL3": "Structured result",
        "ISSUE1": "Missing input",
        "SOLUTION1": "Request required fields",
        "ISSUE2": "Unsupported scope",
        "SOLUTION2": "Explain supported boundaries",
        "REF_1": "Reference",
        "REF_1_FILE": "reference.md",
        "REF_1_DESC": "Domain notes",
        "REF_2": "Template",
        "REF_2_FILE": "template.md",
        "REF_2_DESC": "Output template"
    }


def main() -> int:
    p = argparse.ArgumentParser(prog="init_skill")
    p.add_argument("--skill-dir", required=True)
    p.add_argument("--name", help="Skill name (use --problem instead for auto-detection)")
    p.add_argument("--summary", default="")
    p.add_argument("--problem", help="Describe the problem - auto-generate skill from problem")
    p.add_argument("--output-root", default="skills")
    args = p.parse_args()

    writer_skill_dir = pathlib.Path(args.skill_dir).resolve()
    tpl = (writer_skill_dir / "assets" / "skill.md.template").read_text(encoding="utf-8")

    # New mode: infer from problem
    if args.problem:
        mapping = infer_from_problem(args.problem)
    # Legacy mode: use provided name
    elif args.name:
        mapping = defaults(args.name, args.summary)
    else:
        p.error("Either --name or --problem is required")

    target_dir = pathlib.Path(args.output_root).resolve() / mapping["SKILL_NAME"]
    target_dir.mkdir(parents=True, exist_ok=True)
    out_file = target_dir / "SKILL.md"
    out_file.write_text(render(tpl, mapping), encoding="utf-8")
    print(str(out_file))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
