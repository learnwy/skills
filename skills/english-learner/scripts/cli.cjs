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

;// CONCATENATED MODULE: ./src/shared/cli.ts
function showHelp(opts) {
    const names = Object.keys(opts.commands);
    const width = Math.max(...names.map((n)=>n.length), 12);
    console.log(`Usage: node cli.cjs <subcommand> [args...]\n`);
    console.log(`Subcommands:`);
    for (const n of names){
        console.log(`  ${n.padEnd(width + 2)}${opts.commands[n].description}`);
    }
    console.log(`\nUse "node cli.cjs <subcommand> --help" for subcommand-specific options.`);
}
function dispatch(opts) {
    const args = process.argv.slice(2);
    const sub = args[0];
    if (!sub || sub === '-h' || sub === '--help') {
        showHelp(opts);
        process.exit(sub ? 0 : 1);
    }
    const cmd = opts.commands[sub];
    if (!cmd) {
        console.error(`Unknown subcommand: ${sub}`);
        showHelp(opts);
        process.exit(1);
    }
    Promise.resolve(cmd.run(args.slice(1))).catch((err)=>{
        console.error(err.stack || err.message);
        process.exit(1);
    });
}
function parseArgs(args, aliases = {}) {
    const positional = [];
    const flags = {};
    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        if (arg.startsWith('--')) {
            const key = arg.slice(2);
            const next = args[i + 1];
            if (next !== undefined && !next.startsWith('-')) {
                flags[key] = next;
                i++;
            } else {
                flags[key] = true;
            }
        } else if (arg.startsWith('-') && arg.length > 1) {
            const short = arg.slice(1);
            const key = aliases[short] || short;
            const next = args[i + 1];
            if (next !== undefined && !next.startsWith('-')) {
                flags[key] = next;
                i++;
            } else {
                flags[key] = true;
            }
        } else {
            positional.push(arg);
        }
    }
    return {
        positional,
        flags
    };
}

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
                const traeFile = external_node_path_namespaceObject.join(homeDir, dir, 'hooks.json');
                mergeAndWrite(traeFile, config, 'standalone');
                results.push(traeFile);
            }
        }
        if (target === 'claude' || target === 'both') {
            const claudeFile = external_node_path_namespaceObject.join(homeDir, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
    } else {
        const root = projectRoot || getProjectDir();
        if (target === 'trae' || target === 'both') {
            const traeFile = external_node_path_namespaceObject.join(root, '.trae', 'hooks.json');
            mergeAndWrite(traeFile, config, 'standalone');
            results.push(traeFile);
        }
        if (target === 'claude' || target === 'both') {
            const claudeFile = external_node_path_namespaceObject.join(root, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
    }
    return results;
}
function mergeAndWrite(filePath, config, mode) {
    const dir = external_node_path_namespaceObject.dirname(filePath);
    if (!external_node_fs_namespaceObject.existsSync(dir)) external_node_fs_namespaceObject.mkdirSync(dir, {
        recursive: true
    });
    let existing = {};
    if (external_node_fs_namespaceObject.existsSync(filePath)) {
        try {
            existing = JSON.parse(external_node_fs_namespaceObject.readFileSync(filePath, 'utf8'));
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
    external_node_fs_namespaceObject.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
}
function uninstallHooks(skillId, options = {}) {
    const { target = 'both', scope = 'global', projectRoot } = options;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const root = projectRoot || getProjectDir();
    const files = [];
    if (scope === 'global') {
        if (target === 'trae' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(homeDir, '.trae', 'hooks.json'));
            files.push(external_node_path_namespaceObject.join(homeDir, '.trae-cn', 'hooks.json'));
        }
        if (target === 'claude' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(homeDir, '.claude', 'settings.json'));
        }
    } else {
        if (target === 'trae' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(root, '.trae', 'hooks.json'));
        }
        if (target === 'claude' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(root, '.claude', 'settings.json'));
        }
    }
    for (const filePath of files){
        if (!external_node_fs_namespaceObject.existsSync(filePath)) continue;
        try {
            const content = JSON.parse(external_node_fs_namespaceObject.readFileSync(filePath, 'utf8'));
            const hooks = content.hooks;
            if (!hooks) continue;
            for (const [event, groups] of Object.entries(hooks)){
                hooks[event] = groups.filter((g)=>{
                    const cmds = (g.hooks || []).map((h)=>h.command || '');
                    return !cmds.some((cmd)=>cmd.includes(skillId));
                });
                if (hooks[event].length === 0) delete hooks[event];
            }
            external_node_fs_namespaceObject.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
        } catch  {
        /* swallow */ }
    }
}

