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
function enableCodexHooksFeatureToml(source) {
    const normalized = source.replace(/\r\n/g, '\n');
    const lines = normalized.endsWith('\n') ? normalized.slice(0, -1).split('\n') : normalized.split('\n');
    const effectiveLines = lines.length === 1 && lines[0] === '' ? [] : lines;
    let featuresStart = -1;
    let featuresEnd = effectiveLines.length;
    for(let i = 0; i < effectiveLines.length; i++){
        if (/^\s*\[features\]\s*(?:#.*)?$/.test(effectiveLines[i])) {
            featuresStart = i;
            for(let j = i + 1; j < effectiveLines.length; j++){
                if (/^\s*\[[^\]]+\]\s*(?:#.*)?$/.test(effectiveLines[j])) {
                    featuresEnd = j;
                    break;
                }
            }
            break;
        }
    }
    if (featuresStart === -1) {
        const next = [
            ...effectiveLines
        ];
        if (next.length > 0 && next.some((line)=>line.trim() !== '')) next.push('');
        next.push('[features]', 'hooks = true');
        return next.join('\n') + '\n';
    }
    const before = effectiveLines.slice(0, featuresStart + 1);
    const section = effectiveLines.slice(featuresStart + 1, featuresEnd);
    const after = effectiveLines.slice(featuresEnd);
    let hasHooks = false;
    const updatedSection = [];
    for (const line of section){
        if (/^\s*codex_hooks\s*=/.test(line)) continue;
        if (/^\s*hooks\s*=/.test(line)) {
            const indent = line.match(/^(\s*)/)?.[1] || '';
            updatedSection.push(`${indent}hooks = true`);
            hasHooks = true;
        } else {
            updatedSection.push(line);
        }
    }
    if (!hasHooks) updatedSection.unshift('hooks = true');
    return [
        ...before,
        ...updatedSection,
        ...after
    ].join('\n') + '\n';
}
function ensureCodexHooksFeature(codexDir) {
    const configFile = path.join(codexDir, 'config.toml');
    if (!fs.existsSync(codexDir)) fs.mkdirSync(codexDir, {
        recursive: true
    });
    const existing = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf8') : '';
    const next = enableCodexHooksFeatureToml(existing);
    if (next !== existing) fs.writeFileSync(configFile, next);
    return configFile;
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
            const codexDir = path.join(homeDir, '.codex');
            const codexFile = path.join(codexDir, 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
            results.push(ensureCodexHooksFeature(codexDir));
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
            const codexDir = path.join(root, '.codex');
            const codexFile = path.join(codexDir, 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
            results.push(ensureCodexHooksFeature(codexDir));
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
;// CONCATENATED MODULE: ./src/shared/learnwy-paths.ts


const LEARNWY_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy');
function learnwyPath(...segments) {
    return external_node_path_namespaceObject.join(LEARNWY_ROOT, ...segments);
}
function skillRoot(skill) {
    return learnwyPath(skill);
}
const PATHS = {
    llmWiki: skillRoot('llm-wiki'),
    promptOptimizer: skillRoot('prompt-optimizer'),
    knowledgeConsolidation: skillRoot('knowledge-consolidation'),
    learnwyStatus: skillRoot('learnwy-status')
};
function envOr(envVar, fallback) {
    const v = process.env[envVar];
    return v && v.length > 0 ? v : fallback;
}

;// CONCATENATED MODULE: ./src/llm-wiki/lib/constants.ts


const WIKI_ROOT = envOr('LLM_WIKI_ROOT', learnwyPath('llm-wiki'));
const WIKI_DIR = (0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'wiki');
const RAW_DIR = (0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'raw');
// Entity-first wiki taxonomy (matches the personal knowledge-base layout).
// Entity-type folders hold one page per real-world thing; source-type folders
// hold one compiled page per ingested source (article / podcast / vlog / Lark thread).
const PAGE_TYPES = [
    {
        type: 'people',
        label: 'People',
        group: 'entity'
    },
    {
        type: 'organizations',
        label: 'Organizations',
        group: 'entity'
    },
    {
        type: 'places',
        label: 'Places',
        group: 'entity'
    },
    {
        type: 'products',
        label: 'Products',
        group: 'entity'
    },
    {
        type: 'events',
        label: 'Events',
        group: 'entity'
    },
    {
        type: 'concepts',
        label: 'Concepts',
        group: 'entity'
    },
    {
        type: 'other-entities',
        label: 'Other Entities',
        group: 'entity'
    },
    {
        type: 'articles',
        label: 'Articles',
        group: 'source'
    },
    {
        type: 'podcasts',
        label: 'Podcasts',
        group: 'source'
    },
    {
        type: 'vlogs',
        label: 'Vlogs',
        group: 'source'
    },
    {
        type: 'diaries',
        label: 'Diaries',
        group: 'source'
    },
    {
        type: 'threads',
        label: 'Threads',
        group: 'source'
    }
];
const PAGE_DIRS = PAGE_TYPES.map((p)=>p.type);
// Lifecycle dirs created at init but excluded from indexing / orphan linting.
// `inbox` holds pulled-but-uncompiled drafts; `archived` holds retired pages.
const LIFECYCLE_DIRS = (/* unused pure expression or super */ null && ([
    'inbox',
    'archived'
]));
// Dirs where a page having no incoming wikilink is normal (entities are
// referenced from elsewhere but need not be; diaries / threads are chronological).
const ORPHAN_EXEMPT_DIRS = new Set([
    'people',
    'organizations',
    'places',
    'products',
    'events',
    'other-entities',
    'diaries',
    'threads'
]);
// Raw (immutable) source material, one subdir per source type. `lark` holds
// Lark group/doc pulls; `docs` holds ingested document exports.
const RAW_SUBDIRS = (/* unused pure expression or super */ null && ([
    'books',
    'articles',
    'papers',
    'notes',
    'podcasts',
    'vlogs',
    'transcripts',
    'snippets',
    'specs',
    'lark',
    'docs'
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

;// CONCATENATED MODULE: external "node:child_process"
const external_node_child_process_namespaceObject = require("node:child_process");
;// CONCATENATED MODULE: ./src/learnwy-status/lib/digest.ts



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
function session_scan_scanSession() {
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
    if (!digest.wiki && !digest.optimizer && !digest.consolidation) return null;
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
        name: 'learnwy-status',
        scan: session_scan_scanSession
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
