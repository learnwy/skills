#!/usr/bin/env python3
"""
Quiz Manager - Generate quizzes and track learning progress.
"""

import json
import os
import sys
import random
from datetime import datetime
from pathlib import Path

DATA_ROOT = Path.home() / ".english-learner"
WORDS_DIR = DATA_ROOT / "words"
PHRASES_DIR = DATA_ROOT / "phrases"

def load_json(filepath: Path) -> dict:
    """Load JSON file, return empty dict if not exists."""
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def get_all_words() -> list:
    """Get all words from storage."""
    words = []
    if WORDS_DIR.exists():
        for f in WORDS_DIR.glob("*.json"):
            data = load_json(f)
            words.extend(data.values())
    return words

def get_all_phrases() -> list:
    """Get all phrases from storage."""
    phrases = []
    if PHRASES_DIR.exists():
        for f in PHRASES_DIR.glob("*.json"):
            data = load_json(f)
            phrases.extend(data.values())
    return phrases

def generate_quiz(count: int = 10, quiz_type: str = "all", 
                  focus: str = "low_mastery") -> list:
    """
    Generate a quiz.
    
    Args:
        count: Number of questions
        quiz_type: "word", "phrase", or "all"
        focus: "low_mastery", "high_lookup", "random", "new"
    
    Returns:
        List of quiz items
    """
    items = []
    
    if quiz_type in ["word", "all"]:
        items.extend([{**w, "type": "word"} for w in get_all_words()])
    
    if quiz_type in ["phrase", "all"]:
        items.extend([{**p, "type": "phrase"} for p in get_all_phrases()])
    
    if not items:
        return []
    
    if focus == "low_mastery":
        items.sort(key=lambda x: x.get("mastery", 0))
    elif focus == "high_lookup":
        items.sort(key=lambda x: x.get("lookup_count", 0), reverse=True)
    elif focus == "new":
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    else:
        random.shuffle(items)
    
    selected = items[:count]
    
    quiz = []
    for item in selected:
        if item["type"] == "word":
            quiz.append({
                "id": item["word"],
                "type": "word",
                "question": item["word"],
                "answer": item["definition"],
                "phonetic": item.get("phonetic", ""),
                "examples": item.get("examples", []),
                "mastery": item.get("mastery", 0),
                "lookup_count": item.get("lookup_count", 0),
            })
        else:
            quiz.append({
                "id": item["phrase"],
                "type": "phrase",
                "question": item["phrase"],
                "answer": item["definition"],
                "phonetic": item.get("phonetic", ""),
                "examples": item.get("examples", []),
                "mastery": item.get("mastery", 0),
                "lookup_count": item.get("lookup_count", 0),
            })
    
    return quiz

def get_review_candidates(limit: int = 20) -> list:
    """Get words/phrases that need review (low mastery, high lookups)."""
    items = []
    
    for w in get_all_words():
        score = (100 - w.get("mastery", 0)) + w.get("lookup_count", 0) * 5
        items.append({
            "item": w["word"],
            "type": "word",
            "mastery": w.get("mastery", 0),
            "lookup_count": w.get("lookup_count", 0),
            "definition": w["definition"],
            "score": score
        })
    
    for p in get_all_phrases():
        score = (100 - p.get("mastery", 0)) + p.get("lookup_count", 0) * 5
        items.append({
            "item": p["phrase"],
            "type": "phrase",
            "mastery": p.get("mastery", 0),
            "lookup_count": p.get("lookup_count", 0),
            "definition": p["definition"],
            "score": score
        })
    
    items.sort(key=lambda x: x["score"], reverse=True)
    return items[:limit]

def get_learning_summary() -> dict:
    """Get a summary of learning progress."""
    words = get_all_words()
    phrases = get_all_phrases()
    
    def categorize(items):
        mastered = [i for i in items if i.get("mastery", 0) >= 80]
        learning = [i for i in items if 30 <= i.get("mastery", 0) < 80]
        new = [i for i in items if i.get("mastery", 0) < 30]
        return {"mastered": len(mastered), "learning": len(learning), "new": len(new)}
    
    return {
        "words": {
            "total": len(words),
            **categorize(words),
            "total_lookups": sum(w.get("lookup_count", 0) for w in words),
        },
        "phrases": {
            "total": len(phrases),
            **categorize(phrases),
            "total_lookups": sum(p.get("lookup_count", 0) for p in phrases),
        },
        "recent_additions": sorted(
            words + phrases,
            key=lambda x: x.get("created_at", ""),
            reverse=True
        )[:10]
    }

def main():
    """CLI interface for quiz_manager."""
    if len(sys.argv) < 2:
        print("Usage: quiz_manager.py <command> [args]")
        print("Commands: generate, review, summary")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "generate":
        count = int(sys.argv[2]) if len(sys.argv) > 2 else 10
        quiz_type = sys.argv[3] if len(sys.argv) > 3 else "all"
        focus = sys.argv[4] if len(sys.argv) > 4 else "low_mastery"
        result = generate_quiz(count, quiz_type, focus)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "review":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 20
        result = get_review_candidates(limit)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "summary":
        result = get_learning_summary()
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    else:
        print(json.dumps({"error": "invalid_command"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