;// CONCATENATED MODULE: external "node:os"
const external_node_os_namespaceObject = require("node:os");
;// CONCATENATED MODULE: ./src/shared/fs-utils.ts


function nowIso() {
    return new Date().toISOString();
}
function ensureDir(dir) {
    if (!external_node_fs_namespaceObject.existsSync(dir)) external_node_fs_namespaceObject.mkdirSync(dir, {
        recursive: true
    });
}
function readJsonSafe(file, fallback) {
    if (!fs.existsSync(file)) return fallback;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch  {
        return fallback;
    }
}
function writeJson(file, value) {
    ensureDir(path.dirname(file));
    fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

;// CONCATENATED MODULE: ./src/shared/log.ts




const LEVEL_RANK = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
};
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const KEEP_GENERATIONS = 3;
function logRoot() {
    return external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'logs');
}
function envLevel() {
    const raw = (process.env.LEARNWY_LOG_LEVEL || '').toLowerCase();
    if (raw === 'debug' || raw === 'info' || raw === 'warn' || raw === 'error') return raw;
    return 'warn';
}
function teeStderr() {
    return process.env.LEARNWY_LOG_STDERR === '1';
}
function maxBytes() {
    const raw = process.env.LEARNWY_LOG_MAX_BYTES;
    if (!raw) return DEFAULT_MAX_BYTES;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : DEFAULT_MAX_BYTES;
}
function rotateIfNeeded(file, threshold) {
    let size = 0;
    try {
        size = external_node_fs_namespaceObject.statSync(file).size;
    } catch  {
        return;
    }
    if (size < threshold) return;
    for(let i = KEEP_GENERATIONS; i >= 1; i--){
        const src = i === 1 ? file : `${file}.${i - 1}`;
        const dst = `${file}.${i}`;
        try {
            if (external_node_fs_namespaceObject.existsSync(src)) external_node_fs_namespaceObject.renameSync(src, dst);
        } catch  {
        /* swallow — best-effort rotation */ }
    }
}
function createLogger(skill) {
    function write(level, body) {
        if (LEVEL_RANK[level] < LEVEL_RANK[envLevel()]) return;
        const root = logRoot();
        const file = external_node_path_namespaceObject.join(root, `${skill}.log`);
        const line = `${nowIso()} [${level}] ${skill}: ${body}\n`;
        try {
            ensureDir(root);
            rotateIfNeeded(file, maxBytes());
            external_node_fs_namespaceObject.appendFileSync(file, line);
        } catch  {
        /* never break the caller on disk error */ }
        if (teeStderr()) {
            try {
                process.stderr.write(line);
            } catch  {}
        }
    }
    return {
        debug: (msg)=>write('debug', msg),
        info: (msg)=>write('info', msg),
        warn: (msg)=>write('warn', msg),
        error: (msg)=>write('error', msg instanceof Error ? `${msg.message}\n${msg.stack || ''}` : msg)
    };
}

;// CONCATENATED MODULE: ./src/shared/install-entry.ts





