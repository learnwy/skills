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
;// CONCATENATED MODULE: ./src/llm-wiki/lib/constants.ts


const WIKI_ROOT = process.env.LLM_WIKI_ROOT || (0,external_node_path_namespaceObject.join)((0,external_node_os_namespaceObject.homedir)(), '.learnwy', 'llm-wiki');
const WIKI_DIR = (0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'wiki');
const RAW_DIR = (0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'raw');
const PAGE_TYPES = [
    {
        type: 'summaries',
        label: 'Summaries'
    },
    {
        type: 'concepts',
        label: 'Concepts'
    },
    {
        type: 'entities',
        label: 'Entities'
    },
    {
        type: 'comparisons',
        label: 'Comparisons'
    },
    {
        type: 'snippets',
        label: 'Snippets'
    },
    {
        type: 'troubleshooting',
        label: 'Troubleshooting'
    },
    {
        type: 'decisions',
        label: 'Decisions'
    },
    {
        type: 'cheatsheets',
        label: 'Cheatsheets'
    }
];
const PAGE_DIRS = PAGE_TYPES.map((p)=>p.type);
const RAW_SUBDIRS = (/* unused pure expression or super */ null && ([
    'books',
    'articles',
    'papers',
    'notes',
    'podcasts',
    'transcripts',
    'snippets',
    'troubleshooting',
    'specs',
    'decisions'
]));

;// CONCATENATED MODULE: ./src/llm-wiki/lib/session-scan.ts



function scanSession() {
    const topicsFile = external_node_path_namespaceObject.join(WIKI_ROOT, 'wiki', 'topics.txt');
    if (!external_node_fs_namespaceObject.existsSync(topicsFile)) return null;
    const topics = external_node_fs_namespaceObject.readFileSync(topicsFile, 'utf8').trim();
    if (!topics) return null;
    const topicLines = topics.split('\n').slice(0, 30);
    return [
        '[llm-wiki] Personal wiki available at ~/.learnwy/llm-wiki/.',
        `Known topics (${topicLines.length}): ${topicLines.join(', ')}`,
        'For complex knowledge questions, check wiki pages before answering.'
    ].join('\n');
}

;// CONCATENATED MODULE: external "node:sqlite"
const external_node_sqlite_namespaceObject = require("node:sqlite");
;// CONCATENATED MODULE: ./src/shared/db.ts




const db_DATA_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'english-learner');
const DB_PATH = external_node_path_namespaceObject.join(db_DATA_ROOT, 'data.db');
const MIGRATIONS = [
    {
        version: 1,
        up: `
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
    `
    },
    {
        version: 2,
        up: `
      ALTER TABLE words ADD COLUMN next_review_at TEXT;
      ALTER TABLE phrases ADD COLUMN next_review_at TEXT;
      CREATE INDEX IF NOT EXISTS idx_words_next_review ON words(next_review_at);
      CREATE INDEX IF NOT EXISTS idx_phrases_next_review ON phrases(next_review_at);
    `
    }
];
function intervalDaysForMastery(mastery) {
    if (mastery >= 90) return 90;
    if (mastery >= 70) return 30;
    if (mastery >= 50) return 14;
    if (mastery >= 30) return 7;
    if (mastery >= 10) return 3;
    return 1;
}
function nextReviewAt(mastery, fromDate = new Date()) {
    const next = new Date(fromDate);
    next.setUTCDate(next.getUTCDate() + intervalDaysForMastery(mastery));
    return next.toISOString();
}
function applyMigrations(db) {
    db.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);');
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get('schema_version');
    let current = row?.value ? parseInt(row.value, 10) : 0;
    for (const m of MIGRATIONS){
        if (m.version <= current) continue;
        db.exec('BEGIN');
        try {
            db.exec(m.up);
            db.prepare('INSERT INTO meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run('schema_version', String(m.version));
            db.exec('COMMIT');
        } catch (err) {
            db.exec('ROLLBACK');
            throw err;
        }
        current = m.version;
    }
}
let _db = null;
function db_getDb() {
    if (_db) return _db;
    external_node_fs_namespaceObject.mkdirSync(db_DATA_ROOT, {
        recursive: true
    });
    _db = new external_node_sqlite_namespaceObject.DatabaseSync(DB_PATH);
    _db.exec('PRAGMA journal_mode = WAL;');
    _db.exec('PRAGMA foreign_keys = ON;');
    applyMigrations(_db);
    return _db;
}
function _resetDbForTesting() {
    _db = null;
}
const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version;
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
           CASE
             WHEN next_review_at IS NULL THEN 1000 + (100 - mastery) + lookup_count * 5
             WHEN next_review_at <= datetime('now') THEN 500 + (100 - mastery) + lookup_count * 5
             ELSE (100 - mastery) + lookup_count * 5
           END AS score
    FROM words
    ORDER BY score DESC
    LIMIT ?
  `).all(limit);
    const phraseRows = db.prepare(`
    SELECT phrase AS item, mastery, lookup_count, data,
           CASE
             WHEN next_review_at IS NULL THEN 1000 + (100 - mastery) + lookup_count * 5
             WHEN next_review_at <= datetime('now') THEN 500 + (100 - mastery) + lookup_count * 5
             ELSE (100 - mastery) + lookup_count * 5
           END AS score
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

