from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path

from lib import add_common_args, ensure_identity_dir, join_args_text, paths_from_args, write_text


def main() -> int:
    parser = argparse.ArgumentParser(prog="write-memory", add_help=True)
    add_common_args(parser)
    parser.add_argument("type", choices=["ai", "you", "project", "pattern"])
    parser.add_argument("rest", nargs=argparse.REMAINDER)
    ns = parser.parse_args()

    p = paths_from_args(ns)
    ensure_identity_dir(p.mem)

    if ns.type in ("ai", "you"):
        content = join_args_text(ns.rest).strip()
        if not content:
            raise SystemExit("Error: content is empty")
        target = p.identity / ("AI.md" if ns.type == "ai" else "you.md")
        write_text(target, content)
        print(f"Written: {target}")
        print(f"Size: {target.stat().st_size} bytes")
        return 0

    if not ns.rest:
        raise SystemExit("Error: project/pattern requires a name")

    name = ns.rest[0]
    content = join_args_text(ns.rest[1:]).strip()

    if ns.type == "project":
        target = p.deeper_projects / f"{name}.md"
        target.parent.mkdir(parents=True, exist_ok=True)
    else:
        target = p.deeper_patterns / f"{name}.md"
        target.parent.mkdir(parents=True, exist_ok=True)

    if content:
        write_text(target, content)
    else:
        if not target.exists():
            skeleton = "\n".join(
                [
                    f"# {name}",
                    "",
                    f"**Created**: {date.today().isoformat()}",
                    f"**Type**: {ns.type}",
                    "",
                    "## Overview",
                    "",
                    "## Key Details",
                    "",
                    "## Decisions",
                    "",
                    "## Learnings",
                    "",
                ]
            )
            write_text(target, skeleton)

    print(f"Written: {target}")
    print(f"Size: {target.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
