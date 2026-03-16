from __future__ import annotations

import argparse
import os
import re
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Iterable


def memory_dir() -> Path:
    return Path.home() / ".learnwy" / "ai" / "memory"


def ensure_identity_dir(mem: Path) -> None:
    identity = mem / "identity"
    if not identity.is_dir():
        raise SystemExit(
            f"Error: Memory not initialized. Run: python3 {Path(__file__).resolve().parent.parent}/brain.py init-memory"
        )


def trim_trailing_undefined(text: str) -> str:
    text = text.rstrip()
    if text == "undefined":
        return ""
    if text.endswith(" undefined"):
        return text[: -len(" undefined")].rstrip()
    return text


def join_args_text(args: list[str]) -> str:
    text = trim_trailing_undefined(" ".join(args))
    if "\\n" in text and "\n" not in text:
        text = text.replace("\\n", "\n")
    return text


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="replace")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content.rstrip("\n") + "\n", encoding="utf-8")


def list_files(patterns: Iterable[Path]) -> list[Path]:
    files: list[Path] = []
    for p in patterns:
        if p.is_file():
            files.append(p)
    return files


def today_str() -> str:
    return date.today().isoformat()


def next_history_filename(history_dir: Path) -> str:
    d = today_str()
    existing = sorted(history_dir.glob(f"history-{d}-*.md"))
    max_n = 0
    for p in existing:
        m = re.match(rf"^history-{re.escape(d)}-(\d+)\.md$", p.name)
        if m:
            max_n = max(max_n, int(m.group(1)))
    return f"history-{d}-{max_n + 1}.md"


def add_common_args(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--mem",
        dest="mem",
        default=str(memory_dir()),
        help="Memory root directory (default: ~/.learnwy/ai/memory)",
    )


@dataclass(frozen=True)
class Paths:
    mem: Path

    @property
    def identity(self) -> Path:
        return self.mem / "identity"

    @property
    def conversation_history(self) -> Path:
        return self.mem / "conversation" / "history"

    @property
    def archive_by_month(self) -> Path:
        return self.mem / "archive" / "by-month"

    @property
    def deeper_projects(self) -> Path:
        return self.mem / "deeper" / "projects"

    @property
    def deeper_patterns(self) -> Path:
        return self.mem / "deeper" / "patterns"


def paths_from_args(args: argparse.Namespace) -> Paths:
    mem = Path(os.path.expanduser(args.mem)).resolve()
    return Paths(mem=mem)
