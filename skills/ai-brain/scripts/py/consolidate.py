from __future__ import annotations

import argparse
from datetime import date

from lib import add_common_args, ensure_identity_dir, paths_from_args, write_text


def main() -> int:
    parser = argparse.ArgumentParser(prog="consolidate", add_help=True)
    add_common_args(parser)
    parser.add_argument("type", choices=["project", "pattern"])
    parser.add_argument("name")
    ns = parser.parse_args()
    paths = paths_from_args(ns)
    ensure_identity_dir(paths.mem)

    if ns.type == "project":
        target = paths.deeper_projects / f"{ns.name}.md"
    else:
        target = paths.deeper_patterns / f"{ns.name}.md"

    if target.exists():
        raise SystemExit(f"Error: {target} already exists.")

    content = "\n".join(
        [
            f"# {ns.name}",
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
            "## Related Conversations",
            "",
        ]
    )
    write_text(target, content)
    print(f"Created: {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
