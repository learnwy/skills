from __future__ import annotations

import argparse
from pathlib import Path

from lib import add_common_args, ensure_identity_dir, paths_from_args


def fmt_size(n: int) -> str:
    if n < 1024:
        return f"{n} B"
    if n < 1024 * 1024:
        return f"{n / 1024:.1f} KB"
    return f"{n / (1024 * 1024):.1f} MB"


def dir_size(p: Path) -> int:
    total = 0
    if not p.exists():
        return 0
    for fp in p.rglob("*"):
        if fp.is_file():
            total += fp.stat().st_size
    return total


def main() -> int:
    parser = argparse.ArgumentParser(prog="memory-status", add_help=True)
    add_common_args(parser)
    ns = parser.parse_args()
    paths = paths_from_args(ns)

    print("=== Memory Status ===")
    print("")

    if not (paths.mem / "identity").exists():
        print(f"⚠️  Memory not initialized. Run: python3 {Path(__file__).resolve().parent.parent}/brain.py init-memory")
        return 0

    ensure_identity_dir(paths.mem)

    print("--- Identity (Working Memory) ---")
    for fp in sorted((paths.mem / "identity").glob("*.md")):
        if fp.is_file():
            print(f"  {fp.name}: {fmt_size(fp.stat().st_size)}")
    print("")

    history_dir = paths.mem / "conversation" / "history"
    print("--- Conversation (Short-term) ---")
    count = len(list(history_dir.glob("history-*.md"))) if history_dir.exists() else 0
    print(f"  Files: {count} ({fmt_size(dir_size(history_dir))})")
    if count:
        newest = max(history_dir.glob("history-*.md"), key=lambda p: p.stat().st_mtime)
        print(f"  Newest: {newest.name}")
    print("")

    archive_dir = paths.mem / "archive" / "by-month"
    print("--- Archive (Long-term) ---")
    archive_count = len(list(archive_dir.rglob("history-*.md"))) if archive_dir.exists() else 0
    months = len([p for p in archive_dir.iterdir() if p.is_dir()]) if archive_dir.exists() else 0
    print(f"  Files: {archive_count} ({fmt_size(dir_size(archive_dir))})")
    print(f"  Months: {months}")
    print("")

    deeper_dir = paths.mem / "deeper"
    print("--- Deeper (Deep Memory) ---")
    proj = deeper_dir / "projects"
    pat = deeper_dir / "patterns"
    proj_count = len(list(proj.glob("*.md"))) if proj.exists() else 0
    pat_count = len(list(pat.glob("*.md"))) if pat.exists() else 0
    print(f"  Projects: {proj_count}")
    print(f"  Patterns: {pat_count}")
    print("")
    print(f"Memory path: {paths.mem}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
