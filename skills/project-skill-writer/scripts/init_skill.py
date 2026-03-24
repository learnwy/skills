#!/usr/bin/env python3
"""
Skill initialization script - Problem-Driven Mode

Usage:
    # Problem mode (recommended): infer skill metadata from problem description
    python init_skill.py --skill-dir ./ --problem "I keep writing the same React component boilerplate"

    # Legacy mode: specify name directly
    python init_skill.py --skill-dir ./ --name my-skill --summary "does X"
"""
import argparse
import pathlib
import re
import sys

STOP_WORDS = frozenset({
    "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "shall",
    "should", "may", "might", "must", "can", "could", "need", "want",
    "keep", "doing", "thing", "stuff", "every", "time", "always", "never",
    "just", "really", "very", "much", "many", "some", "each", "also",
    "same", "like", "that", "this", "with", "from", "into", "about",
    "when", "where", "which", "what", "make", "made",
})

SKILL_TYPE_PATTERNS = [
    (["write", "create", "generate", "boilerplate", "scaffold", "template"], "generator"),
    (["check", "verify", "validate", "lint", "scan", "audit"], "validator"),
    (["explain", "document", "describe", "summarize", "annotate"], "informer"),
    (["follow", "step", "process", "deploy", "release", "pipeline", "workflow"], "workflow"),
    (["fix", "refactor", "repair", "clean", "migrate", "upgrade"], "remediation"),
]

TRIGGER_PREFIXES = {
    "generator": ["create ", "generate ", "new "],
    "validator": ["validate ", "check ", "scan "],
    "informer": ["explain ", "document ", "describe "],
    "workflow": ["run ", "execute ", "start "],
    "remediation": ["fix ", "refactor ", "clean "],
}


def render(template: str, mapping: dict[str, str]) -> str:
    out = template
    for k, v in mapping.items():
        out = out.replace("{{" + k + "}}", v)
    return out


def extract_keywords(text: str, max_count: int = 5) -> list[str]:
    words = re.findall(r"[a-zA-Z]{4,}", text.lower())
    seen: set[str] = set()
    result: list[str] = []
    for w in words:
        if w not in STOP_WORDS and w not in seen:
            seen.add(w)
            result.append(w)
            if len(result) >= max_count:
                break
    return result


def classify_problem(text: str) -> str:
    text_lower = text.lower()
    scores: dict[str, int] = {}
    for keywords, skill_type in SKILL_TYPE_PATTERNS:
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[skill_type] = score
    if scores:
        return max(scores, key=scores.get)
    return "workflow"


def slugify(words: list[str], max_parts: int = 3) -> str:
    return "-".join(words[:max_parts])


def infer_from_problem(problem: str) -> dict[str, str]:
    skill_type = classify_problem(problem)
    keywords = extract_keywords(problem)
    triggers = TRIGGER_PREFIXES.get(skill_type, ["do ", "run "])

    base_slug = slugify(keywords) if keywords else skill_type
    name = f"{base_slug}-{skill_type}"
    title = name.replace("-", " ").replace("_", " ").title()

    trigger_kws = keywords[:3] if keywords else [skill_type]

    return {
        "SKILL_NAME": name,
        "DESCRIPTION": f"Addresses: {problem[:120]}",
        "USE_CASES": f"{problem[:150]}",
        "TRIGGER1": trigger_kws[0] if len(trigger_kws) > 0 else triggers[0].strip(),
        "TRIGGER2": trigger_kws[1] if len(trigger_kws) > 1 else triggers[1].strip() if len(triggers) > 1 else "automate",
        "TRIGGER3": trigger_kws[2] if len(trigger_kws) > 2 else triggers[2].strip() if len(triggers) > 2 else "reusable",
        "EXCEPTIONS": "unrelated one-off requests",
        "SKILL_TITLE": title,
        "BRIEF_INTRO": f"Skill to address: {problem}",
        "CONDITION_1": f"The task involves: {keywords[0] if keywords else 'repeated work'}",
        "CONDITION_2": "The user needs consistent output format",
        "CONDITION_3": "The task benefits from structured steps",
        "EXCEPTION_1": "The task is unrelated to this domain",
        "EXCEPTION_2": "A different specialized skill is a better fit",
        "STEP_1": "Analyze input",
        "STEP_2": f"Apply {skill_type} logic",
        "STEP_3": "Execute steps",
        "STEP_4": "Verify output",
        "COL1": "Input",
        "COL2": "Action",
        "COL3": "Output",
        "VAL1": "User request",
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
        "REF_2_DESC": "Output template",
    }


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
        "STEP_4": "Verify output",
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
        "REF_2_DESC": "Output template",
    }


def validate_output_path(path: pathlib.Path) -> None:
    home = pathlib.Path.home()
    resolved = path.resolve()
    global_dirs = [
        home / ".trae",
        home / ".trae-cn",
        home / ".claude",
        home / ".cursor",
    ]
    for gd in global_dirs:
        if str(resolved).startswith(str(gd)):
            print(f"ERROR: Output path {resolved} is inside global directory {gd}. Use a project-relative path.", file=sys.stderr)
            sys.exit(1)


def main() -> int:
    p = argparse.ArgumentParser(prog="init_skill")
    p.add_argument("--skill-dir", required=True, help="Path to this skill's own directory (for loading template)")
    p.add_argument("--name", help="Skill name (use --problem instead for auto-detection)")
    p.add_argument("--summary", default="")
    p.add_argument("--problem", help="Describe the problem - auto-generate skill from problem")
    p.add_argument("--output-root", default=".trae/skills", help="Project-relative output root (default: .trae/skills)")
    args = p.parse_args()

    writer_skill_dir = pathlib.Path(args.skill_dir).resolve()
    tpl_path = writer_skill_dir / "assets" / "skill.md.template"
    if not tpl_path.exists():
        print(f"ERROR: Template not found at {tpl_path}", file=sys.stderr)
        return 1

    tpl = tpl_path.read_text(encoding="utf-8")

    if args.problem:
        mapping = infer_from_problem(args.problem)
    elif args.name:
        mapping = defaults(args.name, args.summary)
    else:
        p.error("Either --name or --problem is required")
        return 1

    target_dir = pathlib.Path(args.output_root).resolve() / mapping["SKILL_NAME"]
    validate_output_path(target_dir)

    target_dir.mkdir(parents=True, exist_ok=True)
    out_file = target_dir / "SKILL.md"
    out_file.write_text(render(tpl, mapping), encoding="utf-8")
    print(str(out_file))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
