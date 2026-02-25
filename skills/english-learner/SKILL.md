---
name: english-learner
description: "Personal English vocabulary learning assistant. Use when user queries English words, phrases, or sentences for translation and learning. Triggers on: single English words, phrases like 'break the ice', sentences to translate, requests for quiz/review, '查单词', '学英语'. Stores vocabulary in ~/.english-learner/ with mastery tracking."
---

# English Learner

Personal vocabulary learning assistant with persistent storage and mastery tracking.

## Workflow

```
1. CLASSIFY → Run sentence_parser.py classify <input>
2. PROCESS  → Based on type: word/phrase/sentence
3. LOOKUP   → Run vocab_manager.py get_word/get_phrase
4. STORE    → If not found, get data and save
5. RESPOND  → Format and return to user
```

## Quick Reference

| Input Type | Action |
|------------|--------|
| Single word | Lookup → Save if new → Return definition |
| Phrase (2-5 words) | Lookup phrase → Save if new → Return meaning |
| Sentence | Translate → Extract words → Lookup each → Return all |
| "quiz" / "review" | Generate quiz from low-mastery items |
| "stats" | Show learning statistics |

## Scripts

All scripts are in `{skill_root}/scripts/`. Data stored in `~/.english-learner/`.

### vocab_manager.py

```bash
python vocab_manager.py get_word <word>
python vocab_manager.py save_word <word> <definition> [phonetic] [examples_json]
python vocab_manager.py get_phrase "<phrase>"
python vocab_manager.py save_phrase "<phrase>" <definition> [phonetic] [examples_json]
python vocab_manager.py log_query <query> <type>
python vocab_manager.py stats
python vocab_manager.py update_mastery <item> <is_word:true/false> <correct:true/false>
```

### sentence_parser.py

```bash
python sentence_parser.py classify <text>       # Returns: word/phrase/sentence
python sentence_parser.py parse <sentence>      # Extract and check words
python sentence_parser.py extract <sentence>    # Extract words only
python sentence_parser.py batch_check <words>   # Check multiple words
```

### quiz_manager.py

```bash
python quiz_manager.py generate [count] [type:word/phrase/all] [focus:low_mastery/high_lookup/random/new]
python quiz_manager.py review [limit]           # Get items needing review
python quiz_manager.py summary                  # Learning summary
```

## Processing Workflows

### Word Query

```
1. python sentence_parser.py classify "apple"
   → {"type": "word"}

2. python vocab_manager.py get_word apple
   → If found: return data (auto-increments lookup_count)
   → If not found: {"error": "not_found"}

3. If not found:
   - AI provides: definition, phonetic, examples, pos, synonyms
   - python vocab_manager.py save_word apple "苹果" "/ˈæp.əl/" '["I ate an apple"]'

4. python vocab_manager.py log_query "apple" "word"
```

### Phrase Query

```
1. python sentence_parser.py classify "break the ice"
   → {"type": "phrase"}

2. python vocab_manager.py get_phrase "break the ice"
   → If found: return data
   → If not found: {"error": "not_found"}

3. If not found:
   - AI provides: definition, phonetic, examples, literal meaning
   - python vocab_manager.py save_phrase "break the ice" "打破僵局" ...

4. python vocab_manager.py log_query "break the ice" "phrase"
```

### Sentence Query

```
1. python sentence_parser.py classify "The quick brown fox jumps."
   → {"type": "sentence"}

2. python sentence_parser.py parse "The quick brown fox jumps."
   → {"words": [...], "known": [...], "unknown": [...]}

3. AI translates full sentence

4. For each unknown word:
   - AI provides definition
   - python vocab_manager.py save_word <word> <definition> ...

5. Return: translation + word breakdowns
```

### Quiz Mode

```
1. python quiz_manager.py generate 10 all low_mastery
   → Returns quiz items

2. Present each item to user, get answer

3. python vocab_manager.py update_mastery <item> <is_word> <correct>
   → Updates mastery score
```

## Response Format

### Word Response

```
📖 **apple** /ˈæp.əl/

**Definition:** 苹果; a round fruit with red/green skin

**Part of Speech:** noun

**Examples:**
- I ate an apple for breakfast.
- Apple pie is my favorite dessert.

**Synonyms:** -
**Lookup Count:** 3 | **Mastery:** 60%
```

### Sentence Response

```
📝 **Sentence Analysis**

**Original:** The quick brown fox jumps over the lazy dog.
**Translation:** 敏捷的棕色狐狸跳过懒狗。

**Words Breakdown:**
| Word | Definition | Mastery |
|------|------------|---------|
| quick | 快的 | 80% |
| brown | 棕色的 | 90% |
| fox | 狐狸 | 40% |
| ...  | ... | ... |

**Unknown Words Saved:** fox, lazy
```

## Data Structure

```
~/.english-learner/
├── words/
│   ├── ap.json          # Words starting with "ap": apple, apply...
│   ├── br.json          # Words starting with "br": break, brown...
│   └── ...
├── phrases/
│   ├── break.json       # Phrases starting with "break"
│   └── ...
├── history/
│   ├── 2024-01-15.json  # Daily query logs
│   └── ...
└── memory/
    ├── SOUL.md          # Skill-specific AI context
    └── USER.md          # User learning preferences
```

## Word Data Schema

```json
{
  "word": "apple",
  "definition": "苹果; a round fruit",
  "phonetic": "/ˈæp.əl/",
  "pos": "noun",
  "examples": ["I ate an apple."],
  "synonyms": [],
  "antonyms": [],
  "created_at": "2024-01-15T10:00:00",
  "updated_at": "2024-01-15T10:00:00",
  "lookup_count": 5,
  "mastery": 60
}
```
