#!/usr/bin/env node
"use strict";
const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
;
// The require scope
var __webpack_require__ = {};

/************************************************************************/
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  classifyInput: () => (/* binding */ classifyInput),
  getWord: () => (/* binding */ getWord),
  extractWords: () => (/* binding */ extractWords),
  parseSentence: () => (/* binding */ parseSentence),
  batchCheckWords: () => (/* binding */ batchCheckWords)
});

;// CONCATENATED MODULE: external "node:fs"
const external_node_fs_namespaceObject = require("node:fs");
;// CONCATENATED MODULE: external "node:path"
const external_node_path_namespaceObject = require("node:path");
;// CONCATENATED MODULE: external "node:os"
const external_node_os_namespaceObject = require("node:os");
;// CONCATENATED MODULE: external "node:sqlite"
const external_node_sqlite_namespaceObject = require("node:sqlite");
;// CONCATENATED MODULE: ./src/shared/db.ts




const DATA_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.english-learner');
const DB_PATH = external_node_path_namespaceObject.join(DATA_ROOT, 'data.db');
const SCHEMA = `
CREATE TABLE IF NOT EXISTS words (
  word TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT
);
CREATE INDEX IF NOT EXISTS idx_words_mastery ON words(mastery);
CREATE INDEX IF NOT EXISTS idx_words_lookup ON words(lookup_count);

CREATE TABLE IF NOT EXISTS phrases (
  phrase TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  mastery INTEGER NOT NULL DEFAULT 0,
  lookup_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_lookup TEXT
);
CREATE INDEX IF NOT EXISTS idx_phrases_mastery ON phrases(mastery);
CREATE INDEX IF NOT EXISTS idx_phrases_lookup ON phrases(lookup_count);

CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,
  query TEXT NOT NULL,
  query_type TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_history_ts ON history(ts);

CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;
let _db = null;
function getDb() {
    if (_db) return _db;
    external_node_fs_namespaceObject.mkdirSync(DATA_ROOT, {
        recursive: true
    });
    _db = new external_node_sqlite_namespaceObject.DatabaseSync(DB_PATH);
    _db.exec('PRAGMA journal_mode = WAL;');
    _db.exec('PRAGMA foreign_keys = ON;');
    _db.exec(SCHEMA);
    return _db;
}
function rowToWord(row) {
    if (!row) return null;
    const inner = JSON.parse(row.data);
    return {
        word: row.word,
        definitions: inner.definitions || [],
        phonetic: inner.phonetic || '',
        synonyms: inner.synonyms || [],
        antonyms: inner.antonyms || [],
        mastery: row.mastery,
        lookup_count: row.lookup_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
        ...row.last_lookup ? {
            last_lookup: row.last_lookup
        } : {}
    };
}
function rowToPhrase(row) {
    if (!row) return null;
    const inner = JSON.parse(row.data);
    return {
        phrase: row.phrase,
        definition: inner.definition || '',
        phonetic: inner.phonetic || '',
        literal: inner.literal || '',
        examples: inner.examples || [],
        mastery: row.mastery,
        lookup_count: row.lookup_count,
        created_at: row.created_at,
        updated_at: row.updated_at,
        ...row.last_lookup ? {
            last_lookup: row.last_lookup
        } : {}
    };
}
function withTransaction(fn) {
    const db = getDb();
    db.exec('BEGIN');
    try {
        const result = fn(db);
        db.exec('COMMIT');
        return result;
    } catch (err) {
        try {
            db.exec('ROLLBACK');
        } catch  {
        /* swallow */ }
        throw err;
    }
}

;// CONCATENATED MODULE: ./src/english-learner/sentence-parser.ts

function getWord(word) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM words WHERE word = ?').get(word.toLowerCase());
    return rowToWord(row);
}
function extractWords(sentence) {
    const matches = sentence.match(/[a-zA-Z']+/g) || [];
    const words = matches.map((w)=>w.toLowerCase().replace(/^'+|'+$/g, '')).filter((w)=>w.length > 1);
    return [
        ...new Map(words.map((w)=>[
                w,
                w
            ])).values()
    ];
}
function classifyInput(text) {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/);
    if (words.length === 1) return 'word';
    if (words.length <= 5 && !/[.!?]/.test(trimmed)) return 'phrase';
    return 'sentence';
}
function parseSentence(sentence) {
    const words = extractWords(sentence);
    const known = [];
    const unknown = [];
    if (words.length > 0) {
        const db = getDb();
        const placeholders = words.map(()=>'?').join(',');
        const rows = db.prepare(`SELECT word FROM words WHERE word IN (${placeholders})`).all(...words);
        const knownSet = new Set(rows.map((r)=>r.word));
        for (const w of words){
            if (knownSet.has(w)) known.push(w);
            else unknown.push(w);
        }
    }
    return {
        sentence,
        words,
        known,
        unknown,
        word_count: words.length,
        known_ratio: words.length ? known.length / words.length : 0
    };
}
function batchCheckWords(words) {
    const result = {
        known: {},
        unknown: []
    };
    if (!Array.isArray(words) || words.length === 0) return result;
    const db = getDb();
    const placeholders = words.map(()=>'?').join(',');
    const rows = db.prepare(`SELECT * FROM words WHERE word IN (${placeholders})`).all(...words.map((w)=>w.toLowerCase()));
    const byKey = new Map(rows.map((r)=>[
            r.word,
            r
        ]));
    for (const w of words){
        const row = byKey.get(w.toLowerCase());
        const wordRec = rowToWord(row);
        if (wordRec) result.known[w] = wordRec;
        else result.unknown.push(w);
    }
    return result;
}
function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: sentence_parser.cjs <command> [args]');
        console.log('Commands: classify, parse, extract, batch_check');
        process.exit(1);
    }
    const cmd = args[0];
    if (cmd === 'classify' && args.length >= 2) {
        const text = args.slice(1).join(' ');
        console.log(JSON.stringify({
            type: classifyInput(text),
            text
        }));
    } else if (cmd === 'parse' && args.length >= 2) {
        console.log(JSON.stringify(parseSentence(args.slice(1).join(' ')), null, 2));
    } else if (cmd === 'extract' && args.length >= 2) {
        console.log(JSON.stringify({
            words: extractWords(args.slice(1).join(' '))
        }));
    } else if (cmd === 'batch_check' && args.length >= 2) {
        console.log(JSON.stringify(batchCheckWords(args.slice(1)), null, 2));
    } else {
        console.log(JSON.stringify({
            error: 'invalid_command'
        }));
        process.exit(1);
    }
}
main();

exports.batchCheckWords = __webpack_exports__.batchCheckWords;
exports.classifyInput = __webpack_exports__.classifyInput;
exports.extractWords = __webpack_exports__.extractWords;
exports.getWord = __webpack_exports__.getWord;
exports.parseSentence = __webpack_exports__.parseSentence;
for(var __webpack_i__ in __webpack_exports__) {
  if(["batchCheckWords","classifyInput","extractWords","getWord","parseSentence"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