function skillRoot() {
    return external_node_path_namespaceObject.dirname(external_node_path_namespaceObject.dirname(__filename));
}
function defaultConfigPath() {
    return external_node_path_namespaceObject.join(skillRoot(), 'hooks.json');
}
function defaultSkillId() {
    return external_node_path_namespaceObject.basename(skillRoot());
}
function resolveOptions(flags) {
    return {
        target: flags.target || 'both',
        scope: flags.scope || 'global',
        projectRoot: typeof flags.root === 'string' ? external_node_path_namespaceObject.resolve(flags.root) : process.cwd()
    };
}
const installCommand = {
    description: 'Install IDE hooks from this skill into ~/.claude/ and ~/.trae/',
    run: (args)=>{
        const log = createLogger(defaultSkillId());
        const { flags } = parseArgs(args);
        const cfgPath = typeof flags.config === 'string' ? external_node_path_namespaceObject.resolve(flags.config) : defaultConfigPath();
        if (!external_node_fs_namespaceObject.existsSync(cfgPath)) {
            log.error(`install: hooks.json not found at ${cfgPath}`);
            console.error(`Error: hooks.json not found at ${cfgPath}`);
            process.exit(1);
        }
        const config = JSON.parse(external_node_fs_namespaceObject.readFileSync(cfgPath, 'utf8'));
        const results = installHooks(config, resolveOptions(flags));
        log.info(`install: wrote ${results.length} target file(s)`);
        results.forEach((f)=>console.log(`\u{2705} Installed to: ${f}`));
    }
};
const uninstallCommand = {
    description: 'Remove this skill\'s hook entries from IDE config files',
    run: (args)=>{
        const log = createLogger(defaultSkillId());
        const { flags } = parseArgs(args);
        const skillId = typeof flags['skill-id'] === 'string' ? flags['skill-id'] : defaultSkillId();
        uninstallHooks(skillId, resolveOptions(flags));
        log.info(`uninstall: removed entries matching ${skillId}`);
        console.log(`\u{2705} Uninstalled hooks matching: ${skillId}`);
    }
};

;// CONCATENATED MODULE: external "node:sqlite"
const external_node_sqlite_namespaceObject = require("node:sqlite");
;// CONCATENATED MODULE: ./src/shared/db.ts




