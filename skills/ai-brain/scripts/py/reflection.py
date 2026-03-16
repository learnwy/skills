from __future__ import annotations

import argparse

from lib import add_common_args, ensure_identity_dir, paths_from_args


def main() -> int:
    parser = argparse.ArgumentParser(prog="reflection", add_help=True)
    add_common_args(parser)
    parser.add_argument("cmd", choices=["check", "init"], nargs="?", default="check")
    ns = parser.parse_args()
    paths = paths_from_args(ns)
    ensure_identity_dir(paths.mem)

    history_dir = paths.mem / "conversation" / "history"
    conv_count = len(list(history_dir.glob("history-*.md"))) if history_dir.exists() else 0

    if ns.cmd == "check":
        interval = 5
        cfg = paths.mem / ".memoryrc"
        if cfg.exists():
            txt = cfg.read_text(encoding="utf-8", errors="replace")
            for line in txt.splitlines():
                if line.strip().startswith("REFLECTION_INTERVAL="):
                    try:
                        interval = int(line.split("=", 1)[1].strip())
                    except Exception:
                        interval = 5
        if conv_count >= interval:
            print(f"REFLECTION_NEEDED:{conv_count}")
            return 1
        print(f"OK:{conv_count} conversations since last reflection")
        return 0

    print("=== AI Self-Reflection ===")
    print("")
    if not history_dir.exists():
        print("No conversation history found.")
        return 0
    recent = sorted(history_dir.glob("history-*.md"), key=lambda p: p.stat().st_mtime, reverse=True)[:5]
    print("Recent conversations:")
    for fp in recent:
        print(f"  - {fp.name}")
    print("")
    print("Reflection prompts:")
    print("1. What patterns did I notice in user's behavior?")
    print("2. What mistakes did I make? How to avoid?")
    print("3. What new things did I learn about user?")
    print("4. What can I improve for next session?")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
