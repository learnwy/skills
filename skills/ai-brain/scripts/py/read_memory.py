from __future__ import annotations

import argparse
from pathlib import Path

from lib import add_common_args, ensure_identity_dir, paths_from_args, read_text


def main() -> int:
    parser = argparse.ArgumentParser(prog="read-memory", add_help=True)
    add_common_args(parser)
    parser.add_argument("file", nargs="?", default="", help="Relative path under memory root")
    ns = parser.parse_args()
    paths = paths_from_args(ns)
    ensure_identity_dir(paths.mem)

    if not ns.file:
        print("=== Memory Files ===")
        print("")
        for title, p in [
            ("Identity", paths.mem / "identity"),
            ("Conversation", paths.mem / "conversation" / "history"),
            ("Archive", paths.mem / "archive" / "by-month"),
            ("Deeper", paths.mem / "deeper"),
        ]:
            print(f"{title}:")
            if p.exists():
                for fp in sorted(p.rglob("*.md")):
                    if fp.is_file():
                        print(f"  {fp}")
            print("")
        return 0

    fp = Path(ns.file)
    target = fp if fp.is_absolute() else (paths.mem / fp)
    if not target.is_file():
        raise SystemExit(f"Error: File not found: {target}")
    print(f"=== {target} ===")
    print("")
    print(read_text(target))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
