from __future__ import annotations

import argparse
from pathlib import Path

from lib import add_common_args, memory_dir, paths_from_args, write_text


DEFAULT_CONFIG = "\n".join(
    [
        "# Memory Manager Configuration",
        "",
        "# Load Triggers",
        "LOAD_ON_START=true",
        "",
        "# Save Triggers",
        "AUTO_SAVE_CONVERSATION=true",
        "AUTO_SAVE_INTERVAL=3",
        "",
        "# Consolidation",
        "CONSOLIDATE_AFTER=3",
        "CONSOLIDATE_ON_EXIT=true",
        "",
        "# Reflection",
        "ENABLE_REFLECTION=true",
        "REFLECTION_INTERVAL=5",
        "",
        "# Limits",
        "MAX_CONVERSATION=5",
        "",
    ]
)


def main() -> int:
    parser = argparse.ArgumentParser(prog="memory-config", add_help=True)
    add_common_args(parser)
    parser.add_argument("cmd", choices=["init", "show"], nargs="?", default="show")
    ns = parser.parse_args()
    paths = paths_from_args(ns)
    cfg = paths.mem / ".memoryrc"

    if ns.cmd == "init":
        if not cfg.exists():
            cfg.parent.mkdir(parents=True, exist_ok=True)
            write_text(cfg, DEFAULT_CONFIG)
            print(f"Created: {cfg}")
        return 0

    print("=== Memory Configuration ===")
    print("")
    if cfg.exists():
        print(cfg.read_text(encoding="utf-8", errors="replace").rstrip())
    else:
        print("(no config found)")
        print(f"Default path: {cfg}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
