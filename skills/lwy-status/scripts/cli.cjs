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
    return external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy', '.var', 'logs');
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

;// CONCATENATED MODULE: ./src/shared/learnwy-paths.ts


const LEARNWY_ROOT = external_node_path_namespaceObject.join(external_node_os_namespaceObject.homedir(), '.learnwy');
function learnwyPath(...segments) {
    return external_node_path_namespaceObject.join(LEARNWY_ROOT, ...segments);
}
function learnwy_paths_skillRoot(skill) {
    return learnwyPath(skill);
}
function varRoot(name) {
    return learnwyPath('.var', name);
}
const PATHS = {
    llmWiki: learnwy_paths_skillRoot('llm-wiki'),
    promptOptimizer: varRoot('prompt-optimizer'),
    knowledgeConsolidation: varRoot('knowledge-consolidation'),
    learnwyStatus: varRoot('learnwy-status')
};
function envOr(envVar, fallback) {
    const v = process.env[envVar];
    return v && v.length > 0 ? v : fallback;
}

;// CONCATENATED MODULE: ./src/lwy-status/lib/digest.ts



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
    const f = external_node_path_namespaceObject.join(LEARNWY_ROOT, '.var', 'prompt-optimizer', 'events.jsonl');
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
    const f = external_node_path_namespaceObject.join(LEARNWY_ROOT, '.var', 'knowledge-consolidation', 'last-nudge.json');
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
    const dir = external_node_path_namespaceObject.join(LEARNWY_ROOT, '.var', 'logs');
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

;// CONCATENATED MODULE: ./src/lwy-status/cmd/status.ts


const command = {
    description: 'Print a one-screen digest of all ~/.learnwy/ subsystems',
    run: (args)=>{
        const { flags } = parseArgs(args);
        const d = buildDigest();
        if (flags.json) {
            console.log(JSON.stringify(d, null, 2));
        } else if (flags.compact) {
            console.log(formatCompact(d));
        } else {
            console.log(formatHuman(d));
        }
    }
};

;// CONCATENATED MODULE: ./src/lwy-status/cmd/doctor.ts




