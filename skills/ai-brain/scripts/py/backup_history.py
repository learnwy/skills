from __future__ import annotations

import argparse
import re
from pathlib import Path

from lib import add_common_args, ensure_identity_dir, paths_from_args


def month_dir_for_date(d: str) -> str:
    return f"{d[0:4]}-{d[5:7]}"


def main() -> int:
    parser = argparse.ArgumentParser(prog="backup-history", add_help=True)
    add_common_args(parser)
    parser.add_argument("--all", action="store_true")
    parser.add_argument("--before", dest="before", default="", help="YYYY-MM-DD")
    parser.add_argument("--dry-run", action="store_true")
    ns, extra = parser.parse_known_args()

    paths = paths_from_args(ns)
    ensure_identity_dir(paths.mem)

    history_dir = paths.mem / "conversation" / "history"
    if not history_dir.exists():
        print("No conversation directory.")
        return 0

    archive_dir = paths.mem / "archive" / "by-month"
    archive_dir.mkdir(parents=True, exist_ok=True)

    archived = 0
    for fp in sorted(history_dir.glob("history-*.md")):
        m = re.match(r"^history-(\d{4}-\d{2}-\d{2})-(\d+)\.md$", fp.name)
        if not m:
            continue
        file_date = m.group(1)
        should = False
        if ns.all:
            should = True
        elif ns.before and file_date < ns.before:
            should = True
        if not should:
            continue

        month = month_dir_for_date(file_date)
        target_dir = archive_dir / month
        target_dir.mkdir(parents=True, exist_ok=True)
        if ns.dry_run:
            print(f"[DRY-RUN] Would move: {fp.name} → {month}/")
        else:
            fp.rename(target_dir / fp.name)
            print(f"Archived: {fp.name} → {month}/")
        archived += 1

    if ns.dry_run:
        print("")
        print(f"Dry run: {archived} file(s) would be archived.")
    else:
        print("")
        print(f"✓ Archived {archived} file(s) to {archive_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
