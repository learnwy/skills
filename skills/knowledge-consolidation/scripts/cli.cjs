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

;// CONCATENATED MODULE: ./src/shared/ide-markers.ts



const IDE_MARKER_DIRS = (/* unused pure expression or super */ null && ([
    '.trae',
    '.claude',
    '.cursor',
    '.windsurf'
]));
const AI_TYPE_MAP = {
    trae: '.trae',
    'trae-cn': '.trae',
    TraeAI: '.trae',
    TraeCN: '.trae',
    'claude-code': '.claude',
    claude: '.claude',
    ClaudeCode: '.claude',
    cursor: '.cursor',
    Cursor: '.cursor',
    windsurf: '.windsurf',
    Windsurf: '.windsurf'
};
function resolveMarker(aiType) {
    return AI_TYPE_MAP[aiType] ?? null;
}
function detectIdeMarkers(projectRoot) {
    const found = [];
    for (const m of IDE_MARKER_DIRS){
        if (fs.existsSync(path.join(projectRoot, m))) found.push(m);
    }
    return found;
}
function homeIdeDirs() {
    const home = os.homedir();
    return [
        '.trae',
        '.trae-cn',
        '.claude',
        '.cursor'
    ].map((d)=>path.join(home, d));
}
function isInsideHomeIdeDir(absPath) {
    for (const d of homeIdeDirs()){
        if (absPath === d || absPath.startsWith(d + path.sep)) return d;
    }
    return null;
}

;// CONCATENATED MODULE: ./src/knowledge-consolidation/lib/path-builder.ts



const VALID_TYPES = [
    'debug',
    'config',
    'workflow',
    'lesson'
];

function getToday() {
    const now = new Date();
    return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}
function sanitizeFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-{2,}/g, '-').replace(/^-/, '').replace(/-$/, '');
}
function countExisting(dir, datePrefix) {
    if (!external_node_fs_namespaceObject.existsSync(dir)) return 0;
    return external_node_fs_namespaceObject.readdirSync(dir).filter((entry)=>{
        if (!entry.startsWith(`${datePrefix}_`)) return false;
        return external_node_fs_namespaceObject.statSync(external_node_path_namespaceObject.join(dir, entry)).isFile();
    }).length;
}
function buildPath(input) {
    if (!input.root) throw new Error('root is required');
    if (!external_node_fs_namespaceObject.existsSync(input.root) || !external_node_fs_namespaceObject.statSync(input.root).isDirectory()) {
        throw new Error(`Project root does not exist: ${input.root}`);
    }
    const aiPath = resolveMarker(input.aiType);
    if (!aiPath) {
        throw new Error(`Unknown AI type: ${input.aiType}. Supported: ${Object.keys(AI_TYPE_MAP).join(', ')}`);
    }
    if (!VALID_TYPES.includes(input.type)) {
        throw new Error(`Unknown knowledge type: ${input.type}. Supported: ${VALID_TYPES.join(', ')}. ` + `For architecture / pattern / api / reference, use the llm-wiki skill instead.`);
    }
    if (!input.name) throw new Error('name is required');
    const knowledgeDir = external_node_path_namespaceObject.join(input.root, aiPath, 'knowledges');
    external_node_fs_namespaceObject.mkdirSync(knowledgeDir, {
        recursive: true
    });
    const date = getToday();
    const seq = String(countExisting(knowledgeDir, date) + 1).padStart(3, '0');
    const safeName = sanitizeFilename(input.name);
    const outputPath = external_node_path_namespaceObject.join(knowledgeDir, `${date}_${seq}_${input.type}_${safeName}.md`);
    return {
        knowledgeDir,
        outputPath,
        date,
        seq,
        safeName
    };
}

;// CONCATENATED MODULE: ./src/knowledge-consolidation/cmd/path.ts

