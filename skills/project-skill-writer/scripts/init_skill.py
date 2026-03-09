#!/usr/bin/env python3
import argparse
import pathlib


def render(template: str, mapping: dict[str, str]) -> str:
    out = template
    for k, v in mapping.items():
        out = out.replace("{{" + k + "}}", v)
    return out


def defaults(skill_name: str, summary: str) -> dict[str, str]:
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
    p.add_argument("--name", required=True)
    p.add_argument("--summary", default="")
    p.add_argument("--output-root", default="skills")
    args = p.parse_args()

    writer_skill_dir = pathlib.Path(args.skill_dir).resolve()
    tpl = (writer_skill_dir / "assets" / "skill.md.template").read_text(encoding="utf-8")
    target_dir = pathlib.Path(args.output_root).resolve() / args.name
    target_dir.mkdir(parents=True, exist_ok=True)
    out_file = target_dir / "SKILL.md"
    out_file.write_text(render(tpl, defaults(args.name, args.summary)), encoding="utf-8")
    print(str(out_file))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
