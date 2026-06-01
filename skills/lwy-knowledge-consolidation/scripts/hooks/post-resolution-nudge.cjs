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

;// CONCATENATED MODULE: ./src/lwy-knowledge-consolidation/lib/stop-scan.ts



const STATE_FILE = learnwyPath('knowledge-consolidation', 'last-nudge.json');
const DEBOUNCE_MS = 60 * 60 * 1000;
const MIN_RESPONSE_LEN = 1500;
const RESOLUTION_SIGNALS = [
    /\bthe (?:root[- ]cause|bug|issue|problem)\s+(?:was|is|turned out)\b/i,
    /\bfixed it\b/i,
    /\bgot it (?:working|to work)\b/i,
    /\bnow (?:it|the .{1,30})\s+works?\b/i,
    /\b(?:resolved|solved)[—:.]\s/i,
    /^##\s+(?:solution|resolution|root[- ]cause|fix|takeaway)s?\b/im
];
const TRIVIA_SIGNALS = [
    /\b(?:typo|misspell)\b/i,
    /\bmissing\s+(?:semicolon|comma|bracket|paren|quote|import)\b/i,
    /\bwrong\s+(?:env\s*var|environment\s*variable|path|directory|cwd)\b/i,
    /\boff[-\s]?by[-\s]?one\b/i,
    /\bforgot\s+to\s+(?:add|import|export|save|run)\b/i,
    /\bjust\s+a\s+(?:typo|missing|wrong)\b/i,
    /\bcase[-\s]?sensitiv/i
];
const SUBSTANTIVE_SIGNALS = [
    /\b(?:race condition|deadlock|memory leak|regression|production)\b/i,
    /\b(?:architecture|design decision|trade[-\s]?off|migration|schema change)\b/i,
    /\b(?:non[-\s]?obvious|subtle|tricky|gotcha|surprised)\b/i
];
const SKILL_OUTPUT_MARKERS = [
    '[llm-wiki]',
    '[prompt-optimizer',
    '[knowledge-consolidation]'
];
function readState() {
    if (!external_node_fs_namespaceObject.existsSync(STATE_FILE)) return null;
    try {
        return JSON.parse(external_node_fs_namespaceObject.readFileSync(STATE_FILE, 'utf8'));
    } catch  {
        return null;
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
function isSkillOutput(text) {
    return SKILL_OUTPUT_MARKERS.some((m)=>text.includes(m));
}
function countMatches(text, patterns) {
    return patterns.filter((re)=>re.test(text)).length;
}
function scanStop(transcript, payload = {}) {
    if (transcript.length < MIN_RESPONSE_LEN) return null;
    if (isSkillOutput(transcript)) return null;
    const resolution = countMatches(transcript, RESOLUTION_SIGNALS);
    if (resolution === 0) return null;
    const trivia = countMatches(transcript, TRIVIA_SIGNALS);
    const substantive = countMatches(transcript, SUBSTANTIVE_SIGNALS);
    // Suppress nudge for session-local trivia unless balanced by substantive markers.
    if (trivia > 0 && substantive === 0) return null;
    const sessionId = payload.session_id || payload.sessionId;
    const prev = readState();
    const now = Date.now();
    if (prev) {
        const prevTs = Date.parse(prev.ts);
        if (sessionId && prev.session_id === sessionId) return null;
        if (!sessionId && Number.isFinite(prevTs) && now - prevTs < DEBOUNCE_MS) return null;
    }
    writeState({
        session_id: sessionId,
        ts: new Date(now).toISOString()
    });
    const tags = [];
    if (substantive) tags.push(`${substantive} substantive`);
    tags.push(`${resolution} resolution`);
    return [
        '[knowledge-consolidation] Looks like this turn resolved a non-trivial problem',
        `(${tags.join(', ')} signal${resolution + substantive > 1 ? 's' : ''} matched).`,
        'If the insight is reusable, suggest invoking knowledge-consolidation `save` to persist it.',
        'Use `promote` afterwards if it belongs in the global llm-wiki too.',
        'Do NOT auto-write; nudge once per session only.'
    ].join(' ');
}

;// CONCATENATED MODULE: ./src/lwy-knowledge-consolidation/hooks/post-resolution-nudge.ts


async function main() {
    const payload = await readStdin();
    const transcript = payload.assistant_message || payload.last_response || payload.transcript || '';
    const out = scanStop(transcript, payload);
    if (out) injectContext(out);
}
main().catch(()=>process.exit(0));

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