function path_showHelp() {
    console.log(`Usage: cli.cjs path -r <project_root> -a <ai_type> -t <type> -n <filename>

Generate a unique date-sequenced knowledge document path.

Arguments:
  -r, --root      Project root directory (required)
  -a, --ai-type   AI/LLM type: ${Object.keys(AI_TYPE_MAP).join(', ')}
  -t, --type      Knowledge type: ${VALID_TYPES.join(', ')}
                  (For architecture / pattern / api / reference, use llm-wiki instead.)
  -n, --name      Filename (without extension, kebab-case)
  -h, --help      Show this help message

Output: prints the resolved path to stdout (the directory is created if missing).
`);
}
function run(rawArgs) {
    const args = {
        root: '',
        aiType: '',
        type: '',
        name: ''
    };
    for(let i = 0; i < rawArgs.length; i++){
        switch(rawArgs[i]){
            case '-r':
            case '--root':
                args.root = rawArgs[++i] || '';
                break;
            case '-a':
            case '--ai-type':
                args.aiType = rawArgs[++i] || '';
                break;
            case '-t':
            case '--type':
                args.type = rawArgs[++i] || '';
                break;
            case '-n':
            case '--name':
                args.name = rawArgs[++i] || '';
                break;
            case '-h':
            case '--help':
                path_showHelp();
                process.exit(0);
            default:
                process.stderr.write(`Error: Unknown option: ${rawArgs[i]}\n`);
                path_showHelp();
                process.exit(1);
        }
    }
    if (!args.root || !args.aiType || !args.type || !args.name) {
        process.stderr.write('Error: --root, --ai-type, --type, --name are all required\n');
        path_showHelp();
        process.exit(1);
    }
    try {
        const resolved = buildPath(args);
        process.stdout.write(resolved.outputPath + '\n');
    } catch (err) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
    }
}
const command = {
    description: 'Generate a unique date-sequenced knowledge document path',
    run
};

;// CONCATENATED MODULE: ./src/knowledge-consolidation/cmd/save.ts


function save_showHelp() {
    console.log(`Usage: cli.cjs save -r <root> -a <ai> -t <type> -n <name> --title T --summary S --details D --takeaways K [--context C] [--related R]

Atomically write a structured knowledge document. Removes the prior 3-step dance
(path \u{2192} template fill \u{2192} validate) \u{2014} one call, validated.

Arguments:
  -r, --root        Project root (required)
  -a, --ai-type     AI/LLM type: ${Object.keys(AI_TYPE_MAP).join(', ')}
  -t, --type        Knowledge type: ${VALID_TYPES.join(', ')}
  -n, --name        Filename slug (kebab-case)
      --title       Document title (the H1)
      --summary     2-3 sentence self-contained summary
      --details     The technical body (Markdown)
      --takeaways   Newline-separated bullets (we add the "- " prefix)
      --background  One-line problem context (optional)
      --context     One-line metadata: project / component / version (optional)
      --related     Related links / files / issues (optional)
  -h, --help        Show help

Note: \\n in --summary / --background / --details / --takeaways / --related is
expanded to a real newline for shell ergonomics.
`);
}
function expandEscapes(s) {
    return s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
}
function parse(rawArgs) {
    const a = {
        root: '',
        aiType: '',
        type: '',
        name: '',
        title: '',
        summary: '',
        background: '',
        details: '',
        takeaways: '',
        context: '',
        related: ''
    };
    for(let i = 0; i < rawArgs.length; i++){
        switch(rawArgs[i]){
            case '-r':
            case '--root':
                a.root = rawArgs[++i] || '';
                break;
            case '-a':
            case '--ai-type':
                a.aiType = rawArgs[++i] || '';
                break;
            case '-t':
            case '--type':
                a.type = rawArgs[++i] || '';
                break;
            case '-n':
            case '--name':
                a.name = rawArgs[++i] || '';
                break;
            case '--title':
                a.title = rawArgs[++i] || '';
                break;
            case '--summary':
                a.summary = expandEscapes(rawArgs[++i] || '');
                break;
            case '--background':
                a.background = expandEscapes(rawArgs[++i] || '');
                break;
            case '--details':
                a.details = expandEscapes(rawArgs[++i] || '');
                break;
            case '--takeaways':
                a.takeaways = expandEscapes(rawArgs[++i] || '');
                break;
            case '--context':
                a.context = rawArgs[++i] || '';
                break;
            case '--related':
                a.related = expandEscapes(rawArgs[++i] || '');
                break;
            case '-h':
            case '--help':
                save_showHelp();
                process.exit(0);
            default:
                process.stderr.write(`Error: Unknown option: ${rawArgs[i]}\n`);
                save_showHelp();
                process.exit(1);
        }
    }
    return a;
}
function formatTakeaways(raw) {
    if (!raw) return '- ';
    return raw.split(/\r?\n/).map((l)=>l.trim()).filter(Boolean).map((l)=>l.startsWith('-') || l.startsWith('*') ? l : `- ${l}`).join('\n');
}
function isoDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function render(a) {
    return `# ${a.title}

> **Type:** ${a.type}
> **Date:** ${isoDate()}
> **Context:** ${a.context || '(unspecified)'}

## Summary

${a.summary}

## Background

${a.background || '_(none provided)_'}

## Details

${a.details}

## Key Takeaways

${formatTakeaways(a.takeaways)}

## Related

${a.related || '_(none)_'}
`;
}
function save_run(rawArgs) {
    const args = parse(rawArgs);
    const required = [
        'root',
        'aiType',
        'type',
        'name',
        'title',
        'summary',
        'details',
        'takeaways'
    ];
    const missing = required.filter((k)=>!args[k]);
    if (missing.length) {
        process.stderr.write(`Error: missing required: ${missing.join(', ')}\n`);
        save_showHelp();
        process.exit(1);
    }
    try {
        const resolved = buildPath(args);
        external_node_fs_namespaceObject.writeFileSync(resolved.outputPath, render(args));
        process.stdout.write(resolved.outputPath + '\n');
    } catch (err) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
    }
}
const save_command = {
    description: 'Atomically write a structured knowledge document (path + template in one call)',
    run: save_run
};

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

