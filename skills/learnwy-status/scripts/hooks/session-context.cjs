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
                const traeFile = path.join(homeDir, dir, 'hooks.json');
                mergeAndWrite(traeFile, config, 'standalone');
                results.push(traeFile);
            }
        }
        if (wantsClaude(target)) {
            const claudeFile = path.join(homeDir, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
        if (wantsCodex(target)) {
            const codexFile = path.join(homeDir, '.codex', 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
        }
    } else {
        const root = projectRoot || getProjectDir();
        if (wantsTrae(target)) {
            const traeFile = path.join(root, '.trae', 'hooks.json');
            mergeAndWrite(traeFile, config, 'standalone');
            results.push(traeFile);
        }
        if (wantsClaude(target)) {
            const claudeFile = path.join(root, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
        if (wantsCodex(target)) {
            const codexFile = path.join(root, '.codex', 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
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
        if (wantsTrae(target)) {
            files.push(path.join(homeDir, '.trae', 'hooks.json'));
            files.push(path.join(homeDir, '.trae-cn', 'hooks.json'));
        }
        if (wantsClaude(target)) {
            files.push(path.join(homeDir, '.claude', 'settings.json'));
        }
        if (wantsCodex(target)) {
            files.push(path.join(homeDir, '.codex', 'hooks.json'));
        }
    } else {
        if (wantsTrae(target)) {
            files.push(path.join(root, '.trae', 'hooks.json'));
        }
        if (wantsClaude(target)) {
            files.push(path.join(root, '.claude', 'settings.json'));
        }
        if (wantsCodex(target)) {
            files.push(path.join(root, '.codex', 'hooks.json'));
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
;// CONCATENATED MODULE: external "node:child_process"
const external_node_child_process_namespaceObject = require("node:child_process");
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
function getDb() {
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

;// CONCATENATED MODULE: ./src/shared/learnwy-paths.ts


const LEARNWY_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy');
function learnwyPath(...segments) {
    return external_node_path_namespaceObject.join(LEARNWY_ROOT, ...segments);
}
function skillRoot(skill) {
    return learnwyPath(skill);
}
const PATHS = {
    englishLearner: skillRoot('english-learner'),
    llmWiki: skillRoot('llm-wiki'),
    promptOptimizer: skillRoot('prompt-optimizer'),
    knowledgeConsolidation: skillRoot('knowledge-consolidation'),
    learnwyStatus: skillRoot('learnwy-status')
};
function envOr(envVar, fallback) {
    const v = process.env[envVar];
    return v && v.length > 0 ? v : fallback;
}

;// CONCATENATED MODULE: ./src/learnwy-status/lib/digest.ts




function readVocabSection() {
    if (!external_node_fs_namespaceObject.existsSync(DB_PATH)) return null;
    const db = getDb();
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
function readCorrectionsSection() {
    if (!external_node_fs_namespaceObject.existsSync(DB_PATH)) return null;
    try {
        const db = getDb();
        const hasTable = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='corrections'").get();
        if (!hasTable) return null;
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        const total = db.prepare('SELECT COALESCE(SUM(count),0) AS s FROM corrections').get().s;
        const uniquePairs = db.prepare('SELECT COUNT(*) AS c FROM corrections').get().c;
        const recent = db.prepare('SELECT COALESCE(SUM(count),0) AS s FROM corrections WHERE last_seen >= ?').get(cutoff).s;
        const top = db.prepare(`SELECT original, corrected, count FROM corrections
         ORDER BY count DESC, last_seen DESC LIMIT 5`).all();
        if (total === 0) return null;
        return {
            total,
            unique_pairs: uniquePairs,
            recent_30d: recent,
            top
        };
    } catch  {
        return null;
    }
}
function buildDigest() {
    return {
        generated_at: new Date().toISOString(),
        vocab: readVocabSection(),
        corrections: readCorrectionsSection(),
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
    if (d.corrections) {
        lines.push(`English corrections: ${d.corrections.total} total, ${d.corrections.unique_pairs} unique pairs, ${d.corrections.recent_30d} in last 30d`);
        if (d.corrections.top.length) {
            lines.push('  Top recurring:');
            for (const t of d.corrections.top){
                lines.push(`    ${t.count}\xd7 "${t.original}" \u{2192} "${t.corrected}"`);
            }
        }
    } else {
        lines.push("English corrections: (none recorded \u2014 schema v3+)");
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
    if (d.corrections) {
        parts.push(`corrections=${d.corrections.recent_30d}/30d (${d.corrections.unique_pairs}u)`);
    }
    if (d.consolidation) {
        parts.push(`kc-nudge=${d.consolidation.hours_ago}h-ago`);
    }
    return parts.join(" \xb7 ");
}

;// CONCATENATED MODULE: ./src/learnwy-status/lib/session-scan.ts





const STATE_FILE = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', 'learnwy-status', 'state.json');
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const HOME = external_node_os_namespaceObject.homedir();
const AGENTS_ROOT = external_node_path_namespaceObject.join(HOME, '.agents', 'skills');
const REFRESH_TARGETS = [
    {
        artifact: external_node_path_namespaceObject.join(HOME, '.learnwy', 'llm-wiki', 'health.json'),
        precondition: ()=>external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(HOME, '.learnwy', 'llm-wiki', 'wiki', 'topics.txt')),
        cli: external_node_path_namespaceObject.join(AGENTS_ROOT, 'llm-wiki', 'scripts', 'cli.cjs'),
        args: [
            'health-check'
        ]
    },
    {
        artifact: external_node_path_namespaceObject.join(HOME, '.learnwy', 'english-learner', 'wiki-links.json'),
        precondition: ()=>external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(HOME, '.learnwy', 'english-learner', 'data.db')),
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
function scanSession() {
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

;// CONCATENATED MODULE: ./src/learnwy-status/hooks/session-context.ts


async function main() {
    await readStdin();
    const out = scanSession();
    if (out) injectContext(out);
}
main().catch(()=>process.exit(0));

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
