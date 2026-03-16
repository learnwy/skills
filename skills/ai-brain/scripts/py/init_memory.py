from __future__ import annotations

import argparse
from pathlib import Path

from lib import add_common_args, paths_from_args, write_text


AI_DEFAULT = "\n".join(
    [
        "**Identity**",
        "AI coding partner for wangyang.learnwy. Goal: anticipate needs, handle technical decisions, reduce cognitive load.",
        "",
        "**Core Traits**",
        "Proactive and bold; records mistakes and avoids repetition.",
        "",
        "**Communication**",
        "Chinese for discussion, English for code/technical.",
        "",
        "**Capabilities**",
        "Go, Swift/ObjC, TypeScript, Python; architecture, debugging, skill engineering.",
        "",
        "**Lessons Learned**",
        "(to be filled)",
        "",
    ]
)


YOU_DEFAULT = "\n".join(
    [
        "**Profile**",
        "wangyang.learnwy; iOS engineer at ByteDance; macOS, Trae IDE; primary language Chinese.",
        "",
        "**Preferences**",
        "Concise responses; Chinese primary, English for code; prefers editing over creating new; proactive workflow optimization.",
        "",
        "**Context**",
        "(to be filled)",
        "",
        "**History**",
        "(to be filled)",
        "",
    ]
)


MEMORYRC_DEFAULT = "\n".join(
    [
        "# Memory Manager Configuration",
        "LOAD_ON_START=true",
        "AUTO_SAVE_CONVERSATION=true",
        "AUTO_SAVE_INTERVAL=3",
        "CONSOLIDATE_AFTER=3",
        "CONSOLIDATE_ON_EXIT=true",
        "ENABLE_REFLECTION=true",
        "REFLECTION_INTERVAL=5",
        "MAX_CONVERSATION=5",
        "",
    ]
)


def main() -> int:
    parser = argparse.ArgumentParser(prog="init-memory", add_help=True)
    add_common_args(parser)
    ns = parser.parse_args()
    paths = paths_from_args(ns)

    (paths.mem / "identity").mkdir(parents=True, exist_ok=True)
    (paths.mem / "conversation" / "history").mkdir(parents=True, exist_ok=True)
    (paths.mem / "archive" / "by-month").mkdir(parents=True, exist_ok=True)
    (paths.mem / "deeper" / "projects").mkdir(parents=True, exist_ok=True)
    (paths.mem / "deeper" / "patterns").mkdir(parents=True, exist_ok=True)

    ai = paths.mem / "identity" / "AI.md"
    you = paths.mem / "identity" / "you.md"
    if not ai.exists():
        write_text(ai, AI_DEFAULT)
        print("Created: identity/AI.md")
    if not you.exists():
        write_text(you, YOU_DEFAULT)
        print("Created: identity/you.md")

    cfg = paths.mem / ".memoryrc"
    if not cfg.exists():
        write_text(cfg, MEMORYRC_DEFAULT)
        print("Created: .memoryrc")

    print("")
    print("✓ Memory initialized!")
    print(f"Path: {paths.mem}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
