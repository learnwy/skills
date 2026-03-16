from __future__ import annotations

import argparse
from pathlib import Path

from lib import (
    add_common_args,
    ensure_identity_dir,
    join_args_text,
    next_history_filename,
    paths_from_args,
    read_text,
    write_text,
)


def cmd_start(mem: Path) -> int:
    ensure_identity_dir(mem)
    p = mem / "identity"
    ai = p / "AI.md"
    you = p / "you.md"

    print("=== Memory: Session Start ===")
    print("")
    print("Loading identity...")
    print("")
    print("--- identity/AI.md ---")
    print(read_text(ai) if ai.exists() else "(not found)")
    print("")
    print("--- identity/you.md ---")
    print(read_text(you) if you.exists() else "(not found)")
    print("")
    history_dir = mem / "conversation" / "history"
    conv_count = len(list(history_dir.glob("history-*.md"))) if history_dir.exists() else 0
    print(f"Conversation count: {conv_count}")
    return 0


def cmd_end(mem: Path) -> int:
    ensure_identity_dir(mem)
    print("=== Memory: Session End ===")
    print("")
    history_dir = mem / "conversation" / "history"
    conv_count = len(list(history_dir.glob("history-*.md"))) if history_dir.exists() else 0
    print(f"Current conversations: {conv_count}")
    print("")
    print("To save this conversation:")
    print("  python3 {skill_dir}/scripts/brain.py append-history \"session content here\"")
    return 0


def cmd_status(mem: Path) -> int:
    ensure_identity_dir(mem)
    print("=== Memory Status ===")
    print("")
    print("Identity:")
    for p in sorted((mem / "identity").glob("*.md")):
        if p.is_file():
            print(f"  {p.name}")
    history_dir = mem / "conversation" / "history"
    conv_count = len(list(history_dir.glob("history-*.md"))) if history_dir.exists() else 0
    print(f"Conversations: {conv_count}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(prog="session", add_help=True)
    add_common_args(parser)
    sub = parser.add_subparsers(dest="cmd", required=True)

    sub.add_parser("start")
    sub.add_parser("end")
    p_end_auto = sub.add_parser("end-auto")
    p_end_auto.add_argument("summary", nargs=argparse.REMAINDER)
    sub.add_parser("status")

    ns = parser.parse_args()
    paths = paths_from_args(ns)

    if ns.cmd == "start":
        return cmd_start(paths.mem)
    if ns.cmd == "end":
        return cmd_end(paths.mem)
    if ns.cmd == "status":
        return cmd_status(paths.mem)

    if ns.cmd == "end-auto":
        ensure_identity_dir(paths.mem)
        summary = join_args_text(ns.summary).strip()
        if not summary:
            raise SystemExit("Error: end-auto needs summary")
        cmd_end(paths.mem)
        history_dir = paths.mem / "conversation" / "history"
        history_dir.mkdir(parents=True, exist_ok=True)
        target = history_dir / next_history_filename(history_dir)
        write_text(target, summary)
        print(f"Saved: {target}")
        print(f"Size: {target.stat().st_size} bytes")
        return 0

    raise SystemExit("Unknown command")


if __name__ == "__main__":
    raise SystemExit(main())
