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
function hooks_lib_block(reason) {
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
function wantsTrae(t) {
    return t === 'trae' || t === 'both' || t === 'all';
}
function wantsClaude(t) {
    return t === 'claude' || t === 'both' || t === 'all';
}
function wantsCodex(t) {
    return t === 'codex' || t === 'both' || t === 'all';
}
function installHooks(config, options = {}) {
    const { target = 'both', scope = 'global', projectRoot } = options;
    const results = [];
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    if (scope === 'global') {
        if (wantsTrae(target)) {
            for (const dir of [
                '.trae',
                '.trae-cn'
            ]){
                const traeFile = external_node_path_namespaceObject.join(homeDir, dir, 'hooks.json');
                mergeAndWrite(traeFile, config, 'standalone');
                results.push(traeFile);
            }
        }
        if (wantsClaude(target)) {
            const claudeFile = external_node_path_namespaceObject.join(homeDir, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
        if (wantsCodex(target)) {
            const codexFile = external_node_path_namespaceObject.join(homeDir, '.codex', 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
        }
    } else {
        const root = projectRoot || getProjectDir();
        if (wantsTrae(target)) {
            const traeFile = external_node_path_namespaceObject.join(root, '.trae', 'hooks.json');
            mergeAndWrite(traeFile, config, 'standalone');
            results.push(traeFile);
        }
        if (wantsClaude(target)) {
            const claudeFile = external_node_path_namespaceObject.join(root, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
        if (wantsCodex(target)) {
            const codexFile = external_node_path_namespaceObject.join(root, '.codex', 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
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
        if (wantsTrae(target)) {
            files.push(external_node_path_namespaceObject.join(homeDir, '.trae', 'hooks.json'));
            files.push(external_node_path_namespaceObject.join(homeDir, '.trae-cn', 'hooks.json'));
        }
        if (wantsClaude(target)) {
            files.push(external_node_path_namespaceObject.join(homeDir, '.claude', 'settings.json'));
        }
        if (wantsCodex(target)) {
            files.push(external_node_path_namespaceObject.join(homeDir, '.codex', 'hooks.json'));
        }
    } else {
        if (wantsTrae(target)) {
            files.push(external_node_path_namespaceObject.join(root, '.trae', 'hooks.json'));
        }
        if (wantsClaude(target)) {
            files.push(external_node_path_namespaceObject.join(root, '.claude', 'settings.json'));
        }
        if (wantsCodex(target)) {
            files.push(external_node_path_namespaceObject.join(root, '.codex', 'hooks.json'));
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


function fs_utils_nowIso() {
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
        const line = `${fs_utils_nowIso()} [${level}] ${skill}: ${body}\n`;
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
    description: 'Install IDE hooks from this skill into ~/.claude/, ~/.trae/, ~/.trae-cn/, and ~/.codex/',
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
    },
    {
        version: 3,
        up: `
      CREATE TABLE IF NOT EXISTS corrections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original TEXT NOT NULL,
        corrected TEXT NOT NULL,
        reason TEXT,
        count INTEGER NOT NULL DEFAULT 1,
        first_seen TEXT NOT NULL,
        last_seen TEXT NOT NULL,
        UNIQUE(original, corrected)
      );
      CREATE INDEX IF NOT EXISTS idx_corrections_count ON corrections(count DESC);
      CREATE INDEX IF NOT EXISTS idx_corrections_last_seen ON corrections(last_seen);
      CREATE INDEX IF NOT EXISTS idx_corrections_original ON corrections(original);
    `
    },
    {
        version: 4,
        up: `
      CREATE TABLE IF NOT EXISTS materials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_path TEXT NOT NULL UNIQUE,
        source_type TEXT NOT NULL,
        date TEXT NOT NULL,
        hour TEXT,
        title TEXT,
        topics TEXT,
        level TEXT,
        word_count INTEGER DEFAULT 0,
        imported_at TEXT NOT NULL,
        checksum TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(source_type);
      CREATE INDEX IF NOT EXISTS idx_materials_date ON materials(date);

      CREATE TABLE IF NOT EXISTS material_words (
        material_id INTEGER NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
        word TEXT NOT NULL,
        position INTEGER,
        phonetic TEXT,
        pos TEXT,
        meaning_en TEXT,
        meaning_zh TEXT,
        examples TEXT,
        synonyms TEXT,
        raw_entry TEXT,
        PRIMARY KEY (material_id, word)
      );
      CREATE INDEX IF NOT EXISTS idx_material_words_word ON material_words(word);
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
    external_node_fs_namespaceObject.mkdirSync(DATA_ROOT, {
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
    const now = fs_utils_nowIso();
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
    const initialMastery = existing?.mastery || 0;
    db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at, next_review_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(word) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(key, packWordData(merged), initialMastery, existing?.lookup_count || 0, existing?.created_at || now, now, existing ? null : nextReviewAt(initialMastery));
    return getWord(key);
}
function incrementLookup(word) {
    const db = db_getDb();
    const key = word.toLowerCase();
    const result = db.prepare(`
    UPDATE words SET lookup_count = lookup_count + 1, last_lookup = ? WHERE word = ?
  `).run(fs_utils_nowIso(), key);
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
    const now = fs_utils_nowIso();
    const merged = {
        definition: opts.definition || existing?.definition || '',
        phonetic: opts.phonetic || existing?.phonetic || '',
        literal: opts.literal || existing?.literal || '',
        examples: opts.examples || existing?.examples || []
    };
    const initialMastery = existing?.mastery || 0;
    db.prepare(`
    INSERT INTO phrases (phrase, data, mastery, lookup_count, created_at, updated_at, next_review_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(phrase) DO UPDATE SET
      data = excluded.data,
      updated_at = excluded.updated_at
  `).run(key, packPhraseData(merged), initialMastery, existing?.lookup_count || 0, existing?.created_at || now, now, existing ? null : nextReviewAt(initialMastery));
    return getPhrase(key);
}
function logQuery(query, queryType) {
    const db = db_getDb();
    db.prepare('INSERT INTO history (ts, query, query_type) VALUES (?, ?, ?)').run(fs_utils_nowIso(), query, queryType);
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
    db.prepare(`UPDATE ${table} SET mastery = ?, updated_at = ?, next_review_at = ? WHERE ${col} = ?`).run(next, fs_utils_nowIso(), nextReviewAt(next), key);
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
    const ts = fs_utils_nowIso();
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
    const now = fs_utils_nowIso();
    const upsert = db.prepare(`
    INSERT INTO words (word, data, mastery, lookup_count, created_at, updated_at, next_review_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
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
            const initialMastery = existing?.mastery || 0;
            upsert.run(word, packWordData(merged), initialMastery, existing?.lookup_count || 0, existing?.created_at || now, now, existing ? null : nextReviewAt(initialMastery));
            saved.push(word);
        }
    });
    return {
        saved,
        count: saved.length
    };
}

;// CONCATENATED MODULE: ./src/english-learner/lib/corrections-store.ts



function recordCorrection(input) {
    const db = db_getDb();
    const now = fs_utils_nowIso();
    const original = input.original.trim();
    const corrected = input.corrected.trim();
    if (!original || !corrected) {
        throw new Error('original and corrected are required');
    }
    const upsert = db.prepare(`
    INSERT INTO corrections (original, corrected, reason, count, first_seen, last_seen)
    VALUES (?, ?, ?, 1, ?, ?)
    ON CONFLICT(original, corrected) DO UPDATE SET
      count = count + 1,
      last_seen = excluded.last_seen,
      reason = COALESCE(excluded.reason, corrections.reason)
  `);
    upsert.run(original, corrected, input.reason ?? null, now, now);
    const row = db.prepare('SELECT id, count FROM corrections WHERE original = ? AND corrected = ?').get(original, corrected);
    return row;
}
function batchRecordCorrections(items) {
    const result = {
        recorded: 0,
        skipped: 0,
        word_saves: 0,
        details: []
    };
    const wordItems = [];
    withTransaction(()=>{
        for (const item of items){
            try {
                const r = recordCorrection(item);
                result.recorded += 1;
                result.details.push({
                    original: item.original,
                    corrected: item.corrected,
                    count: r.count
                });
                if (item.words && item.words.length) {
                    for (const w of item.words)wordItems.push(w);
                }
            } catch  {
                result.skipped += 1;
            }
        }
    });
    if (wordItems.length) {
        const saved = batchSaveWords(wordItems);
        result.word_saves = saved.count;
    }
    return result;
}
function getTopCorrections(limit = 5, sinceIso) {
    const db = db_getDb();
    const stmt = sinceIso ? db.prepare(`SELECT original, corrected, reason, count, last_seen FROM corrections
         WHERE last_seen >= ? ORDER BY count DESC, last_seen DESC LIMIT ?`) : db.prepare(`SELECT original, corrected, reason, count, last_seen FROM corrections
         ORDER BY count DESC, last_seen DESC LIMIT ?`);
    const rows = sinceIso ? stmt.all(sinceIso, limit) : stmt.all(limit);
    return rows.map((r)=>({
            original: r.original,
            corrected: r.corrected,
            reason: r.reason,
            count: r.count,
            last_seen: r.last_seen
        }));
}
function getCorrectionStats() {
    const db = db_getDb();
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const total = db.prepare('SELECT COALESCE(SUM(count),0) AS s FROM corrections').get().s;
    const uniquePairs = db.prepare('SELECT COUNT(*) AS c FROM corrections').get().c;
    const recent = db.prepare('SELECT COALESCE(SUM(count),0) AS s FROM corrections WHERE last_seen >= ?').get(cutoff).s;
    return {
        total,
        unique_pairs: uniquePairs,
        recent_count: recent
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
    },
    'record-correction': (args)=>{
        const items = JSON.parse(args[0]);
        console.log(JSON.stringify(batchRecordCorrections(items), null, 2));
    },
    'top-corrections': (args)=>{
        const limit = args[0] ? Number.parseInt(args[0], 10) : 5;
        console.log(JSON.stringify(getTopCorrections(limit), null, 2));
    },
    'corrections-stats': ()=>{
        console.log(JSON.stringify(getCorrectionStats(), null, 2));
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
    batch_save: 1,
    'record-correction': 1
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

;// CONCATENATED MODULE: external "node:child_process"
const external_node_child_process_namespaceObject = require("node:child_process");
;// CONCATENATED MODULE: ./src/english-learner/lib/report-data.ts



const ALL_ITEMS_CAP = 5000;
const TOP_CORRECTIONS_LIMIT = 50;
const ACTIVITY_DAYS = 30;
const DUE_LIMIT = 200;
function dayKey(date) {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}
function denseActivity(rows, now) {
    const buckets = new Map();
    for(let i = ACTIVITY_DAYS - 1; i >= 0; i--){
        const d = new Date(now);
        d.setUTCDate(d.getUTCDate() - i);
        const key = dayKey(d);
        buckets.set(key, {
            day: key,
            total: 0,
            by_type: {}
        });
    }
    for (const row of rows){
        const bucket = buckets.get(row.day);
        if (!bucket) continue;
        bucket.total += row.c;
        bucket.by_type[row.query_type] = (bucket.by_type[row.query_type] || 0) + row.c;
    }
    return Array.from(buckets.values());
}
function collectReportData(now = new Date()) {
    const db = db_getDb();
    const nowIso = now.toISOString();
    const dueWordRows = db.prepare(`SELECT * FROM words WHERE next_review_at IS NOT NULL AND next_review_at <= ? ORDER BY next_review_at LIMIT ?`).all(nowIso, DUE_LIMIT);
    const duePhraseRows = db.prepare(`SELECT * FROM phrases WHERE next_review_at IS NOT NULL AND next_review_at <= ? ORDER BY next_review_at LIMIT ?`).all(nowIso, DUE_LIMIT);
    const allWordRows = db.prepare(`SELECT * FROM words ORDER BY mastery DESC, lookup_count DESC LIMIT ?`).all(ALL_ITEMS_CAP + 1);
    const allPhraseRows = db.prepare(`SELECT * FROM phrases ORDER BY mastery DESC, lookup_count DESC LIMIT ?`).all(ALL_ITEMS_CAP + 1);
    const cutoff = new Date(now);
    cutoff.setUTCDate(cutoff.getUTCDate() - ACTIVITY_DAYS + 1);
    cutoff.setUTCHours(0, 0, 0, 0);
    const activityRows = db.prepare(`SELECT date(ts) AS day, query_type, count(*) AS c FROM history WHERE ts >= ? GROUP BY day, query_type`).all(cutoff.toISOString());
    const allWords = allWordRows.slice(0, ALL_ITEMS_CAP).map(db_rowToWord).filter((w)=>w !== null);
    const allPhrases = allPhraseRows.slice(0, ALL_ITEMS_CAP).map(rowToPhrase).filter((p)=>p !== null);
    return {
        generated_at: nowIso,
        stats: getStats(),
        correction_stats: getCorrectionStats(),
        due_words: dueWordRows.map(db_rowToWord).filter((w)=>w !== null),
        due_phrases: duePhraseRows.map(rowToPhrase).filter((p)=>p !== null),
        all_words: allWords,
        all_phrases: allPhrases,
        words_truncated: allWordRows.length > ALL_ITEMS_CAP,
        phrases_truncated: allPhraseRows.length > ALL_ITEMS_CAP,
        top_corrections: getTopCorrections(TOP_CORRECTIONS_LIMIT),
        activity: denseActivity(activityRows, now),
        materials: collectMaterialsReport(db)
    };
}
function collectMaterialsReport(db) {
    const totalRow = db.prepare('SELECT COUNT(*) as c FROM materials').get();
    if (!totalRow || totalRow.c === 0) return undefined;
    const byTypeRows = db.prepare('SELECT source_type, COUNT(*) as count FROM materials GROUP BY source_type').all();
    const byType = {};
    for (const row of byTypeRows)byType[row.source_type] = row.count;
    const dateRange = db.prepare('SELECT MIN(date) as min_date, MAX(date) as max_date FROM materials').get();
    const wordsPerSource = db.prepare('SELECT m.source_type, COUNT(DISTINCT mw.word) as unique_words FROM material_words mw JOIN materials m ON mw.material_id = m.id GROUP BY m.source_type').all();
    const recentMaterials = db.prepare('SELECT date, source_type, word_count FROM materials ORDER BY date DESC LIMIT 10').all();
    return {
        total_materials: totalRow.c,
        by_type: byType,
        date_range: dateRange.min_date ? {
            from: dateRange.min_date,
            to: dateRange.max_date
        } : null,
        words_per_source: wordsPerSource,
        recent_materials: recentMaterials
    };
}

;// CONCATENATED MODULE: ./src/english-learner/lib/report-html.ts
function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
const STYLE = `
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #6b7280;
  --card: #f9fafb;
  --border: #e5e7eb;
  --accent: #2563eb;
  --new: #94a3b8;
  --learning: #f59e0b;
  --mastered: #10b981;
  --heat-0: #ebedf0;
  --heat-1: #c6e48b;
  --heat-2: #7bc96f;
  --heat-3: #239a3b;
  --heat-4: #196127;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0b0d;
    --fg: #e5e7eb;
    --muted: #9ca3af;
    --card: #18181b;
    --border: #27272a;
    --accent: #60a5fa;
    --heat-0: #1b1b1e;
    --heat-1: #0e4429;
    --heat-2: #006d32;
    --heat-3: #26a641;
    --heat-4: #39d353;
  }
}
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.5;
  padding-left: 240px;
}
aside.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  padding: 20px 16px;
  border-right: 1px solid var(--border);
  background: var(--card);
  z-index: 20;
}
aside.sidebar h1 { margin: 0 0 4px; font-size: 18px; }
aside.sidebar .meta { font-size: 12px; color: var(--muted); margin-bottom: 12px; }
aside.sidebar nav { display: flex; flex-direction: column; gap: 2px; margin: 12px 0; }
aside.sidebar nav a {
  text-decoration: none;
  color: var(--fg);
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
aside.sidebar nav a:hover { background: var(--border); }
aside.sidebar nav a.active { background: var(--accent); color: white; }
aside.sidebar nav a.active .count { color: rgba(255, 255, 255, 0.85); }
aside.sidebar nav a .count { color: var(--muted); font-size: 11px; }
aside.sidebar .global-search {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  font-size: 13px;
  margin-bottom: 4px;
}
aside.sidebar .legend { margin-top: 16px; font-size: 11px; color: var(--muted); }
aside.sidebar .legend .row { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
aside.sidebar .legend .swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
aside.sidebar .shortcut-hint {
  margin-top: 16px;
  font-size: 11px;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
aside.sidebar .shortcut-hint kbd {
  font-family: ui-monospace, monospace;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 10px;
}
main { padding: 24px 32px; max-width: 1200px; min-width: 0; }
main section { margin-bottom: 32px; scroll-margin-top: 12px; }
main section header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
main section header .controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
h2 { margin: 0 0 4px; font-size: 18px; }
h2 .badge { color: var(--muted); font-weight: 400; margin-left: 8px; font-size: 13px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
}
.card .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.card .value { font-size: 26px; font-weight: 600; margin-top: 4px; }
.card .delta { font-size: 11px; color: var(--muted); margin-top: 2px; }
.search, select, .csv-btn {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  font-size: 13px;
}
.csv-btn { cursor: pointer; }
.csv-btn:hover { background: var(--card); }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--fg);
  font-size: 12px;
  cursor: pointer;
}
.chip.active { background: var(--accent); color: white; border-color: var(--accent); }
.chip:hover:not(.active) { background: var(--card); }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); }
th { cursor: pointer; user-select: none; font-weight: 600; color: var(--muted); }
th.sorted::after { content: " \u{25BE}"; color: var(--accent); }
th.sorted.asc::after { content: " \u{25B4}"; }
td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.mastery { display: inline-block; width: 60px; height: 8px; border-radius: 4px; background: var(--border); position: relative; vertical-align: middle; }
.mastery > span { display: block; height: 100%; border-radius: 4px; background: var(--accent); }
.mastery[data-bucket="new"] > span { background: var(--new); }
.mastery[data-bucket="learning"] > span { background: var(--learning); }
.mastery[data-bucket="mastered"] > span { background: var(--mastered); }
.due-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); }
.due-row:last-child { border-bottom: none; }
.due-row .term { font-weight: 600; }
.due-row .meta-text { font-size: 12px; color: var(--muted); }
.empty {
  background: var(--card);
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: var(--muted);
  font-style: italic;
}
.empty code {
  font-style: normal;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}
.activity { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
.heatmap {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  grid-auto-columns: 14px;
  gap: 2px;
  margin-top: 8px;
}
.heatmap .cell {
  border-radius: 2px;
  background: var(--heat-0);
}
.heatmap .cell[data-level="1"] { background: var(--heat-1); }
.heatmap .cell[data-level="2"] { background: var(--heat-2); }
.heatmap .cell[data-level="3"] { background: var(--heat-3); }
.heatmap .cell[data-level="4"] { background: var(--heat-4); }
.heatmap .cell.placeholder { background: transparent; }
.heatmap-legend { display: flex; gap: 4px; align-items: center; font-size: 11px; color: var(--muted); margin-top: 12px; justify-content: flex-end; }
.heatmap-legend .swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
#back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
  font-size: 18px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
  z-index: 50;
}
#back-to-top.visible { opacity: 1; pointer-events: auto; }
#shortcuts-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
#shortcuts-modal.open { display: flex; }
#shortcuts-modal .panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  font-size: 13px;
}
#shortcuts-modal kbd {
  font-family: ui-monospace, monospace;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 11px;
  margin-right: 4px;
}
#shortcuts-modal .row { display: flex; justify-content: space-between; gap: 24px; margin: 6px 0; }

@media (max-width: 768px) {
  body { padding-left: 0; }
  aside.sidebar { position: static; height: auto; width: 100%; border-right: none; border-bottom: 1px solid var(--border); z-index: auto; }
  main { padding: 16px; }
}

@media print {
  body { display: block; color: black; background: white; }
  aside.sidebar, #back-to-top, #shortcuts-modal, .controls, .chips, .global-search { display: none !important; }
  main { padding: 0; max-width: 100%; }
  .card, .activity, .empty { border: 1px solid #ccc; background: white; }
  table { font-size: 11px; }
  th { color: black; }
  details { page-break-inside: avoid; }
}
`;
const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById('report-data').textContent);
  const bucketFor = (m) => m >= 70 ? 'mastered' : m >= 30 ? 'learning' : 'new';
  const heatLevel = (n) => n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4;

  function makeCell(text, opts = {}) {
    const td = document.createElement('td');
    td.textContent = String(text == null ? '' : text);
    if (opts.mono) td.className = 'mono';
    return td;
  }
  function masteryCell(value) {
    const td = document.createElement('td');
    const wrap = document.createElement('span');
    wrap.className = 'mastery';
    wrap.dataset.bucket = bucketFor(value);
    const fill = document.createElement('span');
    fill.style.width = Math.max(0, Math.min(100, value)) + '%';
    wrap.appendChild(fill);
    td.appendChild(wrap);
    const num = document.createElement('span');
    num.style.marginLeft = '8px';
    num.style.fontSize = '12px';
    num.style.color = 'var(--muted)';
    num.textContent = value;
    td.appendChild(num);
    return td;
  }

  function defOf(w) {
    const d = (w.definitions || [])[0];
    return d ? (d.pos ? '(' + d.pos + ') ' : '') + d.meaning : '';
  }

  function csvEscape(v) {
    const s = String(v == null ? '' : v);
    if (/[",\\n\\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function downloadCsv(name, headers, rows) {
    const lines = [headers.join(',')];
    for (const r of rows) lines.push(r.map(csvEscape).join(','));
    const blob = new Blob([lines.join('\\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const tables = {};

  function attachTable(sectionId, allRows, cols, csv) {
    const root = document.getElementById(sectionId);
    if (!root) return;
    const tbody = root.querySelector('tbody');
    const localSearch = root.querySelector('input.search');
    const limitSel = root.querySelector('select.row-limit');
    const csvBtn = root.querySelector('button.csv-btn');
    const ths = root.querySelectorAll('th[data-key]');

    let sortKey = ths[0] && ths[0].dataset.key;
    let sortDir = 'desc';
    let limit = limitSel ? (limitSel.value === 'all' ? Infinity : parseInt(limitSel.value, 10)) : Infinity;
    let bucketFilter = null;
    let localQuery = '';
    let globalQuery = '';

    function compute() {
      let rows = allRows.slice();
      if (bucketFilter) rows = rows.filter((r) => bucketFor(r.mastery) === bucketFilter);
      const q = (globalQuery || localQuery || '').toLowerCase();
      if (q) rows = rows.filter((r) => cols.some((c) => c.search && String(c.search(r)).toLowerCase().includes(q)));
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
      const sliced = rows.slice(0, limit);
      tbody.innerHTML = '';
      for (const r of sliced) {
        const tr = document.createElement('tr');
        for (const c of cols) tr.appendChild(c.cell(r));
        tbody.appendChild(tr);
      }
      const badge = root.querySelector('h2 .badge');
      if (badge) badge.textContent = '(' + sliced.length + (rows.length > sliced.length ? ' of ' + rows.length : '') + ')';
      const emptyEl = root.querySelector('.empty-runtime');
      if (emptyEl) emptyEl.style.display = sliced.length === 0 ? 'block' : 'none';
    }
    function updateThStyles() {
      ths.forEach((th) => {
        th.classList.remove('sorted', 'asc');
        if (th.dataset.key === sortKey) {
          th.classList.add('sorted');
          if (sortDir === 'asc') th.classList.add('asc');
        }
      });
    }
    ths.forEach((th) => th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (key === sortKey) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'desc'; }
      updateThStyles(); compute();
    }));
    if (localSearch) localSearch.addEventListener('input', (e) => { localQuery = e.target.value; compute(); });
    if (limitSel) limitSel.addEventListener('change', (e) => { limit = e.target.value === 'all' ? Infinity : parseInt(e.target.value, 10); compute(); });
    if (csvBtn) csvBtn.addEventListener('click', () => downloadCsv(csv.filename, csv.headers, allRows.map(csv.row)));

    updateThStyles();
    compute();
    return {
      setGlobalQuery: (q) => { globalQuery = q; compute(); },
      setBucket: (b) => { bucketFilter = b; compute(); },
    };
  }

  tables.words = attachTable('words', data.all_words, [
    { cell: (r) => makeCell(r.word, { mono: true }), search: (r) => r.word, key: 'word' },
    { cell: (r) => makeCell(r.phonetic || ''), search: (r) => r.phonetic, key: 'phonetic' },
    { cell: (r) => makeCell(defOf(r)), search: (r) => defOf(r), key: 'definition' },
    { cell: (r) => masteryCell(r.mastery), key: 'mastery' },
    { cell: (r) => makeCell(r.lookup_count), key: 'lookup_count' },
    { cell: (r) => makeCell((r.last_lookup || '').slice(0, 10)), key: 'last_lookup' },
  ], {
    filename: 'english-learner-words.csv',
    headers: ['word', 'phonetic', 'definition', 'mastery', 'lookup_count', 'last_lookup'],
    row: (r) => [r.word, r.phonetic || '', defOf(r), r.mastery, r.lookup_count, r.last_lookup || ''],
  });

  tables.phrases = attachTable('phrases', data.all_phrases, [
    { cell: (r) => makeCell(r.phrase, { mono: true }), search: (r) => r.phrase },
    { cell: (r) => makeCell(r.definition || ''), search: (r) => r.definition },
    { cell: (r) => masteryCell(r.mastery) },
    { cell: (r) => makeCell(r.lookup_count) },
    { cell: (r) => makeCell((r.last_lookup || '').slice(0, 10)) },
  ], {
    filename: 'english-learner-phrases.csv',
    headers: ['phrase', 'definition', 'mastery', 'lookup_count', 'last_lookup'],
    row: (r) => [r.phrase, r.definition || '', r.mastery, r.lookup_count, r.last_lookup || ''],
  });

  tables.corrections = attachTable('corrections', data.top_corrections, [
    { cell: (r) => makeCell(r.original), search: (r) => r.original },
    { cell: (r) => makeCell(r.corrected), search: (r) => r.corrected },
    { cell: (r) => makeCell(r.reason || ''), search: (r) => r.reason },
    { cell: (r) => makeCell(r.count) },
    { cell: (r) => makeCell((r.last_seen || '').slice(0, 10)) },
  ], {
    filename: 'english-learner-corrections.csv',
    headers: ['original', 'corrected', 'reason', 'count', 'last_seen'],
    row: (r) => [r.original, r.corrected, r.reason || '', r.count, r.last_seen || ''],
  });

  // Mastery chips on the words section
  const chips = document.querySelectorAll('.chip[data-bucket]');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const b = chip.dataset.bucket;
    tables.words.setBucket(b === 'all' ? null : b);
  }));

  // Global search across all three tables
  const gs = document.getElementById('global-search');
  if (gs) gs.addEventListener('input', (e) => {
    const q = e.target.value;
    Object.values(tables).forEach((t) => t && t.setGlobalQuery(q));
  });

  // Due list
  const due = document.getElementById('due-list');
  if (due) {
    const items = [
      ...data.due_words.map((w) => ({ term: w.word, kind: 'word', mastery: w.mastery, def: defOf(w) })),
      ...data.due_phrases.map((p) => ({ term: p.phrase, kind: 'phrase', mastery: p.mastery, def: p.definition })),
    ];
    if (items.length === 0) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.innerHTML = 'Nothing due \u{2014} you are caught up. <br><small>Spaced-repetition queue rebuilds as you review words.</small>';
      due.appendChild(e);
    } else {
      for (const it of items) {
        const row = document.createElement('div');
        row.className = 'due-row';
        const left = document.createElement('div');
        const term = document.createElement('div');
        term.className = 'term';
        term.textContent = it.term;
        const def = document.createElement('div');
        def.className = 'meta-text';
        def.textContent = (it.kind === 'phrase' ? '[phrase] ' : '') + (it.def || '');
        left.appendChild(term);
        left.appendChild(def);
        const right = document.createElement('div');
        right.className = 'meta-text';
        right.textContent = 'mastery ' + it.mastery;
        row.appendChild(left);
        row.appendChild(right);
        due.appendChild(row);
      }
    }
  }

  // Heatmap (GitHub-style)
  const hm = document.getElementById('heatmap');
  if (hm && data.activity && data.activity.length) {
    const firstDate = new Date(data.activity[0].day + 'T00:00:00Z');
    const firstDow = firstDate.getUTCDay(); // 0=Sun
    // pad with placeholders so column 1 starts at Sunday
    for (let i = 0; i < firstDow; i++) {
      const ph = document.createElement('div');
      ph.className = 'cell placeholder';
      ph.style.gridRow = String(i + 1);
      ph.style.gridColumn = '1';
      hm.appendChild(ph);
    }
    data.activity.forEach((b, i) => {
      const dayIdx = (firstDow + i) % 7;
      const colIdx = Math.floor((firstDow + i) / 7) + 1;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.level = String(heatLevel(b.total));
      cell.style.gridRow = String(dayIdx + 1);
      cell.style.gridColumn = String(colIdx);
      cell.title = b.day + ': ' + b.total + ' event' + (b.total === 1 ? '' : 's');
      hm.appendChild(cell);
    });
  }

  // Active section highlight in sidebar nav
  const navLinks = Array.from(document.querySelectorAll('aside.sidebar nav a[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      }
    }, { rootMargin: '-30% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s));
  }

  // Back-to-top
  const btn = document.getElementById('back-to-top');
  if (btn) {
    const onScroll = () => {
      if (window.scrollY > 600) btn.classList.add('visible');
      else btn.classList.remove('visible');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  }

  // Keyboard shortcuts
  const help = document.getElementById('shortcuts-modal');
  let waitingForGNext = false;
  let waitingTimer = null;
  function clearG() { waitingForGNext = false; if (waitingTimer) clearTimeout(waitingTimer); }
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.matches('input, textarea, select') || t.isContentEditable)) {
      if (e.key === 'Escape' && t.matches('input.search, input#global-search')) t.blur();
      return;
    }
    if (waitingForGNext) {
      if (e.key === 'w') { location.hash = '#words'; e.preventDefault(); }
      else if (e.key === 'p') { location.hash = '#phrases'; e.preventDefault(); }
      else if (e.key === 'c') { location.hash = '#corrections'; e.preventDefault(); }
      else if (e.key === 'g') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); e.preventDefault(); }
      clearG();
      return;
    }
    if (e.key === '/') { e.preventDefault(); if (gs) gs.focus(); }
    else if (e.key === 'g') { waitingForGNext = true; waitingTimer = setTimeout(clearG, 1000); }
    else if (e.key === 't') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (e.key === '?') { if (help) help.classList.toggle('open'); }
    else if (e.key === 'Escape' && help && help.classList.contains('open')) { help.classList.remove('open'); }
  });
  if (help) help.addEventListener('click', (e) => { if (e.target === help) help.classList.remove('open'); });
})();
`;
function emptyState(message, hint) {
    return `<div class="empty">${escapeHtml(message)}<br><small>${escapeHtml(hint)}</small></div>`;
}
function renderReport(data) {
    const title = `English-Learner Report \u{2014} ${escapeHtml(data.generated_at.slice(0, 16).replace('T', ' '))} UTC`;
    const totalActivity = data.activity.reduce((sum, b)=>sum + b.total, 0);
    const dueCount = data.due_words.length + data.due_phrases.length;
    const limitOpts = `
    <select class="row-limit">
      <option value="50">50</option>
      <option value="200" selected>200</option>
      <option value="1000">1000</option>
      <option value="all">all</option>
    </select>`;
    const emptyWords = data.all_words.length === 0 ? emptyState('No words yet.', 'Run `node scripts/cli.cjs vocab batch_get \'["hello"]\'` to start, or just type any English word in chat.') : '';
    const emptyPhrases = data.all_phrases.length === 0 ? emptyState('No phrases yet.', 'Look up an idiom like "break the ice" in chat \u2014 it will be persisted here.') : '';
    const emptyCorrections = data.top_corrections.length === 0 ? emptyState('No corrections yet.', 'Write in English and grammar fixes will accumulate automatically.') : '';
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${STYLE}</style>
</head>
<body>
<aside class="sidebar">
  <h1>English-Learner</h1>
  <div class="meta">${escapeHtml(data.generated_at.slice(0, 16).replace('T', ' '))} UTC</div>
  <input type="search" id="global-search" class="global-search" placeholder="Search everything\u{2026}">
  <nav>
    <a href="#stats">Overview <span class="count">${data.stats.total_words}</span></a>
    <a href="#due">Due now <span class="count">${dueCount}</span></a>
    <a href="#activity">Activity <span class="count">${totalActivity}</span></a>
    <a href="#words">Words <span class="count">${data.all_words.length}</span></a>
    <a href="#phrases">Phrases <span class="count">${data.all_phrases.length}</span></a>
    <a href="#corrections">Corrections <span class="count">${data.top_corrections.length}</span></a>${data.materials ? `
    <a href="#materials">Materials <span class="count">${data.materials.total_materials}</span></a>` : ''}
  </nav>
  <div class="legend">
    Mastery
    <div class="row"><span class="swatch" style="background: var(--new)"></span> &lt; 30 (new)</div>
    <div class="row"><span class="swatch" style="background: var(--learning)"></span> 30\u{2013}70 (learning)</div>
    <div class="row"><span class="swatch" style="background: var(--mastered)"></span> \u{2265} 70 (mastered)</div>
  </div>
  <div class="shortcut-hint">
    <kbd>/</kbd> search \xb7 <kbd>g</kbd> <kbd>w</kbd>/<kbd>p</kbd>/<kbd>c</kbd> jump \xb7 <kbd>t</kbd> top \xb7 <kbd>?</kbd> help
  </div>
</aside>
<main>
  <section id="stats">
    <h2>Overview</h2>
    <div class="cards">
      <div class="card"><div class="label">Total words</div><div class="value">${data.stats.total_words}</div></div>
      <div class="card"><div class="label">Mastered</div><div class="value" style="color: var(--mastered)">${data.stats.mastered_words}</div><div class="delta">\u{2265} 70 mastery</div></div>
      <div class="card"><div class="label">Learning</div><div class="value" style="color: var(--learning)">${data.stats.learning_words}</div><div class="delta">30\u{2013}70 mastery</div></div>
      <div class="card"><div class="label">New</div><div class="value">${data.stats.new_words}</div><div class="delta">&lt; 30 mastery</div></div>
      <div class="card"><div class="label">Total lookups</div><div class="value">${data.stats.total_lookups}</div></div>
      <div class="card"><div class="label">Corrections</div><div class="value">${data.correction_stats.total}</div><div class="delta">${data.correction_stats.unique_pairs} unique pairs</div></div>
    </div>
  </section>

  <section id="due">
    <header><h2>Due now <span class="badge">(${dueCount})</span></h2></header>
    <div id="due-list" class="card"></div>
  </section>

  <section id="activity">
    <header>
      <h2>Activity <span class="badge">(last ${data.activity.length} days, ${totalActivity} events)</span></h2>
    </header>
    <div class="activity">
      <div id="heatmap" class="heatmap"></div>
      <div class="heatmap-legend">
        less
        <span class="swatch" style="background: var(--heat-0)"></span>
        <span class="swatch" style="background: var(--heat-1)"></span>
        <span class="swatch" style="background: var(--heat-2)"></span>
        <span class="swatch" style="background: var(--heat-3)"></span>
        <span class="swatch" style="background: var(--heat-4)"></span>
        more
      </div>
    </div>
  </section>

  <section id="words">
    <header>
      <h2>Words <span class="badge"></span></h2>
      <div class="controls">
        <input type="search" class="search" placeholder="filter words\u{2026}">
        ${limitOpts}
        <button class="csv-btn" type="button">\u{2B07} CSV</button>
      </div>
    </header>
    <div class="chips" style="margin-bottom: 12px">
      <button class="chip active" data-bucket="all">All <span class="count" style="opacity:0.7">(${data.all_words.length})</span></button>
      <button class="chip" data-bucket="mastered">Mastered <span class="count" style="opacity:0.7">(${data.stats.mastered_words})</span></button>
      <button class="chip" data-bucket="learning">Learning <span class="count" style="opacity:0.7">(${data.stats.learning_words})</span></button>
      <button class="chip" data-bucket="new">New <span class="count" style="opacity:0.7">(${data.stats.new_words})</span></button>
    </div>
    <table>
      <thead><tr>
        <th data-key="word">word</th>
        <th data-key="phonetic">phonetic</th>
        <th data-key="definition">definition</th>
        <th data-key="mastery">mastery</th>
        <th data-key="lookup_count">lookups</th>
        <th data-key="last_lookup">last seen</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    ${emptyWords ? `<div class="empty-runtime" style="display:none">${emptyState('No matches.', 'Try a different filter or clear search.')}</div>${emptyWords}` : '<div class="empty-runtime" style="display:none">' + emptyState('No matches.', 'Try a different filter or clear search.') + '</div>'}
    ${data.words_truncated ? `<div class="meta" style="margin-top: 8px; font-size: 12px; color: var(--muted);">Showing top ${data.all_words.length} by mastery+lookups; ${data.stats.total_words - data.all_words.length} more not shown.</div>` : ''}
  </section>

  <section id="phrases">
    <header>
      <h2>Phrases <span class="badge"></span></h2>
      <div class="controls">
        <input type="search" class="search" placeholder="filter phrases\u{2026}">
        ${limitOpts}
        <button class="csv-btn" type="button">\u{2B07} CSV</button>
      </div>
    </header>
    <table>
      <thead><tr>
        <th data-key="phrase">phrase</th>
        <th data-key="definition">definition</th>
        <th data-key="mastery">mastery</th>
        <th data-key="lookup_count">lookups</th>
        <th data-key="last_lookup">last seen</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    ${emptyPhrases ? `<div class="empty-runtime" style="display:none">${emptyState('No matches.', 'Clear filters to see all phrases.')}</div>${emptyPhrases}` : '<div class="empty-runtime" style="display:none">' + emptyState('No matches.', 'Clear filters to see all phrases.') + '</div>'}
  </section>

  <section id="corrections">
    <header>
      <h2>Top corrections <span class="badge"></span></h2>
      <div class="controls">
        <input type="search" class="search" placeholder="filter corrections\u{2026}">
        ${limitOpts}
        <button class="csv-btn" type="button">\u{2B07} CSV</button>
      </div>
    </header>
    <table>
      <thead><tr>
        <th data-key="count">original</th>
        <th data-key="corrected">corrected</th>
        <th data-key="reason">reason</th>
        <th data-key="count">count</th>
        <th data-key="last_seen">last seen</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    ${emptyCorrections ? `<div class="empty-runtime" style="display:none">${emptyState('No matches.', 'Clear filters to see all corrections.')}</div>${emptyCorrections}` : '<div class="empty-runtime" style="display:none">' + emptyState('No matches.', 'Clear filters to see all corrections.') + '</div>'}
  </section>
${data.materials ? `
  <section id="materials">
    <header><h2>Materials <span class="badge">(${data.materials.total_materials})</span></h2></header>
    <div class="cards">
      <div class="card"><div class="label">Total materials</div><div class="value">${data.materials.total_materials}</div></div>
      ${data.materials.date_range ? `<div class="card"><div class="label">Date range</div><div class="value" style="font-size:16px">${escapeHtml(data.materials.date_range.from)}</div><div class="delta">\u{2192} ${escapeHtml(data.materials.date_range.to)}</div></div>` : ''}
      ${Object.entries(data.materials.by_type).map(([t, c])=>`<div class="card"><div class="label">${escapeHtml(t)}</div><div class="value">${c}</div></div>`).join('')}
    </div>
    ${data.materials.words_per_source.length > 0 ? `
    <h3 style="margin: 20px 0 8px; font-size: 14px; color: var(--muted);">Words per source type</h3>
    <table>
      <thead><tr><th>Source type</th><th>Unique words</th></tr></thead>
      <tbody>${data.materials.words_per_source.map((s)=>`<tr><td>${escapeHtml(s.source_type)}</td><td>${s.unique_words}</td></tr>`).join('')}</tbody>
    </table>` : ''}
    ${data.materials.recent_materials.length > 0 ? `
    <h3 style="margin: 20px 0 8px; font-size: 14px; color: var(--muted);">Recent imports</h3>
    <table>
      <thead><tr><th>Date</th><th>Type</th><th>Words</th></tr></thead>
      <tbody>${data.materials.recent_materials.map((m)=>`<tr><td>${escapeHtml(m.date)}</td><td>${escapeHtml(m.source_type)}</td><td>${m.word_count}</td></tr>`).join('')}</tbody>
    </table>` : ''}
  </section>
` : ''}
</main>

<button id="back-to-top" type="button" title="Back to top">\u{2191}</button>

<div id="shortcuts-modal" role="dialog" aria-label="Keyboard shortcuts">
  <div class="panel">
    <h2 style="margin-top: 0">Keyboard shortcuts</h2>
    <div class="row"><span><kbd>/</kbd> Focus global search</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>w</kbd> Jump to Words</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>p</kbd> Jump to Phrases</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>c</kbd> Jump to Corrections</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>g</kbd> Scroll to bottom</span></div>
    <div class="row"><span><kbd>t</kbd> Scroll to top</span></div>
    <div class="row"><span><kbd>?</kbd> Toggle this help</span></div>
    <div class="row"><span><kbd>Esc</kbd> Close / blur search</span></div>
    <div style="margin-top: 12px; color: var(--muted); font-size: 11px;">Click outside or press <kbd>Esc</kbd> to close.</div>
  </div>
</div>

<noscript><p style="padding: 24px;">This report requires JavaScript to render tables and charts. Pass <code>--json</code> to dump the raw data.</p></noscript>
<script id="report-data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}

;// CONCATENATED MODULE: ./src/english-learner/cmd/report.ts






function parseFlags(args) {
    let output = external_node_path_namespaceObject.join(DATA_ROOT, 'report.html');
    let open = false;
    let json = false;
    for(let i = 0; i < args.length; i++){
        const a = args[i];
        if (a === '--output' || a === '-o') {
            output = args[++i] || output;
        } else if (a === '--open') {
            open = true;
        } else if (a === '--json') {
            json = true;
        }
    }
    return {
        output,
        open,
        json
    };
}
function openInBrowser(file) {
    let bin;
    let argv;
    if (process.platform === 'darwin') {
        bin = 'open';
        argv = [
            file
        ];
    } else if (process.platform === 'win32') {
        bin = 'cmd';
        argv = [
            '/c',
            'start',
            '""',
            file
        ];
    } else {
        bin = 'xdg-open';
        argv = [
            file
        ];
    }
    try {
        const child = (0,external_node_child_process_namespaceObject.spawn)(bin, argv, {
            detached: true,
            stdio: 'ignore'
        });
        child.unref();
    } catch  {
    /* best-effort */ }
}
const report_command = {
    description: 'Generate a self-contained HTML report (vocabulary, mastery, corrections, activity)',
    run: (args)=>{
        const flags = parseFlags(args);
        const data = collectReportData();
        const html = renderReport(data);
        external_node_fs_namespaceObject.mkdirSync(external_node_path_namespaceObject.dirname(flags.output), {
            recursive: true
        });
        external_node_fs_namespaceObject.writeFileSync(flags.output, html);
        let jsonPath = null;
        if (flags.json) {
            jsonPath = flags.output + '.json';
            external_node_fs_namespaceObject.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
        }
        if (flags.open) openInBrowser(flags.output);
        console.log(JSON.stringify({
            status: 'ok',
            output: flags.output,
            bytes: external_node_fs_namespaceObject.statSync(flags.output).size,
            json: jsonPath,
            opened: flags.open,
            sections: {
                words: data.all_words.length,
                phrases: data.all_phrases.length,
                due: data.due_words.length + data.due_phrases.length,
                corrections: data.top_corrections.length,
                activity_days: data.activity.length,
                words_truncated: data.words_truncated,
                phrases_truncated: data.phrases_truncated
            }
        }, null, 2));
    }
};

;// CONCATENATED MODULE: external "node:crypto"
const external_node_crypto_namespaceObject = require("node:crypto");
;// CONCATENATED MODULE: ./src/english-learner/lib/lexicon-parsers.ts
// Format A — Fallback 编号列表
const ENTRY_RE = /^\d+\.\s+\*\*(.+?)\*\*\s*\[(.+?)\]\s*\((.+?)\)\s*-\s*(.+)$/;
const SCENARIO_RE = /^\s+-\s+\*\*Scenario\s+\d+.*?\*\*:\s*(.+)$/;
function parseFormatA(content) {
    const lines = content.split('\n');
    const entries = [];
    let current = null;
    for (const line of lines){
        const entryMatch = line.match(ENTRY_RE);
        if (entryMatch) {
            if (current) entries.push(current);
            current = {
                word: entryMatch[1].trim(),
                phonetic: entryMatch[2].trim(),
                pos: entryMatch[3].trim(),
                meaning_en: '',
                meaning_zh: entryMatch[4].trim(),
                examples: [],
                synonyms: '',
                raw_entry: line
            };
            continue;
        }
        if (current) {
            const scenarioMatch = line.match(SCENARIO_RE);
            if (scenarioMatch) {
                const text = scenarioMatch[1];
                const enPart = text.replace(/\s*\(.*?\)\s*$/, '').trim();
                current.examples.push(enPart);
                current.raw_entry += '\n' + line;
            }
        }
    }
    if (current) entries.push(current);
    return entries;
}
// Format B — Daily 标题+列表
function parseFormatB(content) {
    const blocks = content.split(/^### Study \d+\.\s*/m).filter(Boolean);
    const entries = [];
    for (const block of blocks){
        const lines = block.split('\n');
        const word = lines[0]?.trim() || '';
        if (!word) continue;
        let phonetic = '';
        let pos = '';
        let meaning_en = '';
        let meaning_zh = '';
        const examples = [];
        let inExamples = false;
        for (const line of lines.slice(1)){
            const trimmed = line.trim();
            if (trimmed.startsWith('* **IPA**:')) {
                phonetic = trimmed.replace('* **IPA**:', '').replace(/[\[\]]/g, '').trim();
            } else if (trimmed.startsWith('* **Part of speech**:')) {
                pos = trimmed.replace('* **Part of speech**:', '').trim();
            } else if (trimmed.startsWith('* **Meaning**:')) {
                meaning_en = trimmed.replace('* **Meaning**:', '').trim();
            } else if (trimmed.startsWith("* **\u4E2D\u6587**:")) {
                meaning_zh = trimmed.replace("* **\u4E2D\u6587**:", '').trim();
            } else if (trimmed.startsWith('* **Example sentences**:')) {
                inExamples = true;
            } else if (inExamples && trimmed.startsWith('*')) {
                examples.push(trimmed.replace(/^\*\s*/, '').replace(/\*\*/g, '').trim());
            } else if (!trimmed.startsWith('*')) {
                inExamples = false;
            }
        }
        entries.push({
            word,
            phonetic,
            pos,
            meaning_en,
            meaning_zh,
            examples,
            synonyms: '',
            raw_entry: `### Study. ${word}\n${block}`
        });
    }
    return entries;
}
// Format C — Weeks 表格（技术词汇）
// | Word | IPA | POS | Chinese | English Definition | Example Sentence | Derived/Synonyms |
function parseFormatC(content) {
    const lines = content.split('\n');
    const entries = [];
    for (const line of lines){
        if (!line.trim().startsWith('|')) continue;
        if (/^\|\s*-+/.test(line) || /^\|\s*:?-+/.test(line)) continue;
        const cells = line.split('|').map((c)=>c.trim()).filter(Boolean);
        if (cells.length < 6) continue;
        if (cells[0].toLowerCase() === 'word') continue; // header
        entries.push({
            word: cells[0].replace(/\*\*/g, '').trim(),
            phonetic: cells[1].replace(/^\/|\/$/g, '').trim(),
            pos: cells[2].trim(),
            meaning_en: cells[4]?.trim() || '',
            meaning_zh: cells[3]?.trim() || '',
            examples: cells[5] ? [
                cells[5].trim()
            ] : [],
            synonyms: cells[6]?.trim() || '',
            raw_entry: line
        });
    }
    return entries;
}
// Format D — Weekly 表格（课程词汇）
// | Term | Part of Speech | Meaning | Example |
function parseFormatD(content) {
    const lines = content.split('\n');
    const entries = [];
    for (const line of lines){
        if (!line.trim().startsWith('|')) continue;
        if (/^\|\s*-+/.test(line) || /^\|\s*:?-+/.test(line)) continue;
        const cells = line.split('|').map((c)=>c.trim()).filter(Boolean);
        if (cells.length < 4) continue;
        if (cells[0].toLowerCase() === 'term') continue; // header
        const meaningRaw = cells[2] || '';
        let meaning_en = meaningRaw;
        let meaning_zh = '';
        const semicolonIdx = meaningRaw.indexOf(';');
        if (semicolonIdx > 0) {
            meaning_en = meaningRaw.slice(0, semicolonIdx).trim();
            meaning_zh = meaningRaw.slice(semicolonIdx + 1).trim();
        }
        entries.push({
            word: cells[0].replace(/\*\*/g, '').trim(),
            phonetic: '',
            pos: cells[1]?.trim() || '',
            meaning_en,
            meaning_zh,
            examples: cells[3] ? [
                cells[3].trim()
            ] : [],
            synonyms: '',
            raw_entry: line
        });
    }
    return entries;
}
// Format E — Weeks 扩展表格 + Collocations + Idioms
// Vocabulary Matrix: | Word | IPA | Meaning | Example | Analysis/Root | Synonyms | Antonyms |
// Collocations: numbered list with **collocation**: definition
// Idioms: numbered list with **idiom**: definition + Example
function parseFormatE(content) {
    const entries = [];
    // Split by sections
    const vocabSection = extractSection(content, 'Vocabulary Matrix');
    const collocSection = extractSection(content, 'Collocations');
    const idiomSection = extractSection(content, 'Idioms');
    // Parse vocabulary matrix table
    if (vocabSection) {
        for (const line of vocabSection.split('\n')){
            if (!line.trim().startsWith('|')) continue;
            if (/^\|\s*:?-/.test(line)) continue;
            const cells = line.split('|').map((c)=>c.trim()).filter(Boolean);
            if (cells.length < 5) continue;
            if (cells[0].toLowerCase() === 'word' || cells[0].toLowerCase() === ':---') continue;
            const meaningRaw = cells[2] || '';
            let meaning_zh = meaningRaw;
            let meaning_en = '';
            const parenMatch = meaningRaw.match(/^(.+?)\s*\((.+)\)$/);
            if (parenMatch) {
                meaning_zh = parenMatch[1].trim();
                meaning_en = parenMatch[2].trim();
            }
            const synonymsRaw = cells[5] || '';
            const antonymsRaw = cells[6] || '';
            const allSyns = [
                synonymsRaw,
                antonymsRaw
            ].filter(Boolean).join('; ');
            entries.push({
                word: cells[0].replace(/\*\*/g, '').trim(),
                phonetic: cells[1].replace(/^\/|\/$/g, '').trim(),
                pos: '',
                meaning_en,
                meaning_zh,
                examples: cells[3] ? [
                    cells[3].replace(/\*\*/g, '').trim()
                ] : [],
                synonyms: allSyns,
                raw_entry: line
            });
        }
    }
    // Parse collocations
    if (collocSection) {
        const collocRE = /^\d+\.\s+\*\*(.+?)\*\*:\s*(.+)/;
        for (const line of collocSection.split('\n')){
            const m = line.match(collocRE);
            if (m) {
                entries.push({
                    word: m[1].trim(),
                    phonetic: '',
                    pos: 'collocation',
                    meaning_en: m[2].trim(),
                    meaning_zh: '',
                    examples: [],
                    synonyms: '',
                    raw_entry: line
                });
            }
        }
    }
    // Parse idioms
    if (idiomSection) {
        const idiomRE = /^\d+\.\s+\*\*(.+?)\*\*:\s*(.+)/;
        const exampleRE = /^\s+\*\s+\*(.+?)\*/;
        let current = null;
        for (const line of idiomSection.split('\n')){
            const m = line.match(idiomRE);
            if (m) {
                if (current) entries.push(current);
                current = {
                    word: m[1].trim(),
                    phonetic: '',
                    pos: 'idiom',
                    meaning_en: m[2].trim(),
                    meaning_zh: '',
                    examples: [],
                    synonyms: '',
                    raw_entry: line
                };
            } else if (current) {
                const ex = line.match(exampleRE);
                if (ex) {
                    current.examples.push(ex[1].replace(/^\s*Example:\s*/, '').trim());
                    current.raw_entry += '\n' + line;
                }
            }
        }
        if (current) entries.push(current);
    }
    return entries;
}
function extractSection(content, heading) {
    const re = new RegExp(`^##\\s+.*${heading}.*$`, 'mi');
    const match = content.match(re);
    if (!match || match.index === undefined) return null;
    const start = match.index + match[0].length;
    const nextSection = content.slice(start).match(/^##\s+/m);
    const end = nextSection?.index !== undefined ? start + nextSection.index : content.length;
    return content.slice(start, end);
}
function detectFormat(content, sourceType) {
    if (sourceType === 'fallback') return 'A';
    if (sourceType === 'daily') return 'B';
    if (sourceType === 'weekly') return 'D';
    // weeks can be C or E
    if (/## Vocabulary Matrix/i.test(content) || /## Collocations/i.test(content)) return 'E';
    if (/\|\s*Word\s*\|\s*IPA\s*\|\s*POS\s*\|/i.test(content)) return 'C';
    if (/\|\s*Word\s*\|\s*IPA\s*\|\s*Meaning\s*\|/i.test(content)) return 'E';
    return 'C';
}
function parseContent(content, sourceType) {
    const format = detectFormat(content, sourceType);
    switch(format){
        case 'A':
            return parseFormatA(content);
        case 'B':
            return parseFormatB(content);
        case 'C':
            return parseFormatC(content);
        case 'D':
            return parseFormatD(content);
        case 'E':
            return parseFormatE(content);
    }
}

;// CONCATENATED MODULE: ./src/english-learner/lib/import-engine.ts







const DATE_RE = /(\d{4}-\d{2}-\d{2})/;
const FALLBACK_DIR_RE = /(\d{4}-\d{2}-\d{2})-(\d{2})/;
const WEEK_RE = /week-(\d+)/;
function inferSourceType(dirPath) {
    if (/english-fallback/.test(dirPath)) return 'fallback';
    if (/\/daily\//.test(dirPath)) {
        if (/\/weeks\//.test(dirPath)) return 'weeks';
        return 'daily';
    }
    if (/\/weekly\//.test(dirPath)) return 'weekly';
    if (/oral-course|oral/.test(dirPath)) return 'oral';
    if (/\/weeks\//.test(dirPath)) return 'weeks';
    return 'daily';
}
function inferDate(dirPath, sourceType) {
    if (sourceType === 'fallback') {
        const m = dirPath.match(FALLBACK_DIR_RE);
        if (m) return {
            date: m[1],
            hour: m[2]
        };
    }
    const dateMatch = dirPath.match(DATE_RE);
    if (dateMatch) return {
        date: dateMatch[1]
    };
    const weekMatch = dirPath.match(WEEK_RE);
    if (weekMatch) {
        const weekNum = parseInt(weekMatch[1], 10);
        const year = new Date().getFullYear();
        const jan4 = new Date(year, 0, 4);
        const dayOffset = (weekNum - 1) * 7;
        const d = new Date(jan4.getTime() + dayOffset * 86400000);
        return {
            date: d.toISOString().slice(0, 10)
        };
    }
    return {
        date: new Date().toISOString().slice(0, 10)
    };
}
function scanDirectory(baseDir) {
    const results = [];
    function walk(dir) {
        let entries;
        try {
            entries = external_node_fs_namespaceObject.readdirSync(dir, {
                withFileTypes: true
            });
        } catch  {
            return;
        }
        const hasLexicon = entries.some((e)=>e.isFile() && e.name === 'LEXICON.md');
        if (hasLexicon) {
            const lexiconPath = external_node_path_namespaceObject.join(dir, 'LEXICON.md');
            const sourceType = inferSourceType(dir);
            const { date, hour } = inferDate(dir, sourceType);
            const relativePath = external_node_path_namespaceObject.relative(baseDir, dir);
            results.push({
                dirPath: dir,
                lexiconPath,
                sourceType,
                date,
                hour,
                relativePath
            });
        }
        for (const entry of entries){
            if (entry.isDirectory() && !entry.name.startsWith('.')) {
                walk(external_node_path_namespaceObject.join(dir, entry.name));
            }
        }
    }
    walk(baseDir);
    return results.sort((a, b)=>a.date.localeCompare(b.date));
}
function md5(content) {
    return external_node_crypto_namespaceObject.createHash('md5').update(content).digest('hex');
}
function runImport(baseDir, options = {}) {
    const resolvedDir = external_node_path_namespaceObject.resolve(baseDir);
    if (!external_node_fs_namespaceObject.existsSync(resolvedDir)) {
        throw new Error(`Directory not found: ${resolvedDir}`);
    }
    const materials = scanDirectory(resolvedDir);
    const result = {
        total_materials: materials.length,
        imported: 0,
        skipped: 0,
        total_words_extracted: 0,
        unique_words: 0,
        by_type: {}
    };
    if (options.dryRun) {
        for (const mat of materials){
            const type = options.type && options.type !== 'auto' ? options.type : mat.sourceType;
            result.by_type[type] = (result.by_type[type] || 0) + 1;
            const content = external_node_fs_namespaceObject.readFileSync(mat.lexiconPath, 'utf-8');
            const entries = parseContent(content, type);
            result.total_words_extracted += entries.length;
        }
        return result;
    }
    const db = db_getDb();
    const allWords = new Set();
    for (const mat of materials){
        const type = options.type && options.type !== 'auto' ? options.type : mat.sourceType;
        if (options.since && mat.date < options.since) {
            result.skipped++;
            continue;
        }
        const content = external_node_fs_namespaceObject.readFileSync(mat.lexiconPath, 'utf-8');
        const checksum = md5(content);
        // Check existing
        if (!options.force) {
            const existing = db.prepare('SELECT checksum FROM materials WHERE source_path = ?').get(mat.relativePath);
            if (existing?.checksum === checksum) {
                result.skipped++;
                continue;
            }
        }
        const entries = parseContent(content, type);
        if (entries.length === 0) {
            result.skipped++;
            continue;
        }
        result.by_type[type] = (result.by_type[type] || 0) + 1;
        result.total_words_extracted += entries.length;
        // Write materials + material_words in a transaction
        db.exec('BEGIN');
        try {
            // Upsert material
            db.prepare(`
        INSERT INTO materials (source_path, source_type, date, hour, word_count, imported_at, checksum)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(source_path) DO UPDATE SET
          source_type = excluded.source_type,
          date = excluded.date,
          hour = excluded.hour,
          word_count = excluded.word_count,
          imported_at = excluded.imported_at,
          checksum = excluded.checksum
      `).run(mat.relativePath, type, mat.date, mat.hour || null, entries.length, fs_utils_nowIso(), checksum);
            const matRow = db.prepare('SELECT id FROM materials WHERE source_path = ?').get(mat.relativePath);
            const materialId = matRow.id;
            // Delete old material_words for this material
            db.prepare('DELETE FROM material_words WHERE material_id = ?').run(materialId);
            // Insert material_words (dedupe by lowercase word within same material)
            const insertMW = db.prepare(`
        INSERT INTO material_words (material_id, word, position, phonetic, pos, meaning_en, meaning_zh, examples, synonyms, raw_entry)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            const seenInMaterial = new Set();
            entries.forEach((entry, idx)=>{
                const wordLower = entry.word.toLowerCase();
                allWords.add(wordLower);
                if (seenInMaterial.has(wordLower)) return;
                seenInMaterial.add(wordLower);
                insertMW.run(materialId, wordLower, idx + 1, entry.phonetic || null, entry.pos || null, entry.meaning_en || null, entry.meaning_zh || null, entry.examples.length > 0 ? JSON.stringify(entry.examples) : null, entry.synonyms || null, entry.raw_entry || null);
            });
            db.exec('COMMIT');
        } catch (err) {
            db.exec('ROLLBACK');
            throw err;
        }
        // Batch save to words table (has its own transaction)
        const batchItems = entries.map((e)=>({
                word: e.word,
                phonetic: e.phonetic,
                definitions: [
                    {
                        pos: e.pos,
                        meaning: e.meaning_zh || e.meaning_en,
                        examples: e.examples
                    }
                ],
                synonyms: e.synonyms ? e.synonyms.split(/[,;]/).map((s)=>s.trim()).filter(Boolean) : undefined
            }));
        batchSaveWords(batchItems);
        result.imported++;
        if (options.verbose) {
            process.stderr.write(`\u{2713} ${mat.relativePath} \u{2192} ${entries.length} words\n`);
        }
    }
    result.unique_words = allWords.size;
    return result;
}

;// CONCATENATED MODULE: ./src/english-learner/cmd/import.ts

const import_command = {
    description: 'Import vocabulary from LEXICON.md files in a directory',
    run (args) {
        const dir = args.find((a)=>!a.startsWith('-'));
        if (!dir) {
            console.error('Usage: import <dir> [options]');
            process.exit(1);
        }
        const options = {
            type: getFlag(args, '--type') || 'auto',
            dryRun: args.includes('--dry-run'),
            force: args.includes('--force'),
            since: getFlag(args, '--since'),
            verbose: args.includes('--verbose')
        };
        try {
            const result = runImport(dir, options);
            if (options.dryRun) {
                console.log("\uD83D\uDD0D Dry run results:");
            } else {
                console.log("\u2705 Import complete:");
            }
            console.log(JSON.stringify(result, null, 2));
        } catch (err) {
            console.error(`\u{274C} ${err.message}`);
            process.exit(1);
        }
    }
};
function getFlag(args, flag) {
    const idx = args.indexOf(flag);
    return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
}

;// CONCATENATED MODULE: ./src/english-learner/cmd/import-status.ts

const import_status_command = {
    description: 'Show import statistics',
    run (args) {
        const db = db_getDb();
        const typeFilter = import_status_getFlag(args, '--type');
        const totalMaterials = db.prepare(typeFilter ? 'SELECT COUNT(*) as c FROM materials WHERE source_type = ?' : 'SELECT COUNT(*) as c FROM materials').get(...typeFilter ? [
            typeFilter
        ] : []).c;
        const totalWordsExtracted = db.prepare(typeFilter ? 'SELECT COUNT(*) as c FROM material_words mw JOIN materials m ON mw.material_id = m.id WHERE m.source_type = ?' : 'SELECT COUNT(*) as c FROM material_words').get(...typeFilter ? [
            typeFilter
        ] : []).c;
        const uniqueWords = db.prepare(typeFilter ? 'SELECT COUNT(DISTINCT mw.word) as c FROM material_words mw JOIN materials m ON mw.material_id = m.id WHERE m.source_type = ?' : 'SELECT COUNT(DISTINCT word) as c FROM material_words').get(...typeFilter ? [
            typeFilter
        ] : []).c;
        const byType = db.prepare('SELECT source_type, COUNT(*) as count FROM materials GROUP BY source_type').all();
        const byTypeObj = {};
        for (const row of byType){
            byTypeObj[row.source_type] = row.count;
        }
        const dateRange = db.prepare('SELECT MIN(date) as min_date, MAX(date) as max_date FROM materials').get();
        const result = {
            total_materials: totalMaterials,
            total_words_extracted: totalWordsExtracted,
            unique_words: uniqueWords,
            by_type: byTypeObj,
            date_range: dateRange.min_date ? {
                from: dateRange.min_date,
                to: dateRange.max_date
            } : null
        };
        console.log(JSON.stringify(result, null, 2));
    }
};
function import_status_getFlag(args, flag) {
    const idx = args.indexOf(flag);
    return idx >= 0 && idx + 1 < args.length ? args[idx + 1] : undefined;
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
        report: report_command,
        import: import_command,
        'import-status': import_status_command,
        install: installCommand,
        uninstall: uninstallCommand
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
