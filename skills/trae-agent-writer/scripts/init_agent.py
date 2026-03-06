#!/usr/bin/env python3
import argparse
import pathlib


def render(template: str, mapping: dict[str, str]) -> str:
    out = template
    for k, v in mapping.items():
        out = out.replace("{{" + k + "}}", v)
    return out


def defaults(agent_name: str, role: str) -> dict[str, str]:
    return {
        "AGENT_NAME": agent_name.replace("-", " ").title(),
        "ONE_SENTENCE_ROLE": role or "Perform a single isolated task with structured output.",
        "EXPANDED_ROLE_DESCRIPTION": "Handle one focused workflow and return deterministic results.",
        "NEGATIVE_CONSTRAINT_1": "Do NOT broaden scope",
        "EXPLANATION_1": "Stay within the requested task.",
        "NEGATIVE_CONSTRAINT_2": "Do NOT infer missing critical inputs",
        "EXPLANATION_2": "Return explicit missing-input error instead.",
        "NEGATIVE_CONSTRAINT_3": "Do NOT output unstructured text only",
        "EXPLANATION_3": "Always follow the defined output schema.",
        "ALLOWED_OUTPUT_TYPES": "JSON summary and evidence list",
        "INPUT_1": "task_input",
        "INPUT_1_DESCRIPTION": "Primary task payload",
        "INPUT_2": "constraints",
        "INPUT_2_DESCRIPTION": "Rules and boundaries",
        "OUTPUT_PATH": "output_path",
        "FIRST_ACTION_TITLE": "Read Input",
        "SUBSTEP_1": "Parse task payload",
        "SUBSTEP_2": "Validate required fields",
        "SUBSTEP_3": "Prepare execution plan",
        "SECOND_ACTION_TITLE": "Execute",
        "THIRD_ACTION_TITLE": "Evaluate Items",
        "ITEM": "item",
        "SUB_ACTION_A": "Assess",
        "SUB_ACTION_B": "Record evidence",
        "DETAIL": "Use objective criteria",
        "MAIN_FIELD": "results",
        "ITEM_FIELD_1": "text",
        "ITEM_FIELD_2": "passed",
        "ITEM_FIELD_3": "evidence",
        "DESCRIPTION": "description",
        "EVIDENCE_PLACEHOLDER": "quoted evidence",
        "SUMMARY_FIELD_1": "passed_count",
        "SUMMARY_FIELD_2": "total_count",
        "SUMMARY_RATE": "pass_rate",
        "FIELD_DESCRIPTION": "field description",
        "GUIDELINE_1_QUALITY": "objective",
        "GUIDELINE_1_EXPLANATION": "Judge by evidence only.",
        "GUIDELINE_2_QUALITY": "consistent",
        "GUIDELINE_2_EXPLANATION": "Apply the same criteria to all items.",
        "GUIDELINE_3_QUALITY": "traceable",
        "GUIDELINE_3_EXPLANATION": "Include explicit evidence.",
        "GUIDELINE_4_VERB": "Stay scoped",
        "GUIDELINE_4_EXPLANATION": "Do not add unrelated analysis."
    }


def main() -> int:
    p = argparse.ArgumentParser(prog="init_agent")
    p.add_argument("--skill-dir", required=True)
    p.add_argument("--name", required=True)
    p.add_argument("--role", default="")
    p.add_argument("--output-dir", default="agents")
    args = p.parse_args()

    writer_skill_dir = pathlib.Path(args.skill_dir).resolve()
    tpl = (writer_skill_dir / "assets" / "agent.md.template").read_text(encoding="utf-8")
    out_dir = pathlib.Path(args.output_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{args.name}.md"
    out_file.write_text(render(tpl, defaults(args.name, args.role)), encoding="utf-8")
    print(str(out_file))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
