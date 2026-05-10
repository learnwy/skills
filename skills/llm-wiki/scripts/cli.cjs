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

;// CONCATENATED MODULE: external "node:fs/promises"
const promises_namespaceObject = require("node:fs/promises");
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
const RAW_SUBDIRS = [
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
        const entries = await (0,promises_namespaceObject.readdir)(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            if (entry.isDirectory()) {
                const subFiles = await readMdFiles((0,external_node_path_namespaceObject.join)(dir, entry.name));
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

;// CONCATENATED MODULE: ./src/llm-wiki/lib/categories.ts
const CATEGORY_ORDER = [
    {
        category: 'Software Engineering',
        match: [
            'Software Engineering'
        ]
    },
    {
        category: 'Frontend Engineering',
        match: [
            'Frontend Engineering',
            'web'
        ]
    },
    {
        category: 'iOS Development',
        match: [
            'iOS Development',
            'iOS',
            'ios'
        ]
    },
    {
        category: 'Android Development',
        match: [
            'Android Development',
            'Android',
            'android'
        ]
    },
    {
        category: 'Go BFF',
        match: [
            'Go BFF',
            'Go',
            'server'
        ]
    },
    {
        category: 'AI/ML',
        match: [
            'AI/ML',
            'Artificial Intelligence',
            'Machine Learning'
        ]
    },
    {
        category: 'System Design',
        match: [
            'System Design',
            'Software Design'
        ]
    },
    {
        category: 'Thinking & Learning',
        match: [
            'Thinking',
            'Learning',
            'Psychology',
            'Education'
        ]
    },
    {
        category: 'Writing & Literature',
        match: [
            'Writing',
            'Literature'
        ]
    },
    {
        category: 'Humanities & Social Sciences',
        match: [
            'Philosophy',
            'Linguistics',
            'History',
            'Law',
            'Political Science',
            'Sociology',
            'Art'
        ]
    },
    {
        category: 'Economics & Business',
        match: [
            'Economics',
            'Finance',
            'Management',
            'Accounting',
            'Marketing',
            'International Trade'
        ]
    },
    {
        category: 'Natural Sciences',
        match: [
            'Mathematics',
            'Physics',
            'Chemistry',
            'Geography',
            'Astronomy',
            'Ecology'
        ]
    },
    {
        category: 'Life & Medical Sciences',
        match: [
            'Biology',
            'Medicine',
            'Medical',
            'Traditional Chinese',
            'Public Health',
            'Nursing',
            'Veterinary'
        ]
    },
    {
        category: 'Engineering & Technology',
        match: [
            'Computer Science',
            'Electronic',
            'Mechanical',
            'Civil',
            'Architecture',
            'Materials',
            'Energy',
            'Environmental',
            'Urban',
            'Traffic'
        ]
    },
    {
        category: 'Agriculture & Forestry',
        match: [
            'Agronomy',
            'Forestry',
            'Horticulture',
            'Aquaculture',
            'Animal Husbandry'
        ]
    },
    {
        category: 'Interdisciplinary',
        match: [
            'Big Data',
            'Bioinformatics',
            'Food Science',
            'Pharmacy',
            'Kinesiology'
        ]
    },
    {
        category: 'Practical Skills',
        match: [
            'English',
            'Database',
            'Operating System',
            'UI/UX',
            'Software Testing',
            'Programming',
            'Design'
        ]
    },
    {
        category: 'Cross-Platform',
        match: [
            'cross-platform'
        ]
    },
    {
        category: 'Methodology',
        match: [
            'Methodology'
        ]
    }
];
function categorize(discipline) {
    const d = discipline.toLowerCase();
    for (const { category, match } of CATEGORY_ORDER){
        if (match.some((m)=>d.includes(m.toLowerCase()))) return category;
    }
    return 'Other';
}

;// CONCATENATED MODULE: ./src/llm-wiki/lib/index.ts





;// CONCATENATED MODULE: ./src/llm-wiki/cmd/lint.ts



const DEEP_SCAN_TYPES = new Set([
    'concepts'
]);
async function buildInventory() {
    const inventory = new Set();
    const allFiles = {};
    for (const dir of PAGE_DIRS){
        const dirPath = (0,external_node_path_namespaceObject.join)(WIKI_DIR, dir);
        allFiles[dir] = [];
        if (DEEP_SCAN_TYPES.has(dir)) {
            const entries = await readMdFilesDeep(dirPath);
            for (const { file, subdir } of entries){
                const relPath = subdir ? `${subdir}/${file}` : file;
                allFiles[dir].push({
                    file,
                    relPath,
                    subdir
                });
                const slug = file.replace('.md', '');
                inventory.add(`${dir}/${slug}`);
                inventory.add(`${dir}/${file}`);
                if (subdir) {
                    inventory.add(`${dir}/${subdir}/${slug}`);
                    inventory.add(`${dir}/${subdir}/${file}`);
                }
            }
        } else {
            const files = await readMdFiles(dirPath);
            for (const file of files){
                allFiles[dir].push({
                    file,
                    relPath: file,
                    subdir: ''
                });
                inventory.add(`${dir}/${file.replace('.md', '')}`);
                inventory.add(`${dir}/${file}`);
            }
        }
    }
    inventory.add('index.md');
    inventory.add('overview.md');
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
function checkMetaTags(dir, content) {
    const missing = [];
    if (dir === 'snippets') {
        if (!content.includes('**Language**:')) missing.push('**Language**: tag');
        if (!content.includes('**Platform**:')) missing.push('**Platform**: tag');
    }
    if (dir === 'troubleshooting') {
        if (!content.includes('**Platform**:')) missing.push('**Platform**: tag');
        if (!content.includes('**Severity**:')) missing.push('**Severity**: tag');
    }
    return missing;
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
        for (const { file, relPath, subdir } of allFiles[dir] || []){
            const filePath = subdir ? (0,external_node_path_namespaceObject.join)(WIKI_DIR, dir, subdir, file) : (0,external_node_path_namespaceObject.join)(WIKI_DIR, dir, file);
            const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
            const loc = `${dir}/${relPath}`;
            totalPages++;
            if (!content.split('\n')[0]?.startsWith('# ')) {
                warnings.push(`${loc}: Missing # title on line 1`);
            }
            const { broken, resolved } = checkWikilinks(content, inventory);
            totalLinks += broken.length + resolved.length;
            for (const link of broken){
                errors.push(`${loc}: Broken link -> [[${link}]]`);
            }
            for (const target of resolved){
                incomingLinks[target] = (incomingLinks[target] || 0) + 1;
            }
            const missingTags = checkMetaTags(dir, content);
            for (const tag of missingTags){
                warnings.push(`${loc}: Missing ${tag}`);
            }
        }
    }
    for (const dir of PAGE_DIRS){
        if (dir === 'entities' || dir === 'comparisons') continue;
        for (const { file, subdir } of allFiles[dir] || []){
            const slug = file.replace('.md', '');
            const flatKey = `${dir}/${slug}`;
            const nestedKey = subdir ? `${dir}/${subdir}/${slug}` : flatKey;
            if (!incomingLinks[flatKey] && !incomingLinks[nestedKey]) {
                const loc = subdir ? `${dir}/${subdir}/${file}` : `${dir}/${file}`;
                warnings.push(`${loc}: Orphan page (no incoming wikilinks)`);
            }
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
const command = {
    description: 'Check broken wikilinks, orphans, missing meta tags',
    run: async ()=>{
        const code = await lint();
        process.exit(code);
    }
};

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/generate-index.ts



const generate_index_DEEP_SCAN_TYPES = new Set([
    'concepts'
]);
async function scanPages() {
    const allPages = {};
    let totalPages = 0;
    for (const { type } of PAGE_TYPES){
        const dir = (0,external_node_path_namespaceObject.join)(WIKI_DIR, type);
        const pages = [];
        if (generate_index_DEEP_SCAN_TYPES.has(type)) {
            const entries = await readMdFilesDeep(dir);
            for (const { file, subdir } of entries){
                const relPath = subdir ? `${subdir}/${file}` : file;
                const meta = await extractMeta((0,external_node_path_namespaceObject.join)(dir, relPath));
                const slug = file.replace('.md', '');
                pages.push({
                    slug,
                    file,
                    relPath,
                    subdir,
                    ...meta,
                    title: meta.title || slugToTitle(slug)
                });
            }
        } else {
            const files = await readMdFiles(dir);
            for (const file of files){
                const meta = await extractMeta((0,external_node_path_namespaceObject.join)(dir, file));
                const slug = file.replace('.md', '');
                pages.push({
                    slug,
                    file,
                    relPath: file,
                    subdir: '',
                    ...meta,
                    title: meta.title || slugToTitle(slug)
                });
            }
        }
        allPages[type] = pages;
        totalPages += pages.length;
    }
    return {
        allPages,
        totalPages
    };
}
function groupByDiscipline(allPages) {
    const groups = {};
    for (const [type, pages] of Object.entries(allPages)){
        for (const page of pages){
            const disc = page.discipline || page.platform || 'Uncategorized';
            if (!groups[disc]) groups[disc] = {};
            if (!groups[disc][type]) groups[disc][type] = [];
            groups[disc][type].push(page);
        }
    }
    return groups;
}
function organizeByCategory(disciplineGroups) {
    const organized = {};
    for (const [disc, types] of Object.entries(disciplineGroups)){
        const cat = categorize(disc);
        if (!organized[cat]) organized[cat] = {
            disciplines: {}
        };
        if (!organized[cat].disciplines[disc]) organized[cat].disciplines[disc] = {};
        for (const [type, pages] of Object.entries(types)){
            if (!organized[cat].disciplines[disc][type]) organized[cat].disciplines[disc][type] = [];
            organized[cat].disciplines[disc][type].push(...pages);
        }
    }
    return organized;
}
function renderSection(types) {
    const lines = [];
    const summaries = types.summaries || [];
    const concepts = types.concepts || [];
    const snippets = types.snippets || [];
    const troubles = types.troubleshooting || [];
    const comparisons = types.comparisons || [];
    for (const s of summaries){
        const yearStr = s.year ? ` (${s.year})` : '';
        lines.push(`- [${s.title}](summaries/${s.relPath})${yearStr}`);
    }
    for (const c of concepts){
        const tag = c.verified === 'no' ? " \u26A0\uFE0F" : '';
        lines.push(`  - [${c.title}](concepts/${c.relPath})${tag}`);
    }
    if (snippets.length > 0) {
        lines.push('  - **Snippets**:');
        for (const sn of snippets)lines.push(`    - [${sn.title}](snippets/${sn.relPath})`);
    }
    if (troubles.length > 0) {
        lines.push('  - **Troubleshooting**:');
        for (const t of troubles)lines.push(`    - [${t.title}](troubleshooting/${t.relPath})`);
    }
    for (const comp of comparisons){
        lines.push(`  - [${comp.title}](comparisons/${comp.relPath})`);
    }
    return lines;
}
function renderIndex({ allPages, totalPages, rawCount, organized }) {
    const lines = [];
    const now = new Date().toISOString().slice(0, 10);
    const statsLine = Object.entries(allPages).filter(([, p])=>p.length > 0).map(([type, p])=>`${p.length} ${type}`).join(', ');
    lines.push('# Knowledge Base Index');
    lines.push('');
    lines.push('**Created**: 2026-04-26');
    lines.push(`**Last updated**: ${now}`);
    lines.push(`**Total sources**: ${rawCount}`);
    lines.push(`**Total wiki pages**: ${totalPages} (${statsLine})`);
    lines.push('');
    lines.push('> This file is auto-generated by `cli.cjs generate-index`. Do not edit manually.');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## By Category');
    lines.push('');
    for (const { category } of CATEGORY_ORDER){
        const catData = organized[category];
        if (!catData) continue;
        let catSummaries = 0;
        let catConcepts = 0;
        let catSnippets = 0;
        let catTrouble = 0;
        let catComps = 0;
        for (const types of Object.values(catData.disciplines)){
            catSummaries += (types.summaries || []).length;
            catConcepts += (types.concepts || []).length;
            catSnippets += (types.snippets || []).length;
            catTrouble += (types.troubleshooting || []).length;
            catComps += (types.comparisons || []).length;
        }
        const parts = [];
        if (catSummaries) parts.push(`${catSummaries} books/articles`);
        if (catConcepts) parts.push(`${catConcepts} concepts`);
        if (catSnippets) parts.push(`${catSnippets} snippets`);
        if (catTrouble) parts.push(`${catTrouble} troubleshooting`);
        if (catComps) parts.push(`${catComps} comparisons`);
        lines.push(`### ${category} (${parts.join(', ')})`);
        lines.push('');
        for (const types of Object.values(catData.disciplines)){
            lines.push(...renderSection(types));
        }
        lines.push('');
    }
    if (organized['Other']) {
        lines.push('### Other');
        lines.push('');
        for (const types of Object.values(organized['Other'].disciplines)){
            lines.push(...renderSection(types));
        }
        lines.push('');
    }
    lines.push('## Entities');
    lines.push('');
    for (const e of allPages.entities || []){
        lines.push(`- [${e.title}](entities/${e.relPath})`);
    }
    lines.push('');
    return lines.join('\n');
}
async function generateIndex() {
    console.log('Scanning wiki directory...');
    const { allPages, totalPages } = await scanPages();
    for (const { type, label } of PAGE_TYPES){
        console.log(`  ${label}: ${allPages[type].length}`);
    }
    const rawCount = await countMdFilesInSubdirs(RAW_DIR, RAW_SUBDIRS);
    console.log(`  Raw sources: ${rawCount}`);
    const disciplineGroups = groupByDiscipline(allPages);
    const organized = organizeByCategory(disciplineGroups);
    const output = renderIndex({
        allPages,
        totalPages,
        rawCount,
        organized
    });
    const outPath = (0,external_node_path_namespaceObject.join)(WIKI_DIR, 'index.md');
    await (0,promises_namespaceObject.writeFile)(outPath, output);
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
const generate_topics_DEEP_SCAN_TYPES = new Set([
    'concepts'
]);
async function extractDiscipline(filePath) {
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, 15);
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
        let entries;
        if (generate_topics_DEEP_SCAN_TYPES.has(dir)) {
            entries = (await readMdFilesDeep(dirPath)).map((e)=>({
                    file: e.file,
                    fullPath: (0,external_node_path_namespaceObject.join)(dirPath, e.subdir ? `${e.subdir}/${e.file}` : e.file)
                }));
        } else {
            const files = await readMdFiles(dirPath);
            entries = files.map((f)=>({
                    file: f,
                    fullPath: (0,external_node_path_namespaceObject.join)(dirPath, f)
                }));
        }
        for (const { file, fullPath } of entries){
            const slug = file.replace('.md', '');
            keywords.add(slug);
            for (const word of slugToWords(slug))keywords.add(word.toLowerCase());
            const disc = await extractDiscipline(fullPath);
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
    const outPath = (0,external_node_path_namespaceObject.join)(WIKI_DIR, 'topics.txt');
    await (0,promises_namespaceObject.writeFile)(outPath, lines.join('\n'));
    console.log(`Generated wiki/topics.txt (${keywords.size} keywords from ${disciplines.size} disciplines)`);
}
const generate_topics_command = {
    description: 'Regenerate wiki/topics.txt keyword index',
    run: ()=>generateTopics()
};

;// CONCATENATED MODULE: ./src/llm-wiki/lib/concept-domains.ts

const DOMAIN_MAP = [
    {
        dir: 'frontend',
        match: [
            'frontend engineering',
            'react',
            'web ',
            'css',
            'tailwind',
            'rsbuild',
            'rspack',
            'webpack',
            'html',
            'browser',
            'dom ',
            'typescript'
        ]
    },
    {
        dir: 'ios',
        match: [
            'ios development',
            'ios ',
            'swift',
            'swiftui',
            'uikit',
            'xcode',
            'apple'
        ]
    },
    {
        dir: 'android',
        match: [
            'android development',
            'android ',
            'kotlin',
            'jetpack',
            'gradle'
        ]
    },
    {
        dir: 'go',
        match: [
            'go bff',
            'go ',
            'golang',
            'gin '
        ]
    },
    {
        dir: 'system-design',
        match: [
            'system design',
            'distributed system'
        ]
    },
    {
        dir: 'ai-ml',
        match: [
            'ai/ml',
            'artificial intelligence',
            'machine learning',
            'deep learning',
            'llm',
            'transformer'
        ]
    },
    {
        dir: 'devops',
        match: [
            'devops',
            'ci/cd',
            'deployment',
            'observability',
            'monitoring'
        ]
    },
    {
        dir: 'architecture',
        match: [
            'software engineering / design',
            'software engineering / architecture',
            'software engineering / production',
            'software engineering / api',
            'software design',
            'design pattern',
            'software engineering / process',
            'software engineering / reactive'
        ]
    },
    {
        dir: 'se-practices',
        match: [
            'software engineering',
            'software testing',
            'testing',
            'code review',
            'refactoring',
            'legacy code',
            'technical debt'
        ]
    },
    {
        dir: 'cs-fundamentals',
        match: [
            'computer science',
            'networking',
            'algorithm',
            'data structure',
            'hardware'
        ]
    },
    {
        dir: 'philosophy',
        match: [
            'philosophy',
            'ethics',
            'existential',
            'taoism',
            'stoic'
        ]
    },
    {
        dir: 'psychology',
        match: [
            'psychology',
            'behavior',
            'cognitive',
            'mindset',
            'habit',
            'motivation',
            'meaning'
        ]
    },
    {
        dir: 'social-sciences',
        match: [
            'sociology',
            'history',
            'anthropology',
            'education',
            'political',
            'economics',
            'social'
        ]
    },
    {
        dir: 'methodology',
        match: [
            'methodology',
            'strategy',
            'contradiction',
            'practice',
            'protracted',
            'decision-making'
        ]
    },
    {
        dir: 'natural-sciences',
        match: [
            'physics',
            'chemistry',
            'biology',
            'mathematics',
            'ecology',
            'energy',
            'environmental'
        ]
    },
    {
        dir: 'health-medicine',
        match: [
            'medicine',
            'medical',
            'public health',
            'traditional chinese',
            'nursing',
            'veterinary',
            'anatomy'
        ]
    },
    {
        dir: 'design-ux',
        match: [
            'design',
            'ux',
            'ui/ux',
            'usability',
            'human-computer'
        ]
    },
    {
        dir: 'writing-comm',
        match: [
            'writing',
            'communication',
            'literature',
            'linguistics'
        ]
    },
    {
        dir: 'business',
        match: [
            'management',
            'leadership',
            'career',
            'finance',
            'investing',
            'marketing'
        ]
    },
    {
        dir: 'agriculture',
        match: [
            'agronomy',
            'forestry',
            'horticulture',
            'aquaculture',
            'farming',
            'animal husbandry'
        ]
    },
    {
        dir: 'cross-platform',
        match: [
            'cross-platform'
        ]
    }
];
const FILENAME_MAP = [
    {
        dir: 'frontend',
        patterns: [
            'react-',
            'css-',
            'tailwind-',
            'rsbuild-',
            'rspack-',
            'webpack-',
            'web-',
            'dom-',
            'ts-',
            'lcp-',
            'cls-',
            'inp-',
            'virtual-dom',
            'streaming-ssr',
            'server-component',
            'use-transition',
            'concurrent-mode',
            'suspense-',
            'module-federation',
            'micro-frontend',
            'shared-dependencies'
        ]
    },
    {
        dir: 'ios',
        patterns: [
            'ios-',
            'swift-',
            'swiftui-',
            'uikit-',
            'xcode-',
            'navigation-stack',
            'hosting-controller',
            'uiviewrepresentable',
            'scene-lifecycle',
            'coordinator-pattern',
            'spm-modularization',
            'clean-architecture-ios',
            'deep-linking-ios',
            'dependency-injection-ios',
            'actor-isolation',
            'sendable-protocol',
            'structured-concurrency'
        ]
    },
    {
        dir: 'android',
        patterns: [
            'android-',
            'kotlin-',
            'compose-',
            'recyclerview-',
            'activity-lifecycle',
            'stateflow-',
            'diffutil-',
            'coroutine-',
            'proguard-'
        ]
    },
    {
        dir: 'go',
        patterns: [
            'go-',
            'gin-',
            'context-propagation-go',
            'sentinel-errors-go',
            'error-wrapping-go',
            'panic-recovery-go',
            'vo-vs-dto',
            'response-envelope',
            'field-mask-',
            'protobuf-vs-json',
            'api-versioning-go',
            'error-code-standard',
            'request-id-tracing'
        ]
    },
    {
        dir: 'system-design',
        patterns: [
            'rate-limiter-',
            'url-shortener-',
            'notification-system-',
            'chat-system-',
            'consistent-hashing',
            'vector-clocks',
            'consensus-',
            'cap-theorem',
            'eventual-consistency',
            'partition-tolerance',
            'write-ahead-log',
            'data-replication'
        ]
    },
    {
        dir: 'ai-ml',
        patterns: [
            'transformer-',
            'attention-',
            'llm-',
            'rlhf-',
            'prompt-',
            'ai-',
            'batch-vs-realtime-'
        ]
    },
    {
        dir: 'philosophy',
        patterns: [
            'eudaimonia',
            'golden-mean',
            'practical-wisdom',
            'dasein',
            'being-in-the-world',
            'temporality-',
            'wu-wei',
            'the-tao',
            'simplicity-and-naturalness',
            'stoic-',
            'dichotomy-of-control',
            'memento-mori',
            'virtu-and-fortuna'
        ]
    },
    {
        dir: 'psychology',
        patterns: [
            'growth-mindset',
            'fixed-mindset',
            'flow-state',
            'habit-',
            'logotherapy',
            'will-to-meaning',
            'meaning-through-',
            'autotelic-',
            'challenge-skill-',
            'identity-based-',
            'two-minute-rule',
            'effort-as-path',
            'lollapalooza-effect'
        ]
    },
    {
        dir: 'methodology',
        patterns: [
            'principal-contradiction',
            'unity-of-opposites',
            'two-point-',
            'stage-theory',
            'unity-of-knowing',
            'yin-yang',
            'strategic-',
            'guerrilla-',
            'mass-line',
            'base-area',
            'protracted-war',
            'self-reliance'
        ]
    },
    {
        dir: 'se-practices',
        patterns: [
            'code-smell',
            'refactoring-',
            'test-list',
            'walking-skeleton',
            'release-slicing',
            'assert-first',
            'getting-to-green',
            'two-hats-rule',
            'characterization-test',
            'seam-',
            'feature-envy',
            'legacy-code',
            'working-effectively',
            'technical-debt',
            'on-call-',
            'code-review-',
            'writing-design-docs',
            'trunk-based-',
            'feature-flags-',
            'canary-deployment'
        ]
    },
    {
        dir: 'architecture',
        patterns: [
            'bounded-context',
            'ubiquitous-language',
            'aggregate-design',
            'domain-event',
            'anti-corruption-layer',
            'strangler-fig',
            'information-hiding',
            'deep-vs-shallow',
            'abstraction-barrier',
            'circuit-breaker',
            'bulkhead-',
            'sidecar-',
            'ambassador-',
            'scatter-gather',
            'steady-state-',
            'timeout-pattern',
            'observer-pattern',
            'strategy-pattern',
            'decorator-pattern',
            'factory-pattern',
            'composite-pattern',
            'singleton-',
            'adapter-',
            'command-pattern',
            'architecture-quantum',
            'architecture-styles',
            'architecture-decision',
            'architecture-fitness',
            'architecture-characteristics'
        ]
    },
    {
        dir: 'devops',
        patterns: [
            'twelve-factor',
            'config-via-environment',
            'stateless-processes',
            'port-binding',
            'three-pillars-observability',
            'distributed-tracing',
            'structured-logging',
            'cicd-'
        ]
    },
    {
        dir: 'cs-fundamentals',
        patterns: [
            'von-neumann',
            'memory-hierarchy',
            'instruction-pipeline',
            'tcp-ip-',
            'http2-http3',
            'dns-resolution',
            'debounce-throttle',
            'tree-traversal'
        ]
    },
    {
        dir: 'business',
        patterns: [
            'staff-engineer',
            'technical-vision',
            'being-visible',
            'sponsor-network',
            'systems-thinking-engineering',
            'team-growth',
            'migrations-strategy',
            'organizational-design',
            'contribution-focus',
            'circle-of-competence',
            'mental-models'
        ]
    },
    {
        dir: 'writing-comm',
        patterns: [
            'active-verbs',
            'unity-in-writing',
            'conciseness-'
        ]
    },
    {
        dir: 'cross-platform',
        patterns: [
            'native-vs-cross-platform',
            'shared-business-logic',
            'platform-specific-ui',
            'cross-platform'
        ]
    },
    {
        dir: 'social-sciences',
        patterns: [
            'cognitive-revolution',
            'agricultural-revolution-trap',
            'imagined-orders',
            'paradigm-shift',
            'normal-science',
            'scientific-crisis',
            'social-capital',
            'civic-engagement',
            'bridging-vs-bonding',
            'sociological-imagination',
            'banking-model-',
            'critical-consciousness'
        ]
    },
    {
        dir: 'design-ux',
        patterns: [
            'norman-door',
            'affordance',
            'usability-'
        ]
    }
];
const BOOK_DOMAIN_MAP = {
    'clean-code': 'se-practices',
    refactoring: 'se-practices',
    'the-pragmatic-programmer': 'se-practices',
    'working-effectively-with-legacy-code': 'se-practices',
    'test-driven-development': 'se-practices',
    'lessons-learned-in-software-testing': 'se-practices',
    'the-missing-readme': 'se-practices',
    'domain-driven-design': 'architecture',
    'a-philosophy-of-software-design': 'architecture',
    'fundamentals-of-software-architecture': 'architecture',
    'head-first-design-patterns': 'architecture',
    'designing-distributed-systems': 'architecture',
    'release-it': 'architecture',
    'designing-data-intensive-applications': 'system-design',
    'system-design-interview': 'system-design',
    'user-story-mapping': 'se-practices',
    'are-your-lights-on': 'se-practices',
    'on-writing-well': 'writing-comm',
    'the-elements-of-style': 'writing-comm',
    'poor-charlies-almanack': 'business',
    'the-effective-executive': 'business',
    'staff-engineer': 'business',
    'an-elegant-puzzle': 'business',
    'on-contradiction': 'methodology',
    'on-practice': 'methodology',
    'on-protracted-war': 'methodology',
    'thinking-fast-and-slow': 'psychology',
    influence: 'psychology',
    meditations: 'philosophy',
    'the-prince': 'philosophy'
};
const concept_domains_META_SCAN_LINES = 15;
async function concept_domains_extractDiscipline(filePath) {
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, concept_domains_META_SCAN_LINES);
        for (const line of lines){
            if (line.startsWith('**Discipline**:')) return line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Platform**:')) return line.split(':').slice(1).join(':').trim();
        }
    } catch  {
    /* empty */ }
    return '';
}
function classifyByDiscipline(discipline) {
    const d = discipline.toLowerCase();
    for (const { dir, match } of DOMAIN_MAP){
        if (match.some((m)=>d.includes(m))) return dir;
    }
    return '_general';
}
function classifyByFilename(filename) {
    const slug = filename.replace('.md', '').toLowerCase();
    for (const { dir, patterns } of FILENAME_MAP){
        if (patterns.some((p)=>slug.startsWith(p) || slug === p || slug.includes(p))) return dir;
    }
    return null;
}
async function classifyBySourceLinks(filePath) {
    try {
        const content = await (0,promises_namespaceObject.readFile)(filePath, 'utf-8');
        const summaryLinks = [
            ...content.matchAll(/\[\[summaries\/([^\]]+)\]\]/g)
        ].map((m)=>m[1]);
        if (summaryLinks.length === 0) return null;
        for (const link of summaryLinks){
            const slug = link.replace('.md', '');
            if (BOOK_DOMAIN_MAP[slug]) return BOOK_DOMAIN_MAP[slug];
        }
    } catch  {
    /* empty */ }
    return null;
}
async function classifyConcept(filePath, filename) {
    const discipline = await concept_domains_extractDiscipline(filePath);
    let domain = discipline ? classifyByDiscipline(discipline) : null;
    if (!domain || domain === '_general') {
        const byName = classifyByFilename(filename);
        if (byName) domain = byName;
    }
    if (!domain || domain === '_general') {
        const bySource = await classifyBySourceLinks(filePath);
        if (bySource) domain = bySource;
        else domain = domain || '_general';
    }
    return domain;
}

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/reorganize.ts




const CONCEPTS_DIR = (0,external_node_path_namespaceObject.join)(WIKI_DIR, 'concepts');
async function reorganize(args) {
    const dryRun = args.includes('--dry-run');
    const files = (await (0,promises_namespaceObject.readdir)(CONCEPTS_DIR)).filter((f)=>f.endsWith('.md'));
    console.log(`Scanning ${files.length} concept files...\n`);
    const moves = {};
    const stats = {};
    for (const file of files){
        const domain = await classifyConcept((0,external_node_path_namespaceObject.join)(CONCEPTS_DIR, file), file);
        moves[file] = domain;
        stats[domain] = (stats[domain] || 0) + 1;
    }
    console.log('Domain distribution:');
    const sorted = Object.entries(stats).sort((a, b)=>b[1] - a[1]);
    for (const [domain, count] of sorted){
        console.log(`  ${domain.padEnd(20)} ${String(count).padStart(4)}`);
    }
    console.log(`  ${'TOTAL'.padEnd(20)} ${String(files.length).padStart(4)}\n`);
    if (dryRun) {
        console.log("Dry run \u2014 no files moved. Remove --dry-run to execute.");
        const examples = Object.entries(moves).slice(0, 10);
        console.log('\nExample moves:');
        for (const [file, domain] of examples){
            console.log(`  ${file} -> concepts/${domain}/`);
        }
        return;
    }
    const domains = [
        ...new Set(Object.values(moves))
    ];
    for (const domain of domains){
        await (0,promises_namespaceObject.mkdir)((0,external_node_path_namespaceObject.join)(CONCEPTS_DIR, domain), {
            recursive: true
        });
    }
    let moved = 0;
    for (const [file, domain] of Object.entries(moves)){
        const src = (0,external_node_path_namespaceObject.join)(CONCEPTS_DIR, file);
        const dst = (0,external_node_path_namespaceObject.join)(CONCEPTS_DIR, domain, file);
        await (0,promises_namespaceObject.rename)(src, dst);
        moved++;
    }
    console.log(`Moved ${moved} files into ${domains.length} subdirectories.`);
    console.log('\nNext steps:');
    console.log('  1. Run: node cli.cjs generate-index');
    console.log('  2. Run: node cli.cjs generate-topics');
    console.log('  3. Commit changes');
}
const reorganize_command = {
    description: 'Move concept files into domain subdirs (--dry-run to preview)',
    run: (args)=>reorganize(args)
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

;// CONCATENATED MODULE: ./src/llm-wiki/cmd/stats.ts


const pad = (str, width)=>String(str).padEnd(width);
const num = (val, width)=>String(val).padStart(width);
async function stats_stats() {
    const DEEP_TYPES = new Set([
        'concepts'
    ]);
    const wiki = {};
    for (const { type } of PAGE_TYPES){
        wiki[type] = DEEP_TYPES.has(type) ? await countMdFilesDeep((0,external_node_path_namespaceObject.join)(WIKI_DIR, type)) : await countMdFiles((0,external_node_path_namespaceObject.join)(WIKI_DIR, type));
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
    run: ()=>stats_stats()
};

;// CONCATENATED MODULE: ./src/llm-wiki/cli.ts








dispatch({
    name: 'llm-wiki',
    commands: {
        lint: command,
        'generate-index': generate_index_command,
        'generate-topics': generate_topics_command,
        reorganize: reorganize_command,
        'freshness-check': freshness_check_command,
        stats: stats_command,
        install: installCommand,
        uninstall: uninstallCommand
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
