#!/usr/bin/env python3
"""
Vocabulary Manager - Core CRUD operations for words and phrases.
Data stored in ~/.english-learner/
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path

DATA_ROOT = Path.home() / ".english-learner"
WORDS_DIR = DATA_ROOT / "words"
PHRASES_DIR = DATA_ROOT / "phrases"
HISTORY_DIR = DATA_ROOT / "history"
STATS_FILE = DATA_ROOT / "stats.json"

def ensure_dirs():
    """Create data directories if they don't exist."""
    for d in [WORDS_DIR, PHRASES_DIR, HISTORY_DIR]:
        d.mkdir(parents=True, exist_ok=True)

def get_word_file(word: str) -> Path:
    """Get file path for a word (grouped by first 2 letters)."""
    prefix = word[:2].lower() if len(word) >= 2 else word[0].lower() + "_"
    return WORDS_DIR / f"{prefix}.json"

def get_phrase_file(phrase: str) -> Path:
    """Get file path for a phrase (by first word)."""
    first_word = phrase.split()[0].lower() if phrase else "misc"
    return PHRASES_DIR / f"{first_word}.json"

def load_json(filepath: Path) -> dict:
    """Load JSON file, return empty dict if not exists."""
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_json(filepath: Path, data: dict):
    """Save data to JSON file."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_word(word: str) -> dict | None:
    """Get a word's data. Returns None if not found."""
    filepath = get_word_file(word)
    data = load_json(filepath)
    key = word.lower()
    return data.get(key)

def save_word(word: str, definition: str, phonetic: str = "", 
              examples: list = None, pos: str = "", synonyms: list = None,
              antonyms: list = None) -> dict:
    """Save or update a word."""
    ensure_dirs()
    filepath = get_word_file(word)
    data = load_json(filepath)
    key = word.lower()
    
    now = datetime.now().isoformat()
    existing = data.get(key, {})
    
    entry = {
        "word": word.lower(),
        "definition": definition,
        "phonetic": phonetic or existing.get("phonetic", ""),
        "pos": pos or existing.get("pos", ""),
        "examples": examples or existing.get("examples", []),
        "synonyms": synonyms or existing.get("synonyms", []),
        "antonyms": antonyms or existing.get("antonyms", []),
        "created_at": existing.get("created_at", now),
        "updated_at": now,
        "lookup_count": existing.get("lookup_count", 0),
        "mastery": existing.get("mastery", 0),
    }
    
    data[key] = entry
    save_json(filepath, data)
    return entry

def increment_lookup(word: str) -> int:
    """Increment lookup count for a word. Returns new count."""
    filepath = get_word_file(word)
    data = load_json(filepath)
    key = word.lower()
    
    if key in data:
        data[key]["lookup_count"] = data[key].get("lookup_count", 0) + 1
        data[key]["last_lookup"] = datetime.now().isoformat()
        save_json(filepath, data)
        return data[key]["lookup_count"]
    return 0

def get_phrase(phrase: str) -> dict | None:
    """Get a phrase's data. Returns None if not found."""
    filepath = get_phrase_file(phrase)
    data = load_json(filepath)
    key = phrase.lower()
    return data.get(key)

def save_phrase(phrase: str, definition: str, phonetic: str = "",
                examples: list = None, literal: str = "") -> dict:
    """Save or update a phrase."""
    ensure_dirs()
    filepath = get_phrase_file(phrase)
    data = load_json(filepath)
    key = phrase.lower()
    
    now = datetime.now().isoformat()
    existing = data.get(key, {})
    
    entry = {
        "phrase": phrase.lower(),
        "definition": definition,
        "phonetic": phonetic or existing.get("phonetic", ""),
        "literal": literal or existing.get("literal", ""),
        "examples": examples or existing.get("examples", []),
        "created_at": existing.get("created_at", now),
        "updated_at": now,
        "lookup_count": existing.get("lookup_count", 0),
        "mastery": existing.get("mastery", 0),
    }
    
    data[key] = entry
    save_json(filepath, data)
    return entry

