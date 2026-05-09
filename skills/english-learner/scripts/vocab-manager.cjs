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
  savePhrase: () => (/* binding */ savePhrase),
  batchSaveWords: () => (/* binding */ batchSaveWords),
  getWord: () => (/* binding */ getWord),
  getStats: () => (/* binding */ getStats),
  saveWord: () => (/* binding */ saveWord),
  batchGetWords: () => (/* binding */ batchGetWords),
  getPhrase: () => (/* binding */ getPhrase),
  incrementLookup: () => (/* binding */ incrementLookup),
  logQuery: () => (/* binding */ logQuery),
  updateMastery: () => (/* binding */ updateMastery)
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

;// CONCATENATED MODULE: ./src/english-learner/vocab-manager.ts

const nowIso = ()=>new Date().toISOString();
const packWordData = ({ definitions, phonetic, synonyms, antonyms })=>JSON.stringify({
        definitions: definitions || [],
        phonetic: phonetic || '',
        synonyms: synonyms || [],
        antonyms: antonyms || []
    });
const packPhraseData = ({ definition, phonetic, literal, examples })=>JSON.stringify({
        definition: definition || '',
        phonetic: phonetic || '',
        literal: literal || '',
        examples: examples || []
    });
function getWord(word) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM words WHERE word = ?').get(word.toLowerCase());
    return rowToWord(row);
}
function saveWord(word, opts = {}) {
    const db = getDb();
    const key = word.toLowerCase();
    const existing = getWord(key);
    const now = nowIso();
    let definitions;
    if (opts.definitions) {
        definitions = opts.definitions;
    } else if (opts.definition) {
        definitions = [
            {
                pos: opts.pos || '',
                meaning: opts.definition,
                examples: opts.examples || []
            }
        ];
    } else {
        definitions = existing?.definitions || [];
    }
    const merged = {
        definitions,
        phonetic: opts.phonetic || existing?.phonetic || '',
        synonyms: opts.synonyms || existing?.synonyms || [],
        antonyms: opts.antonyms || existing?.antonyms || []
    };
    db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(key, packWordData(merged), existing?.mastery || 0, existing?.lookup_count || 0, existing?.created_at || now, now);
    return getWord(key);
}
function incrementLookup(word) {
    const db = getDb();
    const key = word.toLowerCase();
    const result = db.prepare(`
    UPDATE words SET lookup_count = lookup_count + 1, last_lookup = ? WHERE word = ?
  `).run(nowIso(), key);
    if (result.changes === 0) return 0;
    const row = db.prepare('SELECT lookup_count FROM words WHERE word = ?').get(key);
    return row?.lookup_count || 0;
}
function getPhrase(phrase) {
    const db = getDb();
    const row = db.prepare('SELECT * FROM phrases WHERE phrase = ?').get(phrase.toLowerCase());
    return rowToPhrase(row);
}
function savePhrase(phrase, opts = {}) {
    const db = getDb();
    const key = phrase.toLowerCase();
    const existing = getPhrase(key);
    const now = nowIso();
    const merged = {
        definition: opts.definition || existing?.definition || '',
        phonetic: opts.phonetic || existing?.phonetic || '',
        literal: opts.literal || existing?.literal || '',
        examples: opts.examples || existing?.examples || []
    };
    db.prepare(`
    INSERT INTO phrases (phrase, data, mastery, lookup_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(phrase) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(key, packPhraseData(merged), existing?.mastery || 0, existing?.lookup_count || 0, existing?.created_at || now, now);
    return getPhrase(key);
}
function logQuery(query, queryType) {
    const db = getDb();
    db.prepare('INSERT INTO history (ts, query, query_type) VALUES (?, ?, ?)').run(nowIso(), query, queryType);
}
function updateMastery(item, isWord, correct) {
    const db = getDb();
    const key = item.toLowerCase();
    const table = isWord ? 'words' : 'phrases';
    const col = isWord ? 'word' : 'phrase';
    const row = db.prepare(`SELECT mastery FROM ${table} WHERE ${col} = ?`).get(key);
    if (!row) return 0;
    const current = row.mastery || 0;
    const next = correct ? Math.min(100, current + 10) : Math.max(0, current - 5);
    db.prepare(`UPDATE ${table} SET mastery = ?, updated_at = ? WHERE ${col} = ?`).run(next, nowIso(), key);
    return next;
}
function getStats() {
    const db = getDb();
    const wordStats = db.prepare(`
    SELECT
      COUNT(*) AS total_words,
      COALESCE(SUM(lookup_count), 0) AS total_lookups,
      SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered_words,
      SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning_words,
      SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_words
    FROM words
  `).get();
    const phraseStats = db.prepare('SELECT COUNT(*) AS total_phrases FROM phrases').get();
    return {
        total_words: wordStats.total_words || 0,
        total_phrases: phraseStats.total_phrases || 0,
        total_lookups: wordStats.total_lookups || 0,
        mastered_words: wordStats.mastered_words || 0,
        learning_words: wordStats.learning_words || 0,
        new_words: wordStats.new_words || 0
    };
}
function batchGetWords(words) {
    const result = {
        found: {},
        not_found: []
    };
    if (!Array.isArray(words) || words.length === 0) return result;
    const db = getDb();
    const placeholders = words.map(()=>'?').join(',');
    const rows = db.prepare(`SELECT * FROM words WHERE word IN (${placeholders})`).all(...words.map((w)=>w.toLowerCase()));
    const byKey = new Map(rows.map((r)=>[
            r.word,
            r
        ]));
    const incrementer = db.prepare(`
    UPDATE words SET lookup_count = lookup_count + 1, last_lookup = ? WHERE word = ?
  `);
    const ts = nowIso();
    withTransaction(()=>{
        for (const w of words){
            const key = w.toLowerCase();
            const row = byKey.get(key);
            if (row) {
                incrementer.run(ts, key);
                const refreshed = db.prepare('SELECT * FROM words WHERE word = ?').get(key);
                const wordRec = rowToWord(refreshed);
                if (wordRec) result.found[w] = wordRec;
            } else {
                result.not_found.push(w);
            }
        }
    });
    return result;
}
function batchSaveWords(wordsData) {
    const db = getDb();
    const saved = [];
    const now = nowIso();
    const upsert = db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `);
    withTransaction(()=>{
        for (const item of wordsData){
            const word = (item.word || '').toLowerCase();
            if (!word) continue;
            const existing = getWord(word);
            let definitions;
            if (item.definitions) {
                definitions = item.definitions;
            } else if (item.definition) {
                definitions = [
                    {
                        pos: item.pos || '',
                        meaning: item.definition,
                        examples: item.examples || []
                    }
                ];
            } else {
                definitions = existing?.definitions || [];
            }
            const merged = {
                definitions,
                phonetic: item.phonetic || existing?.phonetic || '',
                synonyms: item.synonyms || existing?.synonyms || [],
                antonyms: item.antonyms || existing?.antonyms || []
            };
            upsert.run(word, packWordData(merged), existing?.mastery || 0, existing?.lookup_count || 0, existing?.created_at || now, now);
            saved.push(word);
        }
    });
    return {
        saved,
        count: saved.length
    };
}
function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: vocab_manager.cjs <command> [args]');
        console.log('Commands: get_word, save_word, get_phrase, save_phrase, log_query, stats, update_mastery');
        console.log('Batch: batch_get <words_json>, batch_save <words_data_json>');
        process.exit(1);
    }
    const cmd = args[0];
    if (cmd === 'get_word' && args.length >= 2) {
        const result = getWord(args[1]);
        if (result) {
            incrementLookup(args[1]);
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(JSON.stringify({
                error: 'not_found'
            }));
        }
    } else if (cmd === 'get_phrase' && args.length >= 2) {
        const phrase = args.slice(1).join(' ');
        const result = getPhrase(phrase);
        console.log(result ? JSON.stringify(result, null, 2) : JSON.stringify({
            error: 'not_found'
        }));
    } else if (cmd === 'save_word' && args.length >= 3) {
        const word = args[1];
        const definition = args[2];
        const phonetic = args[3] || '';
        const examples = args[4] ? JSON.parse(args[4]) : [];
        console.log(JSON.stringify(saveWord(word, {
            definition,
            phonetic,
            examples
        }), null, 2));
    } else if (cmd === 'save_phrase' && args.length >= 3) {
        const phrase = args[1];
        const definition = args[2];
        const phonetic = args[3] || '';
        const examples = args[4] ? JSON.parse(args[4]) : [];
        console.log(JSON.stringify(savePhrase(phrase, {
            definition,
            phonetic,
            examples
        }), null, 2));
    } else if (cmd === 'log_query' && args.length >= 3) {
        logQuery(args[1], args[2]);
        console.log(JSON.stringify({
            status: 'logged'
        }));
    } else if (cmd === 'stats') {
        console.log(JSON.stringify(getStats(), null, 2));
    } else if (cmd === 'update_mastery' && args.length >= 4) {
        const item = args[1];
        const isWord = args[2].toLowerCase() === 'true';
        const correct = args[3].toLowerCase() === 'true';
        console.log(JSON.stringify({
            mastery: updateMastery(item, isWord, correct)
        }));
    } else if (cmd === 'batch_get' && args.length >= 2) {
        const words = JSON.parse(args[1]);
        console.log(JSON.stringify(batchGetWords(words), null, 2));
    } else if (cmd === 'batch_save' && args.length >= 2) {
        const wordsData = JSON.parse(args[1]);
        console.log(JSON.stringify(batchSaveWords(wordsData), null, 2));
    } else {
        console.log(JSON.stringify({
            error: 'invalid_command'
        }));
        process.exit(1);
    }
}
main();

exports.batchGetWords = __webpack_exports__.batchGetWords;
exports.batchSaveWords = __webpack_exports__.batchSaveWords;
exports.getPhrase = __webpack_exports__.getPhrase;
exports.getStats = __webpack_exports__.getStats;
exports.getWord = __webpack_exports__.getWord;
exports.incrementLookup = __webpack_exports__.incrementLookup;
exports.logQuery = __webpack_exports__.logQuery;
exports.savePhrase = __webpack_exports__.savePhrase;
exports.saveWord = __webpack_exports__.saveWord;
exports.updateMastery = __webpack_exports__.updateMastery;
for(var __webpack_i__ in __webpack_exports__) {
  if(["batchGetWords","batchSaveWords","getPhrase","getStats","getWord","incrementLookup","logQuery","savePhrase","saveWord","updateMastery"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
