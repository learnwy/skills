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
  migrate: () => (/* binding */ migrate)
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

;// CONCATENATED MODULE: ./src/english-learner/migrate-from-json.ts



const WORDS_DIR = external_node_path_namespaceObject.join(DATA_ROOT, 'words');
const PHRASES_DIR = external_node_path_namespaceObject.join(DATA_ROOT, 'phrases');
const HISTORY_DIR = external_node_path_namespaceObject.join(DATA_ROOT, 'history');
function readJsonFiles(dir) {
    if (!external_node_fs_namespaceObject.existsSync(dir)) return [];
    return external_node_fs_namespaceObject.readdirSync(dir).filter((n)=>n.endsWith('.json')).map((n)=>external_node_path_namespaceObject.join(dir, n));
}
function loadJson(filepath) {
    try {
        return JSON.parse(external_node_fs_namespaceObject.readFileSync(filepath, 'utf-8'));
    } catch  {
        return null;
    }
}
const packWordData = (e)=>JSON.stringify({
        definitions: e.definitions || [],
        phonetic: e.phonetic || '',
        synonyms: e.synonyms || [],
        antonyms: e.antonyms || []
    });
const packPhraseData = (e)=>JSON.stringify({
        definition: e.definition || '',
        phonetic: e.phonetic || '',
        literal: e.literal || '',
        examples: e.examples || []
    });
function migrate({ dryRun = false } = {}) {
    const db = getDb();
    const result = {
        words: 0,
        phrases: 0,
        history: 0,
        skipped_words: 0,
        skipped_phrases: 0
    };
    const wordUpsert = db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at, last_lookup)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      mastery = MAX(words.mastery, excluded.mastery),
      lookup_count = MAX(words.lookup_count, excluded.lookup_count),
      updated_at = excluded.updated_at,
      last_lookup = COALESCE(excluded.last_lookup, words.last_lookup)
  `);
    const phraseUpsert = db.prepare(`
    INSERT INTO phrases (phrase, data, mastery, lookup_count, created_at, updated_at, last_lookup)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(phrase) DO UPDATE SET
      data = excluded.data,
      mastery = MAX(phrases.mastery, excluded.mastery),
      lookup_count = MAX(phrases.lookup_count, excluded.lookup_count),
      updated_at = excluded.updated_at,
      last_lookup = COALESCE(excluded.last_lookup, phrases.last_lookup)
  `);
    const historyInsert = db.prepare('INSERT INTO history (ts, query, query_type) VALUES (?, ?, ?)');
    withTransaction(()=>{
        for (const filepath of readJsonFiles(WORDS_DIR)){
            const data = loadJson(filepath);
            if (!data) {
                result.skipped_words += 1;
                continue;
            }
            for (const [key, entry] of Object.entries(data)){
                if (!entry || typeof entry !== 'object') continue;
                const word = (entry.word || key).toLowerCase();
                if (!dryRun) {
                    wordUpsert.run(word, packWordData(entry), entry.mastery || 0, entry.lookup_count || 0, entry.created_at || new Date().toISOString(), entry.updated_at || entry.created_at || new Date().toISOString(), entry.last_lookup || null);
                }
                result.words += 1;
            }
        }
        for (const filepath of readJsonFiles(PHRASES_DIR)){
            const data = loadJson(filepath);
            if (!data) {
                result.skipped_phrases += 1;
                continue;
            }
            for (const [key, entry] of Object.entries(data)){
                if (!entry || typeof entry !== 'object') continue;
                const phrase = (entry.phrase || key).toLowerCase();
                if (!dryRun) {
                    phraseUpsert.run(phrase, packPhraseData(entry), entry.mastery || 0, entry.lookup_count || 0, entry.created_at || new Date().toISOString(), entry.updated_at || entry.created_at || new Date().toISOString(), entry.last_lookup || null);
                }
                result.phrases += 1;
            }
        }
        for (const filepath of readJsonFiles(HISTORY_DIR)){
            const data = loadJson(filepath);
            if (!data || !Array.isArray(data.queries)) continue;
            for (const q of data.queries){
                if (!q || !q.query || !q.type) continue;
                if (!dryRun) {
                    historyInsert.run(q.timestamp || new Date().toISOString(), q.query, q.type);
                }
                result.history += 1;
            }
        }
    });
    return result;
}
const migrate_from_json_dryRun = process.argv.includes('--dry-run');
const out = migrate({
    dryRun: migrate_from_json_dryRun
});
console.log(JSON.stringify({
    dryRun: migrate_from_json_dryRun,
    ...out
}, null, 2));

exports.migrate = __webpack_exports__.migrate;
for(var __webpack_i__ in __webpack_exports__) {
  if(["migrate"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
