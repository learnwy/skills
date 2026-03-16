from __future__ import annotations

import argparse
from pathlib import Path

from lib import add_common_args, ensure_identity_dir, join_args_text, next_history_filename, paths_from_args, write_text


def main() -> int:
    parser = argparse.ArgumentParser(prog="append-history", add_help=True)
    add_common_args(parser)
    parser.add_argument("-n", "--name", dest="name", default="", help="Custom session name (suffix)")
    parser.add_argument("content", nargs=argparse.REMAINDER)
    ns = parser.parse_args()

    p = paths_from_args(ns)
    ensure_identity_dir(p.mem)

    content = join_args_text(ns.content).strip()
    if not content:
        raise SystemExit("Error: content is empty")

    p.conversation_history.mkdir(parents=True, exist_ok=True)
    if ns.name:
        filename = f"history-{ns.name}.md"
    else:
        filename = next_history_filename(p.conversation_history)

    target = p.conversation_history / filename
    write_text(target, content)

    print(f"Saved: {target}")
    print(f"Size: {target.stat().st_size} bytes")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
