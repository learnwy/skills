from __future__ import annotations

import argparse
from pathlib import Path

from lib import add_common_args, ensure_identity_dir, paths_from_args


def search_file(fp: Path, keyword: str, max_lines: int) -> list[str]:
    out: list[str] = []
    try:
        lines = fp.read_text(encoding="utf-8", errors="replace").splitlines()
    except Exception:
        return out
    k = keyword.casefold()
    for i, line in enumerate(lines, start=1):
        if k in line.casefold():
            out.append(f"{i}:{line}")
            if len(out) >= max_lines:
                break
    return out


def main() -> int:
    parser = argparse.ArgumentParser(prog="recall", add_help=True)
    add_common_args(parser)
    parser.add_argument("keyword")
    ns = parser.parse_args()
    paths = paths_from_args(ns)
    ensure_identity_dir(paths.mem)

    keyword = ns.keyword
    print(f'=== Memory Recall: "{keyword}" ===')
    print("")

    found = False

    def section(title: str, files: list[Path], per_file: int) -> None:
        nonlocal found
        print(f"--- {title} ---")
        any_hit = False
        for fp in files:
            hits = search_file(fp, keyword, per_file)
            if hits:
                any_hit = True
                found = True
                rel = fp if fp.is_absolute() else fp
                print(f"★ {fp.relative_to(paths.mem) if fp.is_relative_to(paths.mem) else fp.name}")
                for h in hits:
                    print(h)
                print("")
        if not any_hit:
            print("(no matches)")
            print("")

    identity_files = sorted((paths.mem / "identity").glob("*.md"))
    section("Identity", identity_files, 3)

    conv_files = sorted((paths.mem / "conversation" / "history").glob("history-*.md"))
    section("Conversation", conv_files, 2)

    archive_files = sorted((paths.mem / "archive" / "by-month").rglob("history-*.md"))
    section("Archive", archive_files, 1)

    deeper_files = sorted((paths.mem / "deeper").rglob("*.md"))
    section("Deeper", deeper_files, 1)

    if not found:
        print("No matches found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
