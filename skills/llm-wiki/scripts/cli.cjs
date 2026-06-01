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
    const configFile = external_node_path_namespaceObject.join(codexDir, 'config.toml');
    if (!external_node_fs_namespaceObject.existsSync(codexDir)) external_node_fs_namespaceObject.mkdirSync(codexDir, {
        recursive: true
    });
    const existing = external_node_fs_namespaceObject.existsSync(configFile) ? external_node_fs_namespaceObject.readFileSync(configFile, 'utf8') : '';
    const next = enableCodexHooksFeatureToml(existing);
    if (next !== existing) external_node_fs_namespaceObject.writeFileSync(configFile, next);
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
            const codexDir = external_node_path_namespaceObject.join(homeDir, '.codex');
            const codexFile = external_node_path_namespaceObject.join(codexDir, 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
            results.push(ensureCodexHooksFeature(codexDir));
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
            const codexDir = external_node_path_namespaceObject.join(root, '.codex');
            const codexFile = external_node_path_namespaceObject.join(codexDir, 'hooks.json');
            mergeAndWrite(codexFile, config, 'standalone');
            results.push(codexFile);
            results.push(ensureCodexHooksFeature(codexDir));
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

;// CONCATENATED MODULE: external "node:fs/promises"
const promises_namespaceObject = require("node:fs/promises");
;// CONCATENATED MODULE: ./src/shared/learnwy-paths.ts


const LEARNWY_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy');
function learnwyPath(...segments) {
    return external_node_path_namespaceObject.join(LEARNWY_ROOT, ...segments);
}
function learnwy_paths_skillRoot(skill) {
    return learnwyPath(skill);
}
const PATHS = {
    llmWiki: learnwy_paths_skillRoot('llm-wiki'),
    promptOptimizer: learnwy_paths_skillRoot('prompt-optimizer'),
    knowledgeConsolidation: learnwy_paths_skillRoot('knowledge-consolidation'),
    learnwyStatus: learnwy_paths_skillRoot('learnwy-status')
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
const LIFECYCLE_DIRS = [
    'inbox',
    'archived'
];
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
const RAW_SUBDIRS = [
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
];

;// CONCATENATED MODULE: ./src/llm-wiki/lib/fs-utils.ts


async function readMdFiles(dir) {
    try {
        const entries = await (0,promises_namespaceObject.readdir)(dir);
        return entries.filter((f)=>f.endsWith('.md')).sort();
    } catch  {
        return [];
    }
}
async function readMdFilesDeep(dir) {
    const results = [];
    try {
        const entries = await readdir(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            if (entry.isDirectory()) {
                const subFiles = await readMdFiles(join(dir, entry.name));
                for (const f of subFiles){
                    results.push({
                        file: f,
                        subdir: entry.name
                    });
                }
            } else if (entry.name.endsWith('.md')) {
                results.push({
                    file: entry.name,
                    subdir: ''
                });
            }
        }
    } catch  {
    /* empty */ }
    return results.sort((a, b)=>a.file.localeCompare(b.file));
}
async function countMdFiles(dir) {
    return (await readMdFiles(dir)).length;
}
async function countMdFilesDeep(dir) {
    return (await readMdFilesDeep(dir)).length;
}
async function countMdFilesInSubdirs(baseDir, subdirs) {
    let total = 0;
    for (const sub of subdirs){
        total += await countMdFiles((0,external_node_path_namespaceObject.join)(baseDir, sub));
    }
    return total;
}

;// CONCATENATED MODULE: ./src/llm-wiki/lib/meta.ts


const META_KEYS = [
    'title',
    'discipline',
    'platform',
    'source',
    'author',
    'year',
    'verified'
];
const META_SCAN_LINES = 20;
async function extractMeta(filePath) {
    const empty = Object.fromEntries(META_KEYS.map((k)=>[
            k,
            ''
        ]));
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, META_SCAN_LINES);
        const meta = {
            ...empty
        };
        for (const line of lines){
            if (line.startsWith('# ')) {
                meta.title = line.slice(2).trim();
                continue;
            }
            if (line.startsWith('**Discipline**:')) {
                meta.discipline = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Platform**:')) {
                meta.platform = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Source**:')) {
                meta.source = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Verified**:')) {
                meta.verified = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Author**:')) {
                meta.author = line.split('|')[0].replace('**Author**:', '').trim();
                const yearMatch = line.match(/\*\*(Year|Date)\*\*:\s*(.+?)(\s*\||$)/);
                if (yearMatch) meta.year = yearMatch[2].trim();
            }
            if (!meta.year) {
                const yearOnly = line.match(/\*\*(Year|Date)\*\*:\s*(.+?)(\s*\||$)/);
                if (yearOnly) meta.year = yearOnly[2].trim();
            }
        }
        return meta;
    } catch  {
        return {
            ...empty,
            title: (0,external_node_path_namespaceObject.basename)(filePath, '.md')
        };
    }
}
function slugToTitle(slug) {
    return slug.replace(/\.md$/, '').split('-').map((w)=>w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

;// CONCATENATED MODULE: ./src/llm-wiki/lib/index.ts




;// CONCATENATED MODULE: ./src/llm-wiki/cmd/init.ts




const SCHEMA = `# LLM Wiki \u{2014} Schema

Entity-first personal knowledge base. The LLM compiles \`raw/\` source material
into linked pages under \`wiki/\`; \`raw/\` is immutable (read-only to the LLM).

## Layout

- \`raw/\` \u{2014} immutable source material (one subdir per source type, incl. \`lark/\`)
- \`wiki/\` \u{2014} compiled pages, one folder per entity / source type
  - Entity types: people, organizations, places, products, events, concepts, other-entities
  - Source types: articles, podcasts, vlogs, diaries, threads
  - Lifecycle: inbox (uncompiled drafts), archived (retired)
- \`wiki/index.md\` \u{2014} auto-generated master index
- \`wiki/topics.txt\` \u{2014} auto-generated keyword list for auto-query
- \`log.md\` \u{2014} append-only audit log

## Conventions

- Each page starts with a \`# Title\` H1.
- Cross-link with \`[[folder/slug]]\` wikilinks (cap ~5 per page; overflow \u{2192} "See also").
- Entity slugs are kebab-case (\`zhang-san\`, \`toko-standalone\`).
- Source pages carry \`**Source**:\`, \`**Ingested**:\`, optional \`**Last verified**:\`.
`;
async function init_ensureDir(dir) {
    await (0,promises_namespaceObject.mkdir)(dir, {
        recursive: true
    });
}
async function ensureFile(path, content) {
    if (!(0,external_node_fs_namespaceObject.existsSync)(path)) await (0,promises_namespaceObject.writeFile)(path, content);
}
async function init() {
    await init_ensureDir(WIKI_ROOT);
    await init_ensureDir(WIKI_DIR);
    await init_ensureDir(RAW_DIR);
    for (const sub of RAW_SUBDIRS)await init_ensureDir((0,external_node_path_namespaceObject.join)(RAW_DIR, sub));
    for (const dir of [
        ...PAGE_DIRS,
        ...LIFECYCLE_DIRS
    ])await init_ensureDir((0,external_node_path_namespaceObject.join)(WIKI_DIR, dir));
    await ensureFile((0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'CLAUDE.md'), SCHEMA);
    await ensureFile((0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'log.md'), '# Wiki Log\n\n');
    await ensureFile((0,external_node_path_namespaceObject.join)(WIKI_DIR, 'index.md'), '# Knowledge Base Index\n\n> Run `cli.cjs generate-index` to populate.\n');
    await ensureFile((0,external_node_path_namespaceObject.join)(WIKI_DIR, 'topics.txt'), '');
    // Touch CLAUDE.md so re-init reports cleanly even when present.
    await (0,promises_namespaceObject.readFile)((0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'CLAUDE.md'), 'utf-8');
    console.log(`Initialized llm-wiki at ${WIKI_ROOT}`);
    console.log(`  raw/    ${RAW_SUBDIRS.length} source subdirs`);
    console.log(`  wiki/   ${PAGE_DIRS.length} page dirs + ${LIFECYCLE_DIRS.length} lifecycle dirs`);
}
const command = {
    description: 'Scaffold the wiki root (raw/ + wiki/ folders, schema, index, log)',
    run: ()=>init()
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/lint.ts



// True if the page has an `# H1` title, skipping any leading YAML frontmatter.
function hasTitle(content) {
    const lines = content.split('\n');
    let i = 0;
    if (lines[0]?.trim() === '---') {
        i = 1;
        while(i < lines.length && lines[i].trim() !== '---')i++;
        i++; // past closing fence
    }
    while(i < lines.length && lines[i].trim() === '')i++;
    return lines[i]?.startsWith('# ') ?? false;
}
async function buildInventory() {
    const inventory = new Set();
    const allFiles = {};
    for (const dir of PAGE_DIRS){
        const files = (await readMdFiles((0,external_node_path_namespaceObject.join)(WIKI_DIR, dir))).filter((f)=>f !== 'index.md');
        allFiles[dir] = files;
        for (const file of files){
            inventory.add(`${dir}/${file.replace('.md', '')}`);
            inventory.add(`${dir}/${file}`);
        }
    }
    inventory.add('index.md');
    return {
        inventory,
        allFiles
    };
}
function checkWikilinks(content, inventory) {
    const broken = [];
    const resolved = [];
    for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)){
        const link = match[1].replace(/\.md$/, '');
        const normalized = link.replace(/^raw\//, '').replace(/^wiki\//, '');
        const isWikiLink = PAGE_DIRS.some((d)=>normalized.startsWith(`${d}/`));
        if (!isWikiLink) continue;
        const withMd = normalized.endsWith('.md') ? normalized : `${normalized}.md`;
        const withoutMd = normalized.replace(/\.md$/, '');
        if (!inventory.has(withMd) && !inventory.has(withoutMd)) {
            broken.push(match[1]);
        } else {
            resolved.push(withoutMd);
        }
    }
    return {
        broken,
        resolved
    };
}
async function lint() {
    console.log('Linting wiki...\n');
    const { inventory, allFiles } = await buildInventory();
    const errors = [];
    const warnings = [];
    const incomingLinks = {};
    let totalLinks = 0;
    let totalPages = 0;
    for (const dir of PAGE_DIRS){
        for (const file of allFiles[dir] || []){
            const content = await (0,promises_namespaceObject.readFile)((0,external_node_path_namespaceObject.join)(WIKI_DIR, dir, file), 'utf-8');
            const loc = `${dir}/${file}`;
            totalPages++;
            if (!hasTitle(content)) {
                warnings.push(`${loc}: Missing # title`);
            }
            const { broken, resolved } = checkWikilinks(content, inventory);
            totalLinks += broken.length + resolved.length;
            for (const link of broken)errors.push(`${loc}: Broken link -> [[${link}]]`);
            for (const target of resolved)incomingLinks[target] = (incomingLinks[target] || 0) + 1;
        }
    }
    for (const dir of PAGE_DIRS){
        if (ORPHAN_EXEMPT_DIRS.has(dir)) continue;
        for (const file of allFiles[dir] || []){
            const key = `${dir}/${file.replace('.md', '')}`;
            if (!incomingLinks[key]) warnings.push(`${dir}/${file}: Orphan page (no incoming wikilinks)`);
        }
    }
    console.log('Statistics:');
    for (const dir of PAGE_DIRS){
        const count = (allFiles[dir] || []).length;
        if (count > 0) console.log(`   ${dir}: ${count}`);
    }
    console.log(`   Total pages: ${totalPages}`);
    console.log(`   Total wikilinks: ${totalLinks}`);
    console.log(`   Broken links: ${errors.length}`);
    console.log('');
    if (errors.length > 0) {
        console.log(`Errors (${errors.length}):`);
        for (const e of errors.slice(0, 50))console.log(`   ${e}`);
        if (errors.length > 50) console.log(`   ... and ${errors.length - 50} more`);
        console.log('');
    }
    if (warnings.length > 0) {
        console.log(`Warnings (${warnings.length}):`);
        for (const w of warnings.slice(0, 30))console.log(`   ${w}`);
        if (warnings.length > 30) console.log(`   ... and ${warnings.length - 30} more`);
        console.log('');
    }
    if (errors.length === 0 && warnings.length === 0) {
        console.log('No issues found!');
    }
    return errors.length > 0 ? 1 : 0;
}
const lint_command = {
    description: 'Check broken wikilinks and orphan pages',
    run: async ()=>{
        const code = await lint();
        process.exit(code);
    }
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/generate-index.ts



async function scanPages() {
    const allPages = {};
    let totalPages = 0;
    for (const { type } of PAGE_TYPES){
        const dir = (0,external_node_path_namespaceObject.join)(WIKI_DIR, type);
        const files = await readMdFiles(dir);
        const pages = [];
        for (const file of files){
            if (file === 'index.md') continue;
            const meta = await extractMeta((0,external_node_path_namespaceObject.join)(dir, file));
            const slug = file.replace('.md', '');
            pages.push({
                slug,
                file,
                ...meta,
                title: meta.title || slugToTitle(slug)
            });
        }
        allPages[type] = pages;
        totalPages += pages.length;
    }
    return {
        allPages,
        totalPages
    };
}
function renderType(type, label, pages) {
    if (pages.length === 0) return [];
    const lines = [
        `### ${label} (${pages.length})`,
        ''
    ];
    for (const p of pages.sort((a, b)=>a.slug.localeCompare(b.slug))){
        const tag = p.verified === 'no' ? " \u26A0\uFE0F" : '';
        const yearStr = p.year ? ` (${p.year})` : '';
        lines.push(`- [${p.title}](${type}/${p.file})${yearStr}${tag}`);
    }
    lines.push('');
    return lines;
}
function renderIndex(allPages, totalPages, rawCount) {
    const lines = [];
    const now = new Date().toISOString().slice(0, 10);
    const statsLine = PAGE_TYPES.filter(({ type })=>allPages[type].length > 0).map(({ type })=>`${allPages[type].length} ${type}`).join(', ');
    lines.push('# Knowledge Base Index');
    lines.push('');
    lines.push(`**Last updated**: ${now}`);
    lines.push(`**Total sources**: ${rawCount}`);
    lines.push(`**Total wiki pages**: ${totalPages}${statsLine ? ` (${statsLine})` : ''}`);
    lines.push('');
    lines.push('> Auto-generated by `cli.cjs generate-index`. Do not edit manually.');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## Entities');
    lines.push('');
    for (const { type, label, group } of PAGE_TYPES){
        if (group === 'entity') lines.push(...renderType(type, label, allPages[type]));
    }
    lines.push('## Sources');
    lines.push('');
    for (const { type, label, group } of PAGE_TYPES){
        if (group === 'source') lines.push(...renderType(type, label, allPages[type]));
    }
    return lines.join('\n');
}
async function generateIndex() {
    console.log('Scanning wiki directory...');
    const { allPages, totalPages } = await scanPages();
    for (const { type, label } of PAGE_TYPES){
        if (allPages[type].length > 0) console.log(`  ${label}: ${allPages[type].length}`);
    }
    const rawCount = await countMdFilesInSubdirs(RAW_DIR, RAW_SUBDIRS);
    console.log(`  Raw sources: ${rawCount}`);
    const output = renderIndex(allPages, totalPages, rawCount);
    await (0,promises_namespaceObject.writeFile)((0,external_node_path_namespaceObject.join)(WIKI_DIR, 'index.md'), output);
    console.log(`\nGenerated wiki/index.md (${totalPages} pages indexed)`);
}
const generate_index_command = {
    description: 'Regenerate wiki/index.md from filesystem',
    run: ()=>generateIndex()
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/generate-topics.ts



const STOP_WORDS = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'into',
    'not',
    'but',
    'are',
    'was',
    'has',
    'had',
    'its',
    'you',
    'your',
    'how',
    'why',
    'what',
    'when',
    'who',
    'all',
    'can',
    'will',
    'use',
    'get',
    'set',
    'new',
    'old',
    'one',
    'two',
    'via',
    'per'
]);
const MIN_WORD_LENGTH = 3;
const generate_topics_META_SCAN_LINES = 15;
async function extractDiscipline(filePath) {
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, generate_topics_META_SCAN_LINES);
        for (const line of lines){
            if (line.startsWith('**Discipline**:')) return line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Platform**:')) return line.split(':').slice(1).join(':').trim();
        }
    } catch  {
    /* empty */ }
    return '';
}
function slugToWords(slug) {
    return slug.split('-').filter((w)=>w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w.toLowerCase()));
}
async function generateTopics() {
    const keywords = new Set();
    const disciplines = new Set();
    for (const dir of PAGE_DIRS){
        const dirPath = (0,external_node_path_namespaceObject.join)(WIKI_DIR, dir);
        const files = await readMdFiles(dirPath);
        for (const file of files){
            if (file === 'index.md') continue;
            const slug = file.replace('.md', '');
            keywords.add(slug);
            for (const word of slugToWords(slug))keywords.add(word.toLowerCase());
            const disc = await extractDiscipline((0,external_node_path_namespaceObject.join)(dirPath, file));
            if (disc) disciplines.add(disc);
        }
    }
    const lines = [
        '# Auto-generated topic keywords for fast auto-query scanning',
        `# Generated: ${new Date().toISOString().slice(0, 10)}`,
        `# Total keywords: ${keywords.size}`,
        ''
    ];
    for (const d of [
        ...disciplines
    ].sort()){
        lines.push(d.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
    lines.push('');
    for (const k of [
        ...keywords
    ].sort()){
        lines.push(k);
    }
    await (0,promises_namespaceObject.writeFile)((0,external_node_path_namespaceObject.join)(WIKI_DIR, 'topics.txt'), lines.join('\n'));
    console.log(`Generated wiki/topics.txt (${keywords.size} keywords from ${disciplines.size} disciplines)`);
}
const generate_topics_command = {
    description: 'Regenerate wiki/topics.txt keyword index',
    run: ()=>generateTopics()
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/freshness-check.ts



const STALE_DAYS = 180;
const TECH_STALE_DAYS = 90;
const FAST_MOVING_DOMAINS = [
    'frontend engineering',
    'ios development',
    'android development',
    'go bff',
    'ai/ml'
];
const freshness_check_META_SCAN_LINES = 25;
function parseDate(str) {
    if (!str) return null;
    const d = new Date(str.trim());
    return isNaN(d.getTime()) ? null : d;
}
async function extractPageMeta(filePath) {
    const empty = {
        title: '',
        discipline: '',
        ingested: '',
        lastVerified: '',
        verified: ''
    };
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, freshness_check_META_SCAN_LINES);
        const meta = {
            ...empty
        };
        for (const line of lines){
            if (line.startsWith('# ')) meta.title = line.slice(2).trim();
            if (line.startsWith('**Discipline**:')) meta.discipline = line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Platform**:')) meta.discipline = meta.discipline || line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Ingested**:')) meta.ingested = line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Last verified**:')) meta.lastVerified = line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Verified**:')) meta.verified = line.split(':').slice(1).join(':').trim();
        }
        return meta;
    } catch  {
        return empty;
    }
}
const isFastMoving = (discipline)=>{
    const d = discipline.toLowerCase();
    return FAST_MOVING_DOMAINS.some((domain)=>d.includes(domain));
};
async function scanDir(baseDir, subdir) {
    const dir = (0,external_node_path_namespaceObject.join)(baseDir, subdir);
    const results = [];
    try {
        const entries = await (0,promises_namespaceObject.readdir)(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            if (entry.isDirectory()) {
                const subFiles = await (0,promises_namespaceObject.readdir)((0,external_node_path_namespaceObject.join)(dir, entry.name));
                for (const file of subFiles.filter((f)=>f.endsWith('.md'))){
                    const filePath = (0,external_node_path_namespaceObject.join)(dir, entry.name, file);
                    const meta = await extractPageMeta(filePath);
                    results.push({
                        path: `${subdir}/${entry.name}/${file}`,
                        ...meta
                    });
                }
            } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'overview.md' && entry.name !== 'topics.txt') {
                const filePath = (0,external_node_path_namespaceObject.join)(dir, entry.name);
                const meta = await extractPageMeta(filePath);
                results.push({
                    path: `${subdir}/${entry.name}`,
                    ...meta
                });
            }
        }
    } catch  {
    /* empty */ }
    return results;
}
async function freshnessCheck() {
    const now = new Date();
    console.log(`Freshness check \u{2014} ${now.toISOString().slice(0, 10)}\n`);
    const stale = [];
    const unverified = [];
    const noDate = [];
    for (const subdir of PAGE_DIRS){
        const pages = await scanDir(WIKI_DIR, subdir);
        for (const page of pages){
            const refDate = parseDate(page.lastVerified) || parseDate(page.ingested);
            if (!refDate) {
                noDate.push(page);
                continue;
            }
            const ageMs = now.getTime() - refDate.getTime();
            const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
            const threshold = isFastMoving(page.discipline) ? TECH_STALE_DAYS : STALE_DAYS;
            if (ageDays > threshold) stale.push({
                ...page,
                ageDays,
                threshold
            });
            if (page.verified === 'no') unverified.push({
                ...page,
                ageDays
            });
        }
    }
    if (stale.length > 0) {
        console.log(`Stale pages (${stale.length}):`);
        console.log(`  (threshold: ${TECH_STALE_DAYS}d for tech, ${STALE_DAYS}d for others)\n`);
        const byAge = stale.sort((a, b)=>b.ageDays - a.ageDays);
        for (const p of byAge.slice(0, 30)){
            const domain = isFastMoving(p.discipline) ? "\u26A1" : '  ';
            console.log(`  ${domain} ${String(p.ageDays).padStart(4)}d  ${p.path}`);
        }
        if (stale.length > 30) console.log(`  ... and ${stale.length - 30} more`);
        console.log('');
    }
    if (unverified.length > 0) {
        console.log(`Unverified pages (${unverified.length}):`);
        for (const p of unverified.slice(0, 20))console.log(`   ${p.path}`);
        if (unverified.length > 20) console.log(`   ... and ${unverified.length - 20} more`);
        console.log('');
    }
    if (noDate.length > 0) {
        console.log(`Pages missing Ingested/Last-verified date (${noDate.length}):`);
        for (const p of noDate.slice(0, 20))console.log(`   ${p.path}`);
        if (noDate.length > 20) console.log(`   ... and ${noDate.length - 20} more`);
        console.log('');
    }
    const total = stale.length + unverified.length + noDate.length;
    if (total === 0) {
        console.log('All pages are fresh!');
    } else {
        console.log(`Summary: ${stale.length} stale, ${unverified.length} unverified, ${noDate.length} missing dates`);
    }
}
const freshness_check_command = {
    description: 'Flag stale (>90d/180d), unverified, or undated pages',
    run: ()=>freshnessCheck()
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/health-check.ts





const HEALTH_FILE = (0,external_node_path_namespaceObject.join)(WIKI_ROOT, 'health.json');
// Source-type dirs carry a **Source** ref that should resolve to raw material.
const SOURCE_DIRS = new Set(PAGE_TYPES.filter((p)=>p.group === 'source').map((p)=>p.type));
async function listAllPages() {
    const pages = [];
    for (const dir of PAGE_DIRS){
        const dirPath = (0,external_node_path_namespaceObject.join)(WIKI_DIR, dir);
        const files = (await readMdFiles(dirPath)).filter((f)=>f !== 'index.md');
        for (const file of files){
            pages.push({
                dir,
                relPath: `${dir}/${file}`,
                fullPath: (0,external_node_path_namespaceObject.join)(dirPath, file)
            });
        }
    }
    return pages;
}
function health_check_buildInventory(pages) {
    const inv = new Set([
        'index.md'
    ]);
    for (const p of pages){
        const noMd = p.relPath.replace(/\.md$/, '');
        inv.add(p.relPath);
        inv.add(noMd);
    }
    return inv;
}
function scanWikilinks(content, inventory) {
    const broken = [];
    const resolved = [];
    for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)){
        const link = match[1].replace(/\.md$/, '');
        const normalized = link.replace(/^raw\//, '').replace(/^wiki\//, '');
        const isWikiLink = PAGE_DIRS.some((d)=>normalized.startsWith(`${d}/`));
        if (!isWikiLink) continue;
        const withMd = normalized.endsWith('.md') ? normalized : `${normalized}.md`;
        const withoutMd = normalized.replace(/\.md$/, '');
        if (!inventory.has(withMd) && !inventory.has(withoutMd)) {
            broken.push(match[1]);
        } else {
            resolved.push(withoutMd);
        }
    }
    return {
        broken,
        resolved
    };
}
async function findRawSource(sourceField) {
    const cleaned = sourceField.replace(/^\s*\[+/, '').replace(/\]+\s*$/, '').trim();
    if (!cleaned) return true;
    if (/^https?:\/\//i.test(cleaned)) return true;
    const candidates = [
        cleaned,
        `${cleaned}.md`,
        cleaned.replace(/\s+/g, '-').toLowerCase(),
        `${cleaned.replace(/\s+/g, '-').toLowerCase()}.md`
    ];
    for (const c of candidates){
        if ((0,external_node_fs_namespaceObject.existsSync)((0,external_node_path_namespaceObject.join)(RAW_DIR, c))) return true;
    }
    for (const subdir of RAW_SUBDIRS){
        for (const c of candidates){
            if ((0,external_node_fs_namespaceObject.existsSync)((0,external_node_path_namespaceObject.join)(RAW_DIR, subdir, c))) return true;
        }
    }
    return false;
}
async function extractSourceField(filePath) {
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, 25);
        for (const line of lines){
            if (line.startsWith('**Source**:')) {
                const value = line.split(':').slice(1).join(':').trim();
                return value || null;
            }
        }
        return null;
    } catch  {
        return null;
    }
}
async function buildReport() {
    const pages = await listAllPages();
    const inventory = health_check_buildInventory(pages);
    const brokenLinks = [];
    const incomingByTarget = {};
    const brokenSources = [];
    let totalWikilinks = 0;
    for (const p of pages){
        const content = await (0,promises_namespaceObject.readFile)(p.fullPath, 'utf-8');
        const { broken, resolved } = scanWikilinks(content, inventory);
        totalWikilinks += broken.length + resolved.length;
        for (const link of broken)brokenLinks.push({
            page: p.relPath,
            link
        });
        for (const target of resolved){
            incomingByTarget[target] = (incomingByTarget[target] || 0) + 1;
        }
        if (SOURCE_DIRS.has(p.dir)) {
            const src = await extractSourceField(p.fullPath);
            if (src) {
                const found = await findRawSource(src);
                if (!found) brokenSources.push({
                    page: p.relPath,
                    source: src
                });
            }
        }
    }
    const orphans = [];
    for (const p of pages){
        if (ORPHAN_EXEMPT_DIRS.has(p.dir)) continue;
        const noMd = p.relPath.replace(/\.md$/, '');
        if (!incomingByTarget[noMd] && !incomingByTarget[p.relPath]) {
            orphans.push(p.relPath);
        }
    }
    return {
        generated_at: new Date().toISOString(),
        wiki_root: WIKI_ROOT,
        totals: {
            pages: pages.length,
            wikilinks: totalWikilinks,
            broken_links: brokenLinks.length,
            orphans: orphans.length,
            broken_sources: brokenSources.length
        },
        broken_links: brokenLinks,
        orphans,
        broken_sources: brokenSources
    };
}
function printSummary(report) {
    console.log(`llm-wiki health \u{2014} ${report.generated_at}`);
    console.log(`Wiki root: ${report.wiki_root}`);
    console.log('');
    console.log(`Pages: ${report.totals.pages}`);
    console.log(`Wikilinks scanned: ${report.totals.wikilinks}`);
    console.log(`Broken wikilinks: ${report.totals.broken_links}`);
    console.log(`Orphan pages: ${report.totals.orphans}`);
    console.log(`Broken **Source** refs in source pages: ${report.totals.broken_sources}`);
    if (report.broken_sources.length) {
        console.log('');
        console.log(`Broken sources (${report.broken_sources.length}):`);
        for (const b of report.broken_sources.slice(0, 20)){
            console.log(`  ${b.page} \u{2192} ${b.source}`);
        }
        if (report.broken_sources.length > 20) {
            console.log(`  ... and ${report.broken_sources.length - 20} more`);
        }
    }
    if (report.broken_links.length) {
        console.log('');
        console.log(`Broken wikilinks (${report.broken_links.length}, top 10):`);
        for (const b of report.broken_links.slice(0, 10)){
            console.log(`  ${b.page} \u{2192} [[${b.link}]]`);
        }
    }
    console.log('');
    console.log(`Full report: ${HEALTH_FILE}`);
}
const health_check_command = {
    description: 'Aggregate wiki health: broken links, orphans, broken **Source** refs; writes health.json',
    run: async (args)=>{
        const { flags } = parseArgs(args);
        if (!(0,external_node_fs_namespaceObject.existsSync)(WIKI_DIR)) {
            console.error(`Wiki not initialized at ${WIKI_ROOT}.`);
            process.exit(1);
        }
        const report = await buildReport();
        if (flags.json) {
            console.log(JSON.stringify(report, null, 2));
        } else {
            printSummary(report);
        }
        if (!flags['dry-run']) {
            await (0,promises_namespaceObject.mkdir)((0,external_node_path_namespaceObject.dirname)(HEALTH_FILE), {
                recursive: true
            });
            await (0,promises_namespaceObject.writeFile)(HEALTH_FILE, JSON.stringify(report, null, 2) + '\n');
        }
    }
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/stats.ts


const pad = (str, width)=>String(str).padEnd(width);
const num = (val, width)=>String(val).padStart(width);
async function stats() {
    const wiki = {};
    for (const { type } of PAGE_TYPES){
        wiki[type] = await countMdFiles((0,external_node_path_namespaceObject.join)(WIKI_DIR, type));
    }
    const raw = {};
    for (const sub of RAW_SUBDIRS){
        raw[sub] = await countMdFiles((0,external_node_path_namespaceObject.join)(RAW_DIR, sub));
    }
    const totalRaw = Object.values(raw).reduce((a, b)=>a + b, 0);
    const totalWiki = Object.values(wiki).reduce((a, b)=>a + b, 0);
    const W = 38;
    const line = (l, content, r)=>`${l}${content.padEnd(W - 2)}${r}`;
    console.log(line("\u2554", "\u2550".repeat(W - 2), "\u2557"));
    console.log(line("\u2551", '        LLM Wiki Dashboard         ', "\u2551"));
    console.log(line("\u2560", "\u2550".repeat(W - 2), "\u2563"));
    console.log(line("\u2551", '  Raw Sources (Layer 1)             ', "\u2551"));
    for (const [key, val] of Object.entries(raw)){
        if (val > 0) console.log(line("\u2551", `    ${pad(key, 20)} ${num(val, 5)}  `, "\u2551"));
    }
    console.log(line("\u2551", `    ${pad('TOTAL', 20)} ${num(totalRaw, 5)}  `, "\u2551"));
    console.log(line("\u2560", "\u2550".repeat(W - 2), "\u2563"));
    console.log(line("\u2551", '  Wiki Pages (Layer 2)              ', "\u2551"));
    for (const [key, val] of Object.entries(wiki)){
        if (val > 0) console.log(line("\u2551", `    ${pad(key, 20)} ${num(val, 5)}  `, "\u2551"));
    }
    console.log(line("\u2551", `    ${pad('TOTAL', 20)} ${num(totalWiki, 5)}  `, "\u2551"));
    console.log(line("\u2560", "\u2550".repeat(W - 2), "\u2563"));
    console.log(line("\u2551", `    ${pad('Grand Total', 20)} ${num(totalRaw + totalWiki, 5)}  `, "\u2551"));
    console.log(line("\u255A", "\u2550".repeat(W - 2), "\u255D"));
}
const stats_command = {
    description: 'Box-drawing dashboard of raw + wiki page counts',
    run: ()=>stats()
};

;// CONCATENATED MODULE: ./src/llm-wiki/cli.ts









dispatch({
    name: 'llm-wiki',
    commands: {
        init: command,
        lint: lint_command,
        'generate-index': generate_index_command,
        'generate-topics': generate_topics_command,
        'freshness-check': freshness_check_command,
        'health-check': health_check_command,
        stats: stats_command,
        install: installCommand,
        uninstall: uninstallCommand
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