;// CONCATENATED MODULE: ./src/knowledge-consolidation/cmd/promote.ts




function promote_showHelp() {
    console.log(`Usage: cli.cjs promote -p <kc-doc.md> [--wiki-root DIR]

Promote a project-local knowledge doc into the global llm-wiki ingestion queue.

Arguments:
  -p, --path        Path to the KC doc to promote (required)
      --wiki-root   llm-wiki root (default: $LLM_WIKI_ROOT or ~/.learnwy/llm-wiki)
  -h, --help        Show help

Behaviour:
  - Copies the file into <wiki-root>/raw/notes/<date>-<slug>.md.
  - Prepends a frontmatter pointer back to the original KC doc.
  - No-op (warns and exits 0) if the wiki root is missing \u{2014} KC has no
    obligation to require llm-wiki.
`);
}
function promote_isoDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function defaultWikiRoot() {
    return envOr('LLM_WIKI_ROOT', learnwyPath('llm-wiki'));
}
function deriveSlug(filePath) {
    const base = external_node_path_namespaceObject.basename(filePath, '.md');
    const trimmed = base.replace(/^\d{8}_\d{3}_(?:debug|config|workflow|lesson)_/, '');
    return sanitizeFilename(trimmed) || sanitizeFilename(base) || 'note';
}
function promote_run(rawArgs) {
    let docPath = '';
    let wikiRoot = defaultWikiRoot();
    for(let i = 0; i < rawArgs.length; i++){
        switch(rawArgs[i]){
            case '-p':
            case '--path':
                docPath = rawArgs[++i] || '';
                break;
            case '--wiki-root':
                wikiRoot = rawArgs[++i] || '';
                break;
            case '-h':
            case '--help':
                promote_showHelp();
                process.exit(0);
            default:
                process.stderr.write(`Error: Unknown option: ${rawArgs[i]}\n`);
                promote_showHelp();
                process.exit(1);
        }
    }
    if (!docPath) {
        process.stderr.write('Error: --path is required\n');
        promote_showHelp();
        process.exit(1);
    }
    docPath = external_node_path_namespaceObject.resolve(docPath);
    if (!external_node_fs_namespaceObject.existsSync(docPath)) {
        process.stderr.write(`Error: file not found: ${docPath}\n`);
        process.exit(1);
    }
    const notesDir = external_node_path_namespaceObject.join(wikiRoot, 'raw', 'notes');
    if (!external_node_fs_namespaceObject.existsSync(wikiRoot)) {
        process.stderr.write(`Skip: llm-wiki not initialised at ${wikiRoot}.\n`);
        process.stderr.write('To enable promote, init the wiki first or pass --wiki-root.\n');
        process.exit(0);
    }
    external_node_fs_namespaceObject.mkdirSync(notesDir, {
        recursive: true
    });
    const slug = deriveSlug(docPath);
    const target = external_node_path_namespaceObject.join(notesDir, `${promote_isoDate()}-${slug}.md`);
    const original = external_node_fs_namespaceObject.readFileSync(docPath, 'utf8');
    const frontmatter = `<!-- promoted from knowledge-consolidation\n` + `source: ${docPath}\n` + `promoted_at: ${new Date().toISOString()}\n` + `-->\n\n`;
    external_node_fs_namespaceObject.writeFileSync(target, frontmatter + original);
    process.stdout.write(target + '\n');
}
const promote_command = {
    description: 'Promote a KC doc into the global llm-wiki raw/notes/ queue',
    run: promote_run
};

;// CONCATENATED MODULE: ./src/knowledge-consolidation/cli.ts





dispatch({
    name: 'knowledge-consolidation',
    commands: {
        path: command,
        save: save_command,
        promote: promote_command,
        install: installCommand,
        uninstall: uninstallCommand
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