const HOME = external_node_os_namespaceObject.homedir();
const doctor_LEARNWY_ROOT = external_node_path_namespaceObject.join(HOME, '.learnwy');
const CLAUDE_SETTINGS = external_node_path_namespaceObject.join(HOME, '.claude', 'settings.json');
const TRAE_HOOKS = external_node_path_namespaceObject.join(HOME, '.trae', 'hooks.json');
const CODEX_HOOKS = external_node_path_namespaceObject.join(HOME, '.codex', 'hooks.json');
const CODEX_CONFIG = external_node_path_namespaceObject.join(HOME, '.codex', 'config.toml');
const REQUIRED_DISPATCHER_HOOKS = [
    'UserPromptSubmit',
    'Stop',
    'SessionStart'
];
function checkNode() {
    const major = parseInt(process.versions.node.split('.')[0] ?? '0', 10);
    if (major >= 22) return {
        name: 'Node version',
        status: 'ok',
        detail: `${process.version} (\u{2265} 22 required)`
    };
    return {
        name: 'Node version',
        status: 'error',
        detail: `${process.version} \u{2014} too old; upgrade to \u{2265} 22`
    };
}
function readHooksConfig(file) {
    if (!external_node_fs_namespaceObject.existsSync(file)) return null;
    try {
        return JSON.parse(external_node_fs_namespaceObject.readFileSync(file, 'utf8'));
    } catch  {
        return null;
    }
}
function hookCommands(cfg, event) {
    if (!cfg?.hooks?.[event]) return [];
    const out = [];
    for (const g of cfg.hooks[event]){
        for (const h of g.hooks || []){
            if (h.command) out.push(h.command);
        }
    }
    return out;
}
function checkHookRegistration(file, label) {
    const cfg = readHooksConfig(file);
    if (!cfg) {
        return [
            {
                name: `${label} hooks`,
                status: 'warn',
                detail: `${file} not present (skill not yet installed for this IDE?)`
            }
        ];
    }
    const checks = [];
    for (const event of REQUIRED_DISPATCHER_HOOKS){
        const cmds = hookCommands(cfg, event);
        const dispatcher = cmds.find((c)=>c.includes('learnwy-dispatch'));
        const stale = cmds.filter((c)=>[
                'llm-wiki/scripts/hooks',
                'prompt-optimizer/scripts/hooks',
                'knowledge-consolidation/scripts/hooks',
                'learnwy-status/scripts/hooks'
            ].some((p)=>c.includes(p)));
        if (!dispatcher) {
            checks.push({
                name: `${label} ${event}`,
                status: 'error',
                detail: "learnwy-dispatch hook missing \u2014 run `pnpm run install:hooks`"
            });
        } else if (stale.length) {
            checks.push({
                name: `${label} ${event}`,
                status: 'warn',
                detail: `${stale.length} stale per-skill entry/entries \u{2014} run \`pnpm run install:hooks\` (idempotent sweep clears them)`
            });
        } else {
            checks.push({
                name: `${label} ${event}`,
                status: 'ok',
                detail: 'dispatcher registered'
            });
        }
    }
    return checks;
}
function readFeatureValue(toml, key) {
    const lines = toml.replace(/\r\n/g, '\n').split('\n');
    let inFeatures = false;
    for (const line of lines){
        if (/^\s*\[features\]\s*(?:#.*)?$/.test(line)) {
            inFeatures = true;
            continue;
        }
        if (inFeatures && /^\s*\[[^\]]+\]\s*(?:#.*)?$/.test(line)) break;
        if (!inFeatures) continue;
        const match = line.match(new RegExp(`^\\s*${key}\\s*=\\s*([^#]+)`));
        if (match) return match[1].trim();
    }
    return null;
}
function checkCodexFeatureFlag() {
    if (!external_node_fs_namespaceObject.existsSync(CODEX_CONFIG)) {
        return {
            name: 'Codex hooks feature',
            status: 'ok',
            detail: 'default enabled (no ~/.codex/config.toml)'
        };
    }
    try {
        const toml = external_node_fs_namespaceObject.readFileSync(CODEX_CONFIG, 'utf8');
        const hooks = readFeatureValue(toml, 'hooks');
        const legacyHooks = readFeatureValue(toml, 'codex_hooks');
        if (hooks === 'false') {
            return {
                name: 'Codex hooks feature',
                status: 'error',
                detail: "`[features].hooks = false` disables hooks \u2014 run `pnpm run install:hooks`"
            };
        }
        if (legacyHooks !== null) {
            return {
                name: 'Codex hooks feature',
                status: 'warn',
                detail: "`codex_hooks` is deprecated \u2014 run `pnpm run install:hooks` to migrate to `hooks = true`"
            };
        }
        if (hooks === 'true') {
            return {
                name: 'Codex hooks feature',
                status: 'ok',
                detail: '`[features].hooks = true`'
            };
        }
        return {
            name: 'Codex hooks feature',
            status: 'ok',
            detail: 'default enabled'
        };
    } catch (err) {
        return {
            name: 'Codex hooks feature',
            status: 'warn',
            detail: `cannot read ${CODEX_CONFIG}: ${err.message}`
        };
    }
}
function checkPathLayout() {
    const required = [
        'llm-wiki',
        external_node_path_namespaceObject.join('.var', 'logs')
    ];
    const checks = [];
    for (const sub of required){
        const p = external_node_path_namespaceObject.join(doctor_LEARNWY_ROOT, sub);
        checks.push({
            name: `~/.learnwy/${sub}/`,
            status: external_node_fs_namespaceObject.existsSync(p) ? 'ok' : 'warn',
            detail: external_node_fs_namespaceObject.existsSync(p) ? 'present' : "missing \u2014 will be created when the subsystem first runs"
        });
    }
    return checks;
}
function checkBundles() {
    const agents = external_node_path_namespaceObject.join(HOME, '.agents', 'skills');
    if (!external_node_fs_namespaceObject.existsSync(agents)) {
        return [
            {
                name: 'global skills install',
                status: 'warn',
                detail: "~/.agents/skills/ missing \u2014 run `pnpm run release` or `pnpm dlx skills install -g -y learnwy/skills`"
            }
        ];
    }
    const required = [
        'learnwy-dispatch/scripts/hooks/user-prompt-submit.cjs',
        'learnwy-dispatch/scripts/hooks/stop.cjs',
        'learnwy-dispatch/scripts/hooks/session-start.cjs'
    ];
    const missing = required.filter((p)=>!external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(agents, p)));
    if (missing.length === 0) return [
        {
            name: 'dispatcher bundles',
            status: 'ok',
            detail: 'all 3 dispatcher cjs present in ~/.agents/'
        }
    ];
    return [
        {
            name: 'dispatcher bundles',
            status: 'error',
            detail: `${missing.length} missing under ~/.agents/skills/ \u{2014} re-run release: ${missing.join(', ')}`
        }
    ];
}
function runDoctor() {
    const checks = [];
    checks.push(checkNode());
    checks.push(...checkHookRegistration(CLAUDE_SETTINGS, 'Claude'));
    checks.push(...checkHookRegistration(TRAE_HOOKS, 'Trae'));
    checks.push(...checkHookRegistration(CODEX_HOOKS, 'Codex'));
    checks.push(checkCodexFeatureFlag());
    checks.push(...checkPathLayout());
    checks.push(...checkBundles());
    return checks;
}
const SYMBOL = {
    ok: "\u2713",
    warn: "\u26A0",
    error: "\u2717"
};
function format(checks) {
    const lines = [
        "learnwy doctor \u2014 system health check",
        ''
    ];
    let warnings = 0;
    let errors = 0;
    const nameWidth = Math.max(...checks.map((c)=>c.name.length));
    for (const c of checks){
        if (c.status === 'warn') warnings++;
        if (c.status === 'error') errors++;
        lines.push(`  ${SYMBOL[c.status]} ${c.name.padEnd(nameWidth)}  ${c.detail}`);
    }
    lines.push('');
    if (errors === 0 && warnings === 0) {
        lines.push('All systems healthy.');
    } else {
        lines.push(`Summary: ${checks.length} checks, ${warnings} warning(s), ${errors} error(s).`);
    }
    return {
        text: lines.join('\n'),
        exit: errors > 0 ? 1 : 0
    };
}
const doctor_command = {
    description: 'System health check across ~/.learnwy/ subsystems and hook registrations',
    run: (args)=>{
        const { flags } = parseArgs(args);
        const checks = runDoctor();
        if (flags.json) {
            console.log(JSON.stringify({
                checks
            }, null, 2));
            const errors = checks.filter((c)=>c.status === 'error').length;
            process.exit(errors > 0 ? 1 : 0);
        } else {
            const { text, exit } = format(checks);
            console.log(text);
            process.exit(exit);
        }
    }
};

;// CONCATENATED MODULE: ./src/lwy-status/cli.ts




dispatch({
    name: 'learnwy-status',
    commands: {
        status: command,
        doctor: doctor_command,
        install: installCommand,
        uninstall: uninstallCommand
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