;// CONCATENATED MODULE: ./src/english-learner/lib/session-scan.ts




const REVIEW_LIMIT = 3;
const META_KEY = 'last_review_date';
function todayISO() {
    return new Date().toISOString().slice(0, 10);
}
function session_scan_scanSession() {
    if (!external_node_fs_namespaceObject.existsSync(DB_PATH)) return null;
    const db = db_getDb();
    const row = db.prepare('SELECT value FROM meta WHERE key = ?').get(META_KEY);
    const today = todayISO();
    if (row?.value === today) return null;
    const candidates = getReviewCandidates(REVIEW_LIMIT);
    if (candidates.length === 0) return null;
    const links = readLinksMap();
    const lines = candidates.map((c)=>{
        const def = c.definition.length > 80 ? `${c.definition.slice(0, 77)}...` : c.definition;
        const matchedTopics = links.get(c.item);
        const wikiHint = matchedTopics && matchedTopics.length ? ` \u{21AA} wiki: ${matchedTopics.slice(0, 2).join(', ')}` : '';
        return `  \u{2022} ${c.type === 'phrase' ? '"' : ''}${c.item}${c.type === 'phrase' ? '"' : ''} (mastery ${c.mastery}) \u{2014} ${def}${wikiHint}`;
    });
    db.prepare('INSERT INTO meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(META_KEY, today);
    return [
        `[english-learner review] Daily refresh \u{2014} ${candidates.length} due-for-review item(s):`,
        ...lines,
        'When the user next references one of these, prefer it over fresh lookups, and bump mastery via batch_save once recalled correctly.'
    ].join('\n');
}

;// CONCATENATED MODULE: external "node:child_process"
const external_node_child_process_namespaceObject = require("node:child_process");
;// CONCATENATED MODULE: ./src/learnwy-status/lib/digest.ts




const HOME = external_node_os_namespaceObject.homedir();
const LEARNWY_ROOT = external_node_path_namespaceObject.join(HOME, '.learnwy');
function readVocabSection() {
    if (!external_node_fs_namespaceObject.existsSync(DB_PATH)) return null;
    const db = db_getDb();
    const totalsW = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(lookup_count), 0) AS total_lookups,
      SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered,
      SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning,
      SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_count
    FROM words
  `).get();
    const totalsP = db.prepare(`
    SELECT
      COUNT(*) AS total,
      COALESCE(SUM(lookup_count), 0) AS total_lookups,
      SUM(CASE WHEN mastery >= 80 THEN 1 ELSE 0 END) AS mastered,
      SUM(CASE WHEN mastery >= 30 AND mastery < 80 THEN 1 ELSE 0 END) AS learning,
      SUM(CASE WHEN mastery < 30 THEN 1 ELSE 0 END) AS new_count
    FROM phrases
  `).get();
    const total = (totalsW?.total || 0) + (totalsP?.total || 0);
    if (total === 0) return null;
    const reviewRows = db.prepare(`
    SELECT item, mastery, lookup_count, score FROM (
      SELECT word AS item, mastery, lookup_count, (100 - mastery) + lookup_count * 5 AS score FROM words
      UNION ALL
      SELECT phrase AS item, mastery, lookup_count, (100 - mastery) + lookup_count * 5 AS score FROM phrases
    )
    ORDER BY score DESC
    LIMIT 3
  `).all();
    return {
        total,
        mastered: (totalsW?.mastered || 0) + (totalsP?.mastered || 0),
        learning: (totalsW?.learning || 0) + (totalsP?.learning || 0),
        new: (totalsW?.new_count || 0) + (totalsP?.new_count || 0),
        total_lookups: (totalsW?.total_lookups || 0) + (totalsP?.total_lookups || 0),
        top_review: reviewRows.map((r)=>r.item)
    };
}
function readWikiSection() {
    const f = external_node_path_namespaceObject.join(LEARNWY_ROOT, 'llm-wiki', 'health.json');
    if (!external_node_fs_namespaceObject.existsSync(f)) return null;
    try {
        const j = JSON.parse(external_node_fs_namespaceObject.readFileSync(f, 'utf8'));
        const ts = Date.parse(j.generated_at);
        return {
            generated_at: j.generated_at,
            age_hours: Number.isFinite(ts) ? Math.round((Date.now() - ts) / (60 * 60 * 1000)) : -1,
            pages: j.totals.pages,
            broken_links: j.totals.broken_links,
            orphans: j.totals.orphans,
            broken_sources: j.totals.broken_sources
        };
    } catch  {
        return null;
    }
}
function readOptimizerSection() {
    const f = external_node_path_namespaceObject.join(LEARNWY_ROOT, 'prompt-optimizer', 'events.jsonl');
    if (!external_node_fs_namespaceObject.existsSync(f)) return null;
    const now = Date.now();
    const cutoff7 = now - 7 * 24 * 60 * 60 * 1000;
    const cutoff30 = now - 30 * 24 * 60 * 60 * 1000;
    let last7 = 0;
    let last30 = 0;
    const byTrigger = {};
    for (const line of external_node_fs_namespaceObject.readFileSync(f, 'utf8').split('\n')){
        if (!line) continue;
        try {
            const e = JSON.parse(line);
            const t = Date.parse(e.ts);
            if (!Number.isFinite(t) || t < cutoff30) continue;
            last30++;
            byTrigger[e.trigger] = (byTrigger[e.trigger] || 0) + 1;
            if (t >= cutoff7) last7++;
        } catch  {
        /* skip */ }
    }
    if (last30 === 0) return null;
    return {
        last_7d: last7,
        last_30d: last30,
        by_trigger_30d: byTrigger
    };
}
function readConsolidationSection() {
    const f = external_node_path_namespaceObject.join(LEARNWY_ROOT, 'knowledge-consolidation', 'last-nudge.json');
    if (!external_node_fs_namespaceObject.existsSync(f)) return null;
    try {
        const j = JSON.parse(external_node_fs_namespaceObject.readFileSync(f, 'utf8'));
        const ts = Date.parse(j.ts);
        if (!Number.isFinite(ts)) return null;
        return {
            last_nudge_at: j.ts,
            hours_ago: Math.round((Date.now() - ts) / (60 * 60 * 1000))
        };
    } catch  {
        return null;
    }
}
function readLogsSection() {
    const dir = external_node_path_namespaceObject.join(LEARNWY_ROOT, 'logs');
    if (!external_node_fs_namespaceObject.existsSync(dir)) return {
        largest_file: null,
        largest_size_bytes: 0,
        rotated_count: 0
    };
    let largestName = null;
    let largestSize = 0;
    let rotated = 0;
    for (const name of external_node_fs_namespaceObject.readdirSync(dir)){
        const p = external_node_path_namespaceObject.join(dir, name);
        let sz = 0;
        try {
            sz = external_node_fs_namespaceObject.statSync(p).size;
        } catch  {
            continue;
        }
        if (/\.log\.\d+$/.test(name)) rotated++;
        if (sz > largestSize) {
            largestSize = sz;
            largestName = name;
        }
    }
    return {
        largest_file: largestName,
        largest_size_bytes: largestSize,
        rotated_count: rotated
    };
}
function buildDigest() {
    return {
        generated_at: new Date().toISOString(),
        vocab: readVocabSection(),
        wiki: readWikiSection(),
        optimizer: readOptimizerSection(),
        consolidation: readConsolidationSection(),
        logs: readLogsSection()
    };
}
function formatHuman(d) {
    const lines = [];
    lines.push(`learnwy status \u{2014} ${d.generated_at}`);
    lines.push('');
    if (d.vocab) {
        lines.push('Vocab (~/.learnwy/english-learner/):');
        lines.push(`  ${d.vocab.total} items \u{2014} ${d.vocab.mastered} mastered, ${d.vocab.learning} learning, ${d.vocab.new} new (${d.vocab.total_lookups} total lookups)`);
        if (d.vocab.top_review.length) {
            lines.push(`  Top review: ${d.vocab.top_review.join(', ')}`);
        }
    } else {
        lines.push("Vocab: (empty \u2014 run english-learner to start collecting)");
    }
    lines.push('');
    if (d.wiki) {
        const stale = d.wiki.age_hours > 24 ? `\u{26A0} ${d.wiki.age_hours}h stale` : `${d.wiki.age_hours}h ago`;
        lines.push(`Wiki health (~/.learnwy/llm-wiki/health.json \u{2014} ${stale}):`);
        lines.push(`  ${d.wiki.pages} pages, ${d.wiki.broken_links} broken links, ${d.wiki.orphans} orphans, ${d.wiki.broken_sources} broken **Source** refs`);
    } else {
        lines.push('Wiki health: (no health.json \u2014 run "llm-wiki health-check")');
    }
    lines.push('');
    if (d.optimizer) {
        const trig = Object.entries(d.optimizer.by_trigger_30d).map(([k, v])=>`${k}=${v}`).join(', ');
        lines.push('Prompt-optimizer:');
        lines.push(`  ${d.optimizer.last_7d} fires in last 7d, ${d.optimizer.last_30d} in 30d (${trig})`);
    } else {
        lines.push('Prompt-optimizer: (no events recorded)');
    }
    lines.push('');
    if (d.consolidation) {
        lines.push(`Knowledge-consolidation: last nudge ${d.consolidation.hours_ago}h ago (${d.consolidation.last_nudge_at})`);
    } else {
        lines.push('Knowledge-consolidation: (no nudges recorded)');
    }
    lines.push('');
    if (d.logs.largest_file) {
        const mb = (d.logs.largest_size_bytes / 1024 / 1024).toFixed(2);
        lines.push(`Logs: largest=${d.logs.largest_file} (${mb} MB), rotated=${d.logs.rotated_count}`);
    } else {
        lines.push('Logs: (none)');
    }
    return lines.join('\n');
}
function formatCompact(d) {
    const parts = [];
    if (d.vocab) {
        parts.push(`vocab=${d.vocab.total} (${d.vocab.mastered}m/${d.vocab.learning}l/${d.vocab.new}n)`);
    }
    if (d.wiki) {
        parts.push(`wiki=${d.wiki.pages}p ${d.wiki.broken_links}brk ${d.wiki.orphans}orphan ${d.wiki.broken_sources}srcdrift`);
    }
    if (d.optimizer) {
        parts.push(`optimizer=${d.optimizer.last_7d}/7d ${d.optimizer.last_30d}/30d`);
    }
    if (d.consolidation) {
        parts.push(`kc-nudge=${d.consolidation.hours_ago}h-ago`);
    }
    return parts.join(" \xb7 ");
}

;// CONCATENATED MODULE: ./src/learnwy-status/lib/session-scan.ts





const STATE_FILE = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'learnwy-status', 'state.json');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const session_scan_HOME = external_node_os_namespaceObject.homedir();
const AGENTS_ROOT = external_node_path_namespaceObject.join(session_scan_HOME, '.agents', 'skills');
const REFRESH_TARGETS = [
    {
        artifact: external_node_path_namespaceObject.join(session_scan_HOME, '.learnwy', 'llm-wiki', 'health.json'),
        precondition: ()=>external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(session_scan_HOME, '.learnwy', 'llm-wiki', 'wiki', 'topics.txt')),
        cli: external_node_path_namespaceObject.join(AGENTS_ROOT, 'llm-wiki', 'scripts', 'cli.cjs'),
        args: [
            'health-check'
        ]
    },
    {
        artifact: external_node_path_namespaceObject.join(session_scan_HOME, '.learnwy', 'english-learner', 'wiki-links.json'),
        precondition: ()=>external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(session_scan_HOME, '.learnwy', 'english-learner', 'data.db')),
        cli: external_node_path_namespaceObject.join(AGENTS_ROOT, 'english-learner', 'scripts', 'cli.cjs'),
        args: [
            'link-wiki'
        ]
    }
];
function isoWeek(d) {
    const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    const dayNum = (t.getUTCDay() + 6) % 7;
    t.setUTCDate(t.getUTCDate() - dayNum + 3);
    const firstThursday = new Date(Date.UTC(t.getUTCFullYear(), 0, 4));
    const week = 1 + Math.round(((t.getTime() - firstThursday.getTime()) / 86400000 - 3 + (firstThursday.getUTCDay() + 6) % 7) / 7);
    return `${t.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}
function readState() {
    if (!external_node_fs_namespaceObject.existsSync(STATE_FILE)) return {};
    try {
        return JSON.parse(external_node_fs_namespaceObject.readFileSync(STATE_FILE, 'utf8'));
    } catch  {
        return {};
    }
}
function writeState(state) {
    try {
        external_node_fs_namespaceObject.mkdirSync(external_node_path_namespaceObject.dirname(STATE_FILE), {
            recursive: true
        });
        external_node_fs_namespaceObject.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    } catch  {
    /* swallow */ }
}
function isStale(p, maxAgeMs) {
    try {
        const s = external_node_fs_namespaceObject.statSync(p);
        return Date.now() - s.mtimeMs > maxAgeMs;
    } catch  {
        return true;
    }
}
function spawnDetached(cli, args) {
    if (!external_node_fs_namespaceObject.existsSync(cli)) return false;
    try {
        const child = (0,external_node_child_process_namespaceObject.spawn)('node', [
            cli,
            ...args
        ], {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
        return true;
    } catch  {
        return false;
    }
}
function autoRefresh() {
    const refreshed = [];
    for (const t of REFRESH_TARGETS){
        if (!t.precondition()) continue;
        if (!isStale(t.artifact, SEVEN_DAYS_MS)) continue;
        if (spawnDetached(t.cli, t.args)) refreshed.push(external_node_path_namespaceObject.basename(t.artifact));
    }
    return refreshed;
}
function lib_session_scan_scanSession() {
    const refreshed = autoRefresh();
    const week = isoWeek(new Date());
    const state = readState();
    if (state.last_status_week === week) {
        if (refreshed.length) {
            return `[learnwy-status] Auto-refreshing stale data: ${refreshed.join(', ')} (background).`;
        }
        return null;
    }
    const digest = buildDigest();
    if (!digest.vocab && !digest.wiki && !digest.optimizer && !digest.consolidation) return null;
    const compact = formatCompact(digest);
    const wikiAlert = digest.wiki && digest.wiki.broken_links > 0 ? `  \u{26A0} wiki: ${digest.wiki.broken_links} broken link(s) \u{2014} run "llm-wiki health-check"` : null;
    const refreshLine = refreshed.length ? `  \u{21BB} auto-refreshing in background: ${refreshed.join(', ')}` : null;
    const lines = [
        `[learnwy-status] Weekly digest (${week}): ${compact}`,
        wikiAlert,
        refreshLine,
        '  Run `learnwy-status status` for the full report.'
    ].filter((l)=>l !== null);
    writeState({
        ...state,
        last_status_week: week
    });
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/learnwy-dispatch/hooks/session-start.ts




const SCANNERS = [
    {
        name: 'llm-wiki',
        scan: scanSession
    },
    {
        name: 'english-learner',
        scan: session_scan_scanSession
    },
    {
        name: 'learnwy-status',
        scan: lib_session_scan_scanSession
    }
];
async function main() {
    await readStdin();
    const blocks = [];
    for (const { scan } of SCANNERS){
        try {
            const out = scan();
            if (out) blocks.push(out);
        } catch  {
        /* one bad scanner must not poison the others */ }
    }
    if (blocks.length === 0) return;
    injectContext(blocks.join('\n\n'));
}
main().catch(()=>process.exit(0));

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
