#!/usr/bin/env python3
"""
Sentence Parser - Parse sentences and extract words/phrases for learning.
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path

DATA_ROOT = Path.home() / ".english-learner"
WORDS_DIR = DATA_ROOT / "words"

def load_json(filepath: Path) -> dict:
    """Load JSON file, return empty dict if not exists."""
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def get_word_file(word: str) -> Path:
    """Get file path for a word (grouped by first 2 letters)."""
    prefix = word[:2].lower() if len(word) >= 2 else word[0].lower() + "_"
    return WORDS_DIR / f"{prefix}.json"

def get_word(word: str) -> dict | None:
    """Get a word's data. Returns None if not found."""
    filepath = get_word_file(word)
    data = load_json(filepath)
    key = word.lower()
    return data.get(key)

def extract_words(sentence: str) -> list:
    """Extract unique words from a sentence."""
    words = re.findall(r"[a-zA-Z']+", sentence)
    words = [w.lower().strip("'") for w in words if len(w) > 1]
    return list(dict.fromkeys(words))

def classify_input(text: str) -> str:
    """
    Classify input as 'word', 'phrase', or 'sentence'.
    
    - word: single word
    - phrase: 2-5 words, likely an idiom or collocation
    - sentence: more than 5 words or contains punctuation
    """
    text = text.strip()
    words = text.split()
    
    if len(words) == 1:
        return "word"
    elif len(words) <= 5 and not re.search(r'[.!?]', text):
        return "phrase"
    else:
        return "sentence"

def parse_sentence(sentence: str) -> dict:
    """
    Parse a sentence and identify which words are known/unknown.
    
    Returns:
        {
            "sentence": original sentence,
            "words": [list of extracted words],
            "known": [words in database],
            "unknown": [words not in database],
            "word_count": total word count
        }
    """
    words = extract_words(sentence)
    known = []
    unknown = []
    
    for word in words:
        if get_word(word):
            known.append(word)
        else:
            unknown.append(word)
    
    return {
        "sentence": sentence,
        "words": words,
        "known": known,
        "unknown": unknown,
        "word_count": len(words),
        "known_ratio": len(known) / len(words) if words else 0
    }

def batch_check_words(words: list) -> dict:
    """
    Check multiple words at once.
    
    Returns dict with known and unknown words with their data.
    """
    result = {"known": {}, "unknown": []}
    
    for word in words:
        data = get_word(word)
        if data:
            result["known"][word] = data
        else:
            result["unknown"].append(word)
    
    return result

def main():
    """CLI interface."""
    if len(sys.argv) < 2:
        print("Usage: sentence_parser.py <command> [args]")
        print("Commands: classify, parse, extract, batch_check")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == "classify" and len(sys.argv) >= 3:
        text = " ".join(sys.argv[2:])
        result = classify_input(text)
        print(json.dumps({"type": result, "text": text}))
    
    elif cmd == "parse" and len(sys.argv) >= 3:
        sentence = " ".join(sys.argv[2:])
        result = parse_sentence(sentence)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    elif cmd == "extract" and len(sys.argv) >= 3:
        sentence = " ".join(sys.argv[2:])
        words = extract_words(sentence)
        print(json.dumps({"words": words}))
    
    elif cmd == "batch_check" and len(sys.argv) >= 3:
        words = sys.argv[2:]
        result = batch_check_words(words)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    
    else:
        print(json.dumps({"error": "invalid_command"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
