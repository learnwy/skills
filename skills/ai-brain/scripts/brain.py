from __future__ import annotations

import runpy
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
PY_DIR = ROOT / "py"


def run(script_name: str, argv: list[str]) -> int:
    script_path = PY_DIR / script_name
    if not script_path.is_file():
        raise SystemExit(f"Error: missing script: {script_path}")
    sys.path.insert(0, str(PY_DIR))
    old_argv = sys.argv
    try:
        sys.argv = [str(script_path), *argv]
        runpy.run_path(str(script_path), run_name="__main__")
    finally:
        sys.argv = old_argv
        if sys.path and sys.path[0] == str(PY_DIR):
            sys.path.pop(0)
    return 0


def main() -> int:
    if len(sys.argv) < 2:
        raise SystemExit(
            "Usage: python3 brain.py <command> [args]\n\n"
            "Commands:\n"
            "  session start|end|end-auto|status\n"
            "  write ai|you|project|pattern ...\n"
            "  append-history [-n name] <content>\n"
            "  backup-history [--all|--before YYYY-MM-DD] [--dry-run]\n"
            "  recall <keyword>\n"
            "  summarize\n"
            "  reflection [check|init]\n"
            "  memory-status\n"
            "  memory-config [init|show]\n"
            "  init-memory\n"
            "  read-memory [relative_path]\n"
            "  consolidate project|pattern <name>\n"
        )

    cmd = sys.argv[1]
    args = sys.argv[2:]

    mapping = {
        "session": "session.py",
        "write": "write_memory.py",
        "append-history": "append_history.py",
        "backup-history": "backup_history.py",
        "recall": "recall.py",
        "summarize": "summarize.py",
        "reflection": "reflection.py",
        "memory-status": "memory_status.py",
        "memory-config": "memory_config.py",
        "init-memory": "init_memory.py",
        "read-memory": "read_memory.py",
        "consolidate": "consolidate.py",
    }

    if cmd not in mapping:
        raise SystemExit(f"Error: unknown command: {cmd}")

    return run(mapping[cmd], args)


if __name__ == "__main__":
    raise SystemExit(main())
