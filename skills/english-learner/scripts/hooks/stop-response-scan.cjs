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

;// CONCATENATED MODULE: ./src/english-learner/lib/stop-scan.ts
const SKILL_MARKERS = [
    "\uD83D\uDCD6 **",
    "\u8BCD\u4E49 Definitions",
    "\u540C\u4E49\u8BCD:",
    "\u53CD\u4E49\u8BCD:",
    "\u638C\u63E1\u5EA6:",
    'english-learner hook',
    "\u67E5\u8BE2\u6B21\u6570:"
];
const isEnglishLearnerOutput = (text)=>SKILL_MARKERS.some((m)=>text.includes(m));
function extractCandidates(text) {
    if (!text) return [];
    const stripped = text.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]+`/g, ' ').replace(/!\[[^\]]*\]\([^)]+\)/g, ' ').replace(/\[[^\]]*\]\([^)]+\)/g, ' ').replace(/[#*_>|`~\-]+/g, ' ');
    const tokens = stripped.match(/\b[a-zA-Z][a-zA-Z'-]{6,}\b/g) || [];
    const seen = new Set();
    const candidates = [];
    for (const raw of tokens){
        const w = raw.toLowerCase();
        if (seen.has(w)) continue;
        if (/^[A-Z]{2,}$/.test(raw)) continue;
        if (/'s$|'re$|'ve$|'ll$|n't$/.test(w)) continue;
        seen.add(w);
        candidates.push(w);
        if (candidates.length >= 12) break;
    }
    return candidates;
}
function scanStop(transcript) {
    if (!transcript || transcript.length < 200) return null;
    if (isEnglishLearnerOutput(transcript)) return null;
    const candidates = extractCandidates(transcript);
    if (candidates.length < 5) return null;
    return [
        '[english-learner stop hook]',
        "Scan the assistant's last response for 2-4 advanced or non-obvious English words/phrases the user might want to learn",
        `(initial candidates: ${candidates.slice(0, 8).join(', ')}).`,
        'If anything is genuinely worth surfacing, ask the user: "Want to save these to your vocabulary store?".',
        "Only the user can decide \u2014 do NOT auto-save.",
        'Skip silently if everything is common (CEFR A1-B1) or domain jargon.'
    ].join(' ');
}

;// CONCATENATED MODULE: ./src/english-learner/hooks/stop-response-scan.ts


async function main() {
    const payload = await readStdin();
    const transcript = payload.assistant_message || payload.last_response || payload.transcript || '';
    const out = scanStop(transcript);
    if (out) injectContext(out);
}
main().catch(()=>process.exit(0));

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
