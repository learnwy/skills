#!/usr/bin/env node
"use strict";
const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
;
var __webpack_exports__ = {};

;// CONCATENATED MODULE: external "node:fs"
const external_node_fs_namespaceObject = require("node:fs");
;// CONCATENATED MODULE: external "node:path"
const external_node_path_namespaceObject = require("node:path");
;// CONCATENATED MODULE: ./src/shared/hooks-lib.ts


function readStdin() {
    return new Promise((resolve)=>{
        let data = '';
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (chunk)=>{
            data += chunk;
        });
        process.stdin.on('end', ()=>{
            try {
                resolve(data ? JSON.parse(data) : {});
            } catch  {
                resolve({});
            }
        });
        process.stdin.on('error', ()=>resolve({}));
    });
}
function getProjectDir() {
    return process.env.TRAE_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}
function injectContext(text) {
    process.stdout.write(text);
}
function respond(output) {
    process.stdout.write(JSON.stringify(output));
}
function block(reason) {
    respond({
        decision: 'block',
        reason
    });
}
function deny(reason) {
    respond({
        hookSpecificOutput: {
            hookEventName: 'PreToolUse',
            permissionDecision: 'deny',
            permissionDecisionReason: reason
        }
    });
}
function installHooks(config, options = {}) {
    const { target = 'both', scope = 'global', projectRoot } = options;
    const results = [];
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    if (scope === 'global') {
        if (target === 'trae' || target === 'both') {
            for (const dir of [
                '.trae',
                '.trae-cn'
            ]){
                const traeFile = path.join(homeDir, dir, 'hooks.json');
                mergeAndWrite(traeFile, config, 'standalone');
                results.push(traeFile);
            }
        }
        if (target === 'claude' || target === 'both') {
            const claudeFile = path.join(homeDir, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
    } else {
        const root = projectRoot || getProjectDir();
        if (target === 'trae' || target === 'both') {
            const traeFile = path.join(root, '.trae', 'hooks.json');
            mergeAndWrite(traeFile, config, 'standalone');
            results.push(traeFile);
        }
        if (target === 'claude' || target === 'both') {
            const claudeFile = path.join(root, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
    }
    return results;
}
function mergeAndWrite(filePath, config, mode) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, {
        recursive: true
    });
    let existing = {};
    if (fs.existsSync(filePath)) {
        try {
            existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch  {
            existing = {};
        }
    }
    if (mode === 'standalone') {
        existing.version = config.version || 1;
    }
    const hooks = existing.hooks ??= {};
    for (const [event, groups] of Object.entries(config.hooks || {})){
        hooks[event] = hooks[event] || [];
        for (const group of groups){
            const isDup = hooks[event].some((g)=>JSON.stringify(g) === JSON.stringify(group));
            if (!isDup) hooks[event].push(group);
        }
    }
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
}
function uninstallHooks(skillId, options = {}) {
    const { target = 'both', scope = 'global', projectRoot } = options;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const root = projectRoot || getProjectDir();
    const files = [];
    if (scope === 'global') {
        if (target === 'trae' || target === 'both') {
            files.push(path.join(homeDir, '.trae', 'hooks.json'));
            files.push(path.join(homeDir, '.trae-cn', 'hooks.json'));
        }
        if (target === 'claude' || target === 'both') {
            files.push(path.join(homeDir, '.claude', 'settings.json'));
        }
    } else {
        if (target === 'trae' || target === 'both') {
            files.push(path.join(root, '.trae', 'hooks.json'));
        }
        if (target === 'claude' || target === 'both') {
            files.push(path.join(root, '.claude', 'settings.json'));
        }
    }
    for (const filePath of files){
        if (!fs.existsSync(filePath)) continue;
        try {
            const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const hooks = content.hooks;
            if (!hooks) continue;
            for (const [event, groups] of Object.entries(hooks)){
                hooks[event] = groups.filter((g)=>{
                    const cmds = (g.hooks || []).map((h)=>h.command || '');
                    return !cmds.some((cmd)=>cmd.includes(skillId));
                });
                if (hooks[event].length === 0) delete hooks[event];
            }
            fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
        } catch  {
        /* swallow */ }
    }
}

;// CONCATENATED MODULE: external "node:os"
const external_node_os_namespaceObject = require("node:os");
;// CONCATENATED MODULE: external "node:sqlite"
const external_node_sqlite_namespaceObject = require("node:sqlite");
;// CONCATENATED MODULE: ./src/shared/db.ts




const db_DATA_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'english-learner');
const DB_PATH = external_node_path_namespaceObject.join(db_DATA_ROOT, 'data.db');
const LEGACY_DATA_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.english-learner');
function migrateLegacyRoot() {
    if (external_node_fs_namespaceObject.existsSync(db_DATA_ROOT)) return;
    if (!external_node_fs_namespaceObject.existsSync(LEGACY_DATA_ROOT)) return;
    external_node_fs_namespaceObject.mkdirSync(external_node_path_namespaceObject.dirname(db_DATA_ROOT), {
        recursive: true
    });
    try {
        external_node_fs_namespaceObject.renameSync(LEGACY_DATA_ROOT, db_DATA_ROOT);
    } catch  {
        external_node_fs_namespaceObject.cpSync(LEGACY_DATA_ROOT, db_DATA_ROOT, {
            recursive: true
        });
        external_node_fs_namespaceObject.rmSync(LEGACY_DATA_ROOT, {
            recursive: true,
            force: true
        });
    }
}
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
function db_getDb() {
    if (_db) return _db;
    migrateLegacyRoot();
    external_node_fs_namespaceObject.mkdirSync(db_DATA_ROOT, {
        recursive: true
    });
    _db = new external_node_sqlite_namespaceObject.DatabaseSync(DB_PATH);
    _db.exec('PRAGMA journal_mode = WAL;');
    _db.exec('PRAGMA foreign_keys = ON;');
    _db.exec(SCHEMA);
    return _db;
}
function db_rowToWord(row) {
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
function db_rowToPhrase(row) {
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
    const db = db_getDb();
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

;// CONCATENATED MODULE: ./src/english-learner/cmd/quiz.ts

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
    const db = db_getDb();
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
const command = (/* unused pure expression or super */ null && ({
    description: 'Quiz generation, review, and learning summary',
    run: (args)=>{
        if (args.length < 1) {
            console.log('Usage: cli.cjs quiz <action> [args]');
            console.log('Actions: generate, review, summary');
            process.exit(1);
        }
        const action = args[0];
        if (action === 'generate') {
            const count = args[1] ? parseInt(args[1], 10) : 10;
            const quizType = args[2] || 'all';
            const focus = args[3] || 'low_mastery';
            console.log(JSON.stringify(generateQuiz(count, quizType, focus), null, 2));
        } else if (action === 'review') {
            const limit = args[1] ? parseInt(args[1], 10) : 20;
            console.log(JSON.stringify(getReviewCandidates(limit), null, 2));
        } else if (action === 'summary') {
            console.log(JSON.stringify(getLearningSummary(), null, 2));
        } else {
            console.log(JSON.stringify({
                error: 'invalid_command'
            }));
            process.exit(1);
        }
    }
}));

;// CONCATENATED MODULE: ./src/english-learner/cmd/link-wiki.ts





const WIKI_TOPICS = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'llm-wiki', 'wiki', 'topics.txt');
const LINKS_FILE = external_node_path_namespaceObject.join(db_DATA_ROOT, 'wiki-links.json');
const MIN_TERM_LEN = 4;
const MAX_LINKS_PER_TERM = 3;
function loadTopicSegments() {
    const lines = [];
    const segmentIndex = new Map();
    if (!fs.existsSync(WIKI_TOPICS)) return {
        lines,
        segmentIndex
    };
    const raw = fs.readFileSync(WIKI_TOPICS, 'utf8');
    for (const line of raw.split('\n')){
        const t = line.trim();
        if (!t || t.startsWith('#')) continue;
        lines.push(t);
        for (const seg of t.split('-')){
            if (seg.length < MIN_TERM_LEN) continue;
            const arr = segmentIndex.get(seg) ?? [];
            arr.push(t);
            segmentIndex.set(seg, arr);
        }
    }
    return {
        lines,
        segmentIndex
    };
}
function matchTerm(term, segmentIndex, topicLines) {
    const lower = term.toLowerCase();
    if (lower.length < MIN_TERM_LEN) return [];
    const exact = segmentIndex.get(lower);
    if (exact && exact.length) return exact.slice(0, MAX_LINKS_PER_TERM);
    const tokens = lower.split(/[^a-z0-9]+/).filter((t)=>t.length >= MIN_TERM_LEN);
    if (tokens.length === 0) return [];
    const hits = new Set();
    for (const tok of tokens){
        const matches = segmentIndex.get(tok);
        if (matches) {
            for (const m of matches)hits.add(m);
        }
    }
    if (hits.size === 0) {
        for (const line of topicLines){
            if (line.includes(lower)) hits.add(line);
            if (hits.size >= MAX_LINKS_PER_TERM) break;
        }
    }
    return Array.from(hits).slice(0, MAX_LINKS_PER_TERM);
}
function buildLinks() {
    const { lines, segmentIndex } = loadTopicSegments();
    const db = getDb();
    const wordRows = db.prepare('SELECT word FROM words').all();
    const phraseRows = db.prepare('SELECT phrase FROM phrases').all();
    const links = [];
    for (const r of wordRows){
        const topics = matchTerm(r.word, segmentIndex, lines);
        if (topics.length) links.push({
            term: r.word,
            type: 'word',
            topics
        });
    }
    for (const r of phraseRows){
        const topics = matchTerm(r.phrase, segmentIndex, lines);
        if (topics.length) links.push({
            term: r.phrase,
            type: 'phrase',
            topics
        });
    }
    return {
        generated_at: new Date().toISOString(),
        source: WIKI_TOPICS,
        total_terms_scanned: wordRows.length + phraseRows.length,
        total_terms_linked: links.length,
        links
    };
}
const link_wiki_command = (/* unused pure expression or super */ null && ({
    description: 'Match vocab terms to llm-wiki topics; write ~/.learnwy/english-learner/wiki-links.json',
    run: (args)=>{
        const { flags } = parseArgs(args);
        if (!fs.existsSync(WIKI_TOPICS)) {
            console.error(`llm-wiki topics file not found: ${WIKI_TOPICS}`);
            console.error("Skipping link-wiki \u2014 initialize llm-wiki first.");
            process.exit(0);
        }
        const result = buildLinks();
        if (flags['dry-run']) {
            console.log(JSON.stringify(result, null, 2));
            return;
        }
        if (!fs.existsSync(DATA_ROOT)) fs.mkdirSync(DATA_ROOT, {
            recursive: true
        });
        fs.writeFileSync(LINKS_FILE, JSON.stringify(result, null, 2) + '\n');
        console.log(`Wrote ${result.total_terms_linked} link(s) (of ${result.total_terms_scanned} terms) to ${LINKS_FILE}`);
    }
}));
function readLinksMap() {
    const map = new Map();
    if (!external_node_fs_namespaceObject.existsSync(LINKS_FILE)) return map;
    try {
        const f = JSON.parse(external_node_fs_namespaceObject.readFileSync(LINKS_FILE, 'utf8'));
        for (const l of f.links)map.set(l.term, l.topics);
    } catch  {
    /* ignore malformed file */ }
    return map;
}

;// CONCATENATED MODULE: ./src/english-learner/hooks/session-context.ts





const REVIEW_LIMIT = 3;
const META_KEY = 'last_review_date';
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
async function main() {
    await readStdin();
    if (!external_node_fs_namespaceObject.existsSync(DB_PATH)) return;
    const db = db_getDb();
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(META_KEY);
    const today = todayISO();
    if (row?.value === today) return;
    const candidates = getReviewCandidates(REVIEW_LIMIT);
    if (candidates.length === 0) return;
    const links = readLinksMap();
    const lines = candidates.map((c)=>{
        const def = c.definition.length > 80 ? `${c.definition.slice(0, 77)}...` : c.definition;
        const matchedTopics = links.get(c.item);
        const wikiHint = matchedTopics && matchedTopics.length ? ` \u{21AA} wiki: ${matchedTopics.slice(0, 2).join(', ')}` : '';
        return `  \u{2022} ${c.type === 'phrase' ? '"' : ''}${c.item}${c.type === 'phrase' ? '"' : ''} (mastery ${c.mastery}) \u{2014} ${def}${wikiHint}`;
    });
    injectContext([
        `[english-learner review] Daily refresh \u{2014} ${candidates.length} due-for-review item(s):`,
        ...lines,
        'When the user next references one of these, prefer it over fresh lookups, and bump mastery via batch_save once recalled correctly.'
    ].join('\n'));
    db.prepare('INSERT INTO meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(META_KEY, today);
}
main().catch(()=>process.exit(0));

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
