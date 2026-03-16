from __future__ import annotations

import argparse

from lib import add_common_args, ensure_identity_dir, paths_from_args


def main() -> int:
    parser = argparse.ArgumentParser(prog="summarize", add_help=True)
    add_common_args(parser)
    ns = parser.parse_args()
    paths = paths_from_args(ns)
    ensure_identity_dir(paths.mem)

    history_dir = paths.mem / "conversation" / "history"
    if not history_dir.exists():
        print("No conversation history found.")
        return 0

    files = sorted(history_dir.glob("history-*.md"), key=lambda p: p.stat().st_mtime, reverse=True)[:3]
    if not files:
        print("No conversation files found.")
        return 0

    print("=== Memory Summarize ===")
    print("")
    print(f"Reading last {len(files)} conversations...")
    for fp in files:
        print(f"- {fp.name}")
    print("")
    print("Review these conversations and update identity manually:")
    print("  python3 {skill_dir}/scripts/brain.py write ai \"...\"")
    print("  python3 {skill_dir}/scripts/brain.py write you \"...\"")
    print("")
    print("Then archive:")
    print("  python3 {skill_dir}/scripts/brain.py backup-history --all")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