def log_query(query: str, query_type: str):
    """Log a query to history."""
    ensure_dirs()
    today = datetime.now().strftime("%Y-%m-%d")
    filepath = HISTORY_DIR / f"{today}.json"
    
    history = load_json(filepath)
    if "queries" not in history:
        history["queries"] = []
    
    history["queries"].append({
        "query": query,
        "type": query_type,
        "timestamp": datetime.now().isoformat()
    })
    
    save_json(filepath, history)

def update_mastery(word_or_phrase: str, is_word: bool, correct: bool) -> int:
    """Update mastery level based on quiz result. Returns new mastery."""
    if is_word:
        filepath = get_word_file(word_or_phrase)
    else:
        filepath = get_phrase_file(word_or_phrase)
    
    data = load_json(filepath)
    key = word_or_phrase.lower()
    
    if key in data:
        current = data[key].get("mastery", 0)
        if correct:
            data[key]["mastery"] = min(100, current + 10)
        else:
            data[key]["mastery"] = max(0, current - 5)
        save_json(filepath, data)
        return data[key]["mastery"]
    return 0

def get_stats() -> dict:
    """Get overall learning statistics."""
    stats = {
        "total_words": 0,
        "total_phrases": 0,
        "total_lookups": 0,
        "mastered_words": 0,
        "learning_words": 0,
        "new_words": 0,
    }
    
    for f in WORDS_DIR.glob("*.json"):
        data = load_json(f)
        for entry in data.values():
            stats["total_words"] += 1
            stats["total_lookups"] += entry.get("lookup_count", 0)
            mastery = entry.get("mastery", 0)
            if mastery >= 80:
                stats["mastered_words"] += 1
            elif mastery >= 30:
                stats["learning_words"] += 1
            else:
                stats["new_words"] += 1
    
    for f in PHRASES_DIR.glob("*.json"):
        data = load_json(f)
        stats["total_phrases"] += len(data)
    
    return stats

def main():
    """CLI interface for vocab_manager."""
    if len(sys.argv) < 2:
        print("Usage: vocab_manager.py <command> [args]")
        print("Commands: get_word, save_word, get_phrase, save_phrase, log_query, stats")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "get_word" and len(sys.argv) >= 3:
        result = get_word(sys.argv[2])
        if result:
            increment_lookup(sys.argv[2])
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(json.dumps({"error": "not_found"}))
    
    elif cmd == "get_phrase" and len(sys.argv) >= 3:
        phrase = " ".join(sys.argv[2:])
        result = get_phrase(phrase)
        if result:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(json.dumps({"error": "not_found"}))
    
    elif cmd == "save_word" and len(sys.argv) >= 4:
        word = sys.argv[2]
        definition = sys.argv[3]
        phonetic = sys.argv[4] if len(sys.argv) > 4 else ""
        examples = json.loads(sys.argv[5]) if len(sys.argv) > 5 else []
        result = save_word(word, definition, phonetic, examples)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "save_phrase" and len(sys.argv) >= 4:
        phrase = sys.argv[2]
        definition = sys.argv[3]
        phonetic = sys.argv[4] if len(sys.argv) > 4 else ""
        examples = json.loads(sys.argv[5]) if len(sys.argv) > 5 else []
        result = save_phrase(phrase, definition, phonetic, examples)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "log_query" and len(sys.argv) >= 4:
        log_query(sys.argv[2], sys.argv[3])
        print(json.dumps({"status": "logged"}))
    
    elif cmd == "stats":
        print(json.dumps(get_stats(), ensure_ascii=False, indent=2))
    
    elif cmd == "update_mastery" and len(sys.argv) >= 5:
        item = sys.argv[2]
        is_word = sys.argv[3].lower() == "true"
        correct = sys.argv[4].lower() == "true"
        new_mastery = update_mastery(item, is_word, correct)
        print(json.dumps({"mastery": new_mastery}))
    
    else:
        print(json.dumps({"error": "invalid_command"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