const DATA_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'english-learner');
const DB_PATH = external_node_path_namespaceObject.join(DATA_ROOT, 'data.db');
const LEGACY_DATA_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.english-learner');
function migrateLegacyRoot() {
    if (external_node_fs_namespaceObject.existsSync(DATA_ROOT)) return;
    if (!external_node_fs_namespaceObject.existsSync(LEGACY_DATA_ROOT)) return;
    external_node_fs_namespaceObject.mkdirSync(external_node_path_namespaceObject.dirname(DATA_ROOT), {
        recursive: true
    });
    try {
        external_node_fs_namespaceObject.renameSync(LEGACY_DATA_ROOT, DATA_ROOT);
    } catch  {
        external_node_fs_namespaceObject.cpSync(LEGACY_DATA_ROOT, DATA_ROOT, {
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
    external_node_fs_namespaceObject.mkdirSync(DATA_ROOT, {
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

;// CONCATENATED MODULE: ./src/english-learner/lib/vocab-store.ts


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
    const db = db_getDb();
    const row = db.prepare('SELECT * FROM words WHERE word = ?').get(word.toLowerCase());
    return db_rowToWord(row);
}
function saveWord(word, opts = {}) {
    const db = db_getDb();
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
    const db = db_getDb();
    const key = word.toLowerCase();
    const result = db.prepare(`
    UPDATE words SET lookup_count = lookup_count + 1, last_lookup = ? WHERE word = ?
  `).run(nowIso(), key);
    if (result.changes === 0) return 0;
    const row = db.prepare('SELECT lookup_count FROM words WHERE word = ?').get(key);
    return row?.lookup_count || 0;
}
function getPhrase(phrase) {
    const db = db_getDb();
    const row = db.prepare('SELECT * FROM phrases WHERE phrase = ?').get(phrase.toLowerCase());
    return rowToPhrase(row);
}
function savePhrase(phrase, opts = {}) {
    const db = db_getDb();
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
    const db = db_getDb();
    db.prepare('INSERT INTO history (ts, query, query_type) VALUES (?, ?, ?)').run(nowIso(), query, queryType);
}
function updateMastery(item, isWord, correct) {
    const db = db_getDb();
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
    const db = db_getDb();
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
    const db = db_getDb();
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
                const wordRec = db_rowToWord(refreshed);
                if (wordRec) result.found[w] = wordRec;
            } else {
                result.not_found.push(w);
            }
        }
    });
    return result;
}
function batchSaveWords(wordsData) {
    const db = db_getDb();
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

;// CONCATENATED MODULE: ./src/english-learner/cmd/vocab.ts

const actions = {
    get_word: (args)=>{
        const result = getWord(args[0]);
        if (result) {
            incrementLookup(args[0]);
            console.log(JSON.stringify(result, null, 2));
        } else {
            console.log(JSON.stringify({
                error: 'not_found'
            }));
        }
    },
    get_phrase: (args)=>{
        const phrase = args.join(' ');
        const result = getPhrase(phrase);
        console.log(result ? JSON.stringify(result, null, 2) : JSON.stringify({
            error: 'not_found'
        }));
    },
    save_word: (args)=>{
        const [word, definition, phonetic = '', examplesJson] = args;
        const examples = examplesJson ? JSON.parse(examplesJson) : [];
        console.log(JSON.stringify(saveWord(word, {
            definition,
            phonetic,
            examples
        }), null, 2));
    },
    save_phrase: (args)=>{
        const [phrase, definition, phonetic = '', examplesJson] = args;
        const examples = examplesJson ? JSON.parse(examplesJson) : [];
        console.log(JSON.stringify(savePhrase(phrase, {
            definition,
            phonetic,
            examples
        }), null, 2));
    },
    log_query: (args)=>{
        logQuery(args[0], args[1]);
        console.log(JSON.stringify({
            status: 'logged'
        }));
    },
    stats: ()=>console.log(JSON.stringify(getStats(), null, 2)),
    update_mastery: (args)=>{
        const [item, isWordStr, correctStr] = args;
        const isWord = isWordStr.toLowerCase() === 'true';
        const correct = correctStr.toLowerCase() === 'true';
        console.log(JSON.stringify({
            mastery: updateMastery(item, isWord, correct)
        }));
    },
    batch_get: (args)=>{
        const words = JSON.parse(args[0]);
        console.log(JSON.stringify(batchGetWords(words), null, 2));
    },
    batch_save: (args)=>{
        const wordsData = JSON.parse(args[0]);
        console.log(JSON.stringify(batchSaveWords(wordsData), null, 2));
    }
};
const minArgs = {
    get_word: 1,
    get_phrase: 1,
    save_word: 2,
    save_phrase: 2,
    log_query: 2,
    update_mastery: 3,
    batch_get: 1,
    batch_save: 1
};
const command = {
    description: 'Word/phrase CRUD + batch operations + stats',
    run: (args)=>{
        if (args.length < 1) {
            console.log('Usage: cli.cjs vocab <action> [args]');
            console.log(`Actions: ${Object.keys(actions).join(', ')}`);
            process.exit(1);
        }
        const action = args[0];
        const fn = actions[action];
        if (!fn) {
            console.log(JSON.stringify({
                error: 'invalid_command'
            }));
            process.exit(1);
        }
        const rest = args.slice(1);
        if (rest.length < (minArgs[action] || 0)) {
            console.log(JSON.stringify({
                error: 'missing_arguments',
                action,
                expected: minArgs[action]
            }));
            process.exit(1);
        }
        fn(rest);
    }
};

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
    const db = db_getDb();
    const rows = db.prepare(`SELECT * FROM words ${orderClause} LIMIT ?`).all(limit);
    return rows.map((r)=>db_rowToWord(r)).filter((w)=>w !== null);
}
function fetchPhrases(orderClause, limit) {
    const db = db_getDb();
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
    const db = db_getDb();
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
const quiz_command = {
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
};

;// CONCATENATED MODULE: ./src/english-learner/cmd/sentence.ts

function sentence_getWord(word) {
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
        const db = db_getDb();
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
    const db = db_getDb();
    const placeholders = words.map(()=>'?').join(',');
    const rows = db.prepare(`SELECT * FROM words WHERE word IN (${placeholders})`).all(...words.map((w)=>w.toLowerCase()));
    const byKey = new Map(rows.map((r)=>[
            r.word,
            r
        ]));
    for (const w of words){
        const row = byKey.get(w.toLowerCase());
        const wordRec = db_rowToWord(row);
        if (wordRec) result.known[w] = wordRec;
        else result.unknown.push(w);
    }
    return result;
}
const sentence_command = {
    description: 'Sentence parsing, classification, and word extraction',
    run: (args)=>{
        if (args.length < 1) {
            console.log('Usage: cli.cjs sentence <action> [args]');
            console.log('Actions: classify, parse, extract, batch_check');
            process.exit(1);
        }
        const action = args[0];
        if (action === 'classify' && args.length >= 2) {
            const text = args.slice(1).join(' ');
            console.log(JSON.stringify({
                type: classifyInput(text),
                text
            }));
        } else if (action === 'parse' && args.length >= 2) {
            console.log(JSON.stringify(parseSentence(args.slice(1).join(' ')), null, 2));
        } else if (action === 'extract' && args.length >= 2) {
            console.log(JSON.stringify({
                words: extractWords(args.slice(1).join(' '))
            }));
        } else if (action === 'batch_check' && args.length >= 2) {
            console.log(JSON.stringify(batchCheckWords(args.slice(1)), null, 2));
        } else {
            console.log(JSON.stringify({
                error: 'invalid_command'
            }));
            process.exit(1);
        }
    }
};

;// CONCATENATED MODULE: ./src/english-learner/cmd/migrate.ts



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
const migrate_packWordData = (e)=>JSON.stringify({
        definitions: e.definitions || [],
        phonetic: e.phonetic || '',
        synonyms: e.synonyms || [],
        antonyms: e.antonyms || []
    });
const migrate_packPhraseData = (e)=>JSON.stringify({
        definition: e.definition || '',
        phonetic: e.phonetic || '',
        literal: e.literal || '',
        examples: e.examples || []
    });
function migrate({ dryRun = false } = {}) {
    const db = db_getDb();
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
                    wordUpsert.run(word, migrate_packWordData(entry), entry.mastery || 0, entry.lookup_count || 0, entry.created_at || new Date().toISOString(), entry.updated_at || entry.created_at || new Date().toISOString(), entry.last_lookup || null);
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
                    phraseUpsert.run(phrase, migrate_packPhraseData(entry), entry.mastery || 0, entry.lookup_count || 0, entry.created_at || new Date().toISOString(), entry.updated_at || entry.created_at || new Date().toISOString(), entry.last_lookup || null);
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
const migrate_command = {
    description: 'Import legacy ~/.english-learner/{words,phrases,history}/*.json into SQLite',
    run: (args)=>{
        const dryRun = args.includes('--dry-run');
        const out = migrate({
            dryRun
        });
        console.log(JSON.stringify({
            dryRun,
            ...out
        }, null, 2));
    }
};

;// CONCATENATED MODULE: ./src/english-learner/cmd/link-wiki.ts





const WIKI_TOPICS = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'llm-wiki', 'wiki', 'topics.txt');
const LINKS_FILE = external_node_path_namespaceObject.join(DATA_ROOT, 'wiki-links.json');
const MIN_TERM_LEN = 4;
const MAX_LINKS_PER_TERM = 3;
function loadTopicSegments() {
    const lines = [];
    const segmentIndex = new Map();
    if (!external_node_fs_namespaceObject.existsSync(WIKI_TOPICS)) return {
        lines,
        segmentIndex
    };
    const raw = external_node_fs_namespaceObject.readFileSync(WIKI_TOPICS, 'utf8');
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
    const db = db_getDb();
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
const link_wiki_command = {
    description: 'Match vocab terms to llm-wiki topics; write ~/.learnwy/english-learner/wiki-links.json',
    run: (args)=>{
        const { flags } = parseArgs(args);
        if (!external_node_fs_namespaceObject.existsSync(WIKI_TOPICS)) {
            console.error(`llm-wiki topics file not found: ${WIKI_TOPICS}`);
            console.error("Skipping link-wiki \u2014 initialize llm-wiki first.");
            process.exit(0);
        }
        const result = buildLinks();
        if (flags['dry-run']) {
            console.log(JSON.stringify(result, null, 2));
            return;
        }
        if (!external_node_fs_namespaceObject.existsSync(DATA_ROOT)) external_node_fs_namespaceObject.mkdirSync(DATA_ROOT, {
            recursive: true
        });
        external_node_fs_namespaceObject.writeFileSync(LINKS_FILE, JSON.stringify(result, null, 2) + '\n');
        console.log(`Wrote ${result.total_terms_linked} link(s) (of ${result.total_terms_scanned} terms) to ${LINKS_FILE}`);
    }
};
function readLinksMap() {
    const map = new Map();
    if (!fs.existsSync(LINKS_FILE)) return map;
    try {
        const f = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'));
        for (const l of f.links)map.set(l.term, l.topics);
    } catch  {
    /* ignore malformed file */ }
    return map;
}

;// CONCATENATED MODULE: ./src/english-learner/cli.ts







dispatch({
    name: 'english-learner',
    commands: {
        vocab: command,
        quiz: quiz_command,
        sentence: sentence_command,
        migrate: migrate_command,
        'link-wiki': link_wiki_command,
        install: installCommand,
        uninstall: uninstallCommand
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
