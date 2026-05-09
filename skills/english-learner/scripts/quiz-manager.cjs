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
  getReviewCandidates: () => (/* binding */ getReviewCandidates),
  getLearningSummary: () => (/* binding */ getLearningSummary),
  generateQuiz: () => (/* binding */ generateQuiz)
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

;// CONCATENATED MODULE: ./src/english-learner/quiz-manager.ts

function pickOrderClause(focus) {
    switch(focus){
        case 'low_mastery':
            return 'ORDER BY mastery ASC, updated_at DESC';
        case 'high_lookup':
            return 'ORDER BY lookup_count DESC, mastery ASC';
        case 'new':
            return 'ORDER BY created_at DESC';
        case 'random':
            return 'ORDER BY RANDOM()';
        default:
            return 'ORDER BY mastery ASC, updated_at DESC';
    }
}
function fetchWords(orderClause, limit) {
    const db = getDb();
    const rows = db.prepare(`SELECT * FROM words ${orderClause} LIMIT ?`).all(limit);
    return rows.map((r)=>rowToWord(r)).filter((w)=>w !== null);
}
function fetchPhrases(orderClause, limit) {
    const db = getDb();
    const rows = db.prepare(`SELECT * FROM phrases ${orderClause} LIMIT ?`).all(limit);
    return rows.map((r)=>rowToPhrase(r)).filter((p)=>p !== null);
}
function generateQuiz(count = 10, quizType = 'all', focus = 'low_mastery') {
    const orderClause = pickOrderClause(focus);
    const limit = Math.max(count * 2, count);
    let pool = [];
    if (quizType === 'word' || quizType === 'all') {
        pool.push(...fetchWords(orderClause, limit).map((w)=>({
                ...w,
                type: 'word'
            })));
    }
    if (quizType === 'phrase' || quizType === 'all') {
        pool.push(...fetchPhrases(orderClause, limit).map((p)=>({
                ...p,
                type: 'phrase'
            })));
    }
    if (!pool.length) return [];
    if (focus === 'low_mastery') {
        pool.sort((a, b)=>(a.mastery || 0) - (b.mastery || 0));
    } else if (focus === 'high_lookup') {
        pool.sort((a, b)=>(b.lookup_count || 0) - (a.lookup_count || 0));
    } else if (focus === 'new') {
        pool.sort((a, b)=>(b.created_at || '').localeCompare(a.created_at || ''));
    } else {
        for(let i = pool.length - 1; i > 0; i--){
            const j = Math.floor(Math.random() * (i + 1));
            [pool[i], pool[j]] = [
                pool[j],
                pool[i]
            ];
        }
    }
    return pool.slice(0, count).map((item)=>{
        if (item.type === 'word') {
            const defs = item.definitions || [];
            return {
                id: item.word,
                type: 'word',
                question: item.word,
                answer: defs.map((d)=>`${d.pos} ${d.meaning}`).join('; '),
                definitions: defs,
                phonetic: item.phonetic || '',
                examples: defs.flatMap((d)=>d.examples || []),
                mastery: item.mastery || 0,
                lookup_count: item.lookup_count || 0
            };
        }
        return {
            id: item.phrase,
            type: 'phrase',
            question: item.phrase,
            answer: item.definition || '',
            phonetic: item.phonetic || '',
            examples: item.examples || [],
            mastery: item.mastery || 0,
            lookup_count: item.lookup_count || 0
        };
    });
}
function getReviewCandidates(limit = 20) {
    const db = getDb();
    const wordRows = db.prepare(`
    SELECT word AS item, mastery, lookup_count, data,
           (100 - mastery) + lookup_count * 5 AS score
    FROM words
    ORDER BY score DESC
    LIMIT ?
  `).all(limit);
    const phraseRows = db.prepare(`
    SELECT phrase AS item, mastery, lookup_count, data,
           (100 - mastery) + lookup_count * 5 AS score
    FROM phrases
    ORDER BY score DESC
    LIMIT ?
  `).all(limit);
    const items = [];
    for (const r of wordRows){
        const data = JSON.parse(r.data);
        const defs = data.definitions || [];
        items.push({
            item: r.item,
            type: 'word',
            mastery: r.mastery,
            lookup_count: r.lookup_count,
            definition: defs.map((d)=>`${d.pos} ${d.meaning}`).join('; '),
            score: r.score
        });
    }
    for (const r of phraseRows){
        const data = JSON.parse(r.data);
        items.push({
            item: r.item,
            type: 'phrase',
            mastery: r.mastery,
            lookup_count: r.lookup_count,
            definition: data.definition || '',
            score: r.score
        });
    }
    items.sort((a, b)=>b.score - a.score);
    return items.slice(0, limit);
}
function getLearningSummary() {
    const db = getDb();
    const formatCats = (table)=>{
        const c = db.prepare(`
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(lookup_count), 0) AS total_lookups,
        SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered,
        SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning,
        SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_count
      FROM ${table}
    `).get();
        return {
            total: c.total || 0,
            mastered: c.mastered || 0,
            learning: c.learning || 0,
            new: c.new_count || 0,
            total_lookups: c.total_lookups || 0
        };
    };
    const recent = db.prepare(`
    SELECT 'word' AS type, word AS id, created_at, mastery FROM words
    UNION ALL
    SELECT 'phrase' AS type, phrase AS id, created_at, mastery FROM phrases
    ORDER BY created_at DESC
    LIMIT 10
  `).all();
    return {
        words: formatCats('words'),
        phrases: formatCats('phrases'),
        recent_additions: recent
    };
}
function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.log('Usage: quiz_manager.cjs <command> [args]');
        console.log('Commands: generate, review, summary');
        process.exit(1);
    }
    const cmd = args[0];
    if (cmd === 'generate') {
        const count = args[1] ? parseInt(args[1], 10) : 10;
        const quizType = args[2] || 'all';
        const focus = args[3] || 'low_mastery';
        console.log(JSON.stringify(generateQuiz(count, quizType, focus), null, 2));
    } else if (cmd === 'review') {
        const limit = args[1] ? parseInt(args[1], 10) : 20;
        console.log(JSON.stringify(getReviewCandidates(limit), null, 2));
    } else if (cmd === 'summary') {
        console.log(JSON.stringify(getLearningSummary(), null, 2));
    } else {
        console.log(JSON.stringify({
            error: 'invalid_command'
        }));
        process.exit(1);
    }
}
main();

exports.generateQuiz = __webpack_exports__.generateQuiz;
exports.getLearningSummary = __webpack_exports__.getLearningSummary;
exports.getReviewCandidates = __webpack_exports__.getReviewCandidates;
for(var __webpack_i__ in __webpack_exports__) {
  if(["generateQuiz","getLearningSummary","getReviewCandidates"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
