#!/usr/bin/env python3
import argparse
import pathlib


def render(template: str, mapping: dict[str, str]) -> str:
    out = template
    for k, v in mapping.items():
        out = out.replace("{{" + k + "}}", v)
    return out


def default_values(name: str, mode: str, description: str, globs: str) -> dict[str, str]:
    always = "true" if mode == "always" else "false"
    if mode == "file" and not globs:
        globs = "*.md"
    if mode in {"intelligent", "manual"}:
        globs = ""
    return {
        "DESCRIPTION": description or f"Rule for {name}",
        "GLOBS": globs,
        "ALWAYS_APPLY": always,
        "RULE_TITLE": name.replace("-", " ").title(),
        "OVERVIEW": "Define concise, actionable behavior constraints for AI.",
        "GUIDELINES": "- Keep rules explicit\n- Use project-relative paths\n- Avoid conflicting instructions",
        "LANG": "markdown",
        "GOOD_EXAMPLE": "# Good\nUse clear, direct guidance.",
        "BAD_EXAMPLE": "# Bad\nUse vague or contradictory guidance.",
        "EXCEPTIONS": "- Keep API fields and file paths unchanged when needed."
    }


def cleanup_frontmatter(text: str) -> str:
    lines = text.splitlines()
    if len(lines) >= 4 and lines[0].strip() == "---":
        if lines[2].strip() == "globs:":
            del lines[2]
    return "\n".join(lines).rstrip() + "\n"


def main() -> int:
    p = argparse.ArgumentParser(prog="init_rule")
    p.add_argument("--skill-dir", required=True)
    p.add_argument("--name", required=True)
    p.add_argument("--mode", choices=["always", "file", "intelligent", "manual"], default="intelligent")
    p.add_argument("--description", default="")
    p.add_argument("--globs", default="")
    p.add_argument("--output-dir", default=".trae/rules")
    args = p.parse_args()

    skill_dir = pathlib.Path(args.skill_dir).resolve()
    template_path = skill_dir / "assets" / "rule.md.template"
    out_dir = pathlib.Path(args.output_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / f"{args.name}.md"

    tpl = template_path.read_text(encoding="utf-8")
    mapping = default_values(args.name, args.mode, args.description, args.globs)
    content = render(tpl, mapping)
    content = cleanup_frontmatter(content)
    out_file.write_text(content, encoding="utf-8")
    print(str(out_file))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
