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

;// CONCATENATED MODULE: ./src/shared/text-classifiers.ts
const CODE_PREFIX_RE = /^(import |const |let |var |function |class |\/\/|#!|{|}|\[|\])/;
const PATH_RE = /^[\/~.].*\.[a-z]{1,4}$/i;
const COMMAND_PREFIX_RE = /^(git |npm |pnpm |yarn |node |cd |ls |cat |mkdir |rm |touch |cp |mv |grep |find |echo |sed |awk |curl |wget |ssh |docker |kubectl )/;
function looksLikeCode(text) {
    return CODE_PREFIX_RE.test(text.trim());
}
function looksLikePath(text) {
    return PATH_RE.test(text.trim());
}
function looksLikeCommand(text) {
    return COMMAND_PREFIX_RE.test(text.trim());
}
function looksLikeNonProse(text) {
    const t = text.trim();
    return CODE_PREFIX_RE.test(t) || PATH_RE.test(t) || COMMAND_PREFIX_RE.test(t);
}
function englishRatio(text) {
    const alpha = (text.match(/[a-zA-Z]/g) || []).length;
    const total = text.replace(/\s/g, '').length;
    return total > 0 ? alpha / total : 0;
}
function chineseRatio(text) {
    const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const total = text.replace(/\s/g, '').length;
    return total > 0 ? cjk / total : 0;
}
const CHINESE_LEARN_RE = /翻译|怎么说|用英[语文]|英文怎么|translate|how.*say|in english/i;
function looksLikeChineseLearnIntent(text) {
    return chineseRatio(text) > 0.3 || CHINESE_LEARN_RE.test(text);
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

;// CONCATENATED MODULE: ./src/llm-wiki/lib/constants.ts


const WIKI_ROOT = envOr('LLM_WIKI_ROOT', learnwyPath('llm-wiki'));
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
const RAW_SUBDIRS = (/* unused pure expression or super */ null && ([
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
]));

;// CONCATENATED MODULE: ./src/llm-wiki/lib/prompt-scan.ts




function scanPrompt(message, wikiRoot = WIKI_ROOT) {
    const lower = (message || '').toLowerCase();
    if (lower.length < 15) return null;
    if (looksLikeNonProse(message)) return null;
    const topicsFile = external_node_path_namespaceObject.join(wikiRoot, 'wiki', 'topics.txt');
    if (!external_node_fs_namespaceObject.existsSync(topicsFile)) return null;
    const topics = external_node_fs_namespaceObject.readFileSync(topicsFile, 'utf8').split('\n').map((t)=>t.trim().toLowerCase()).filter(Boolean);
    const words = lower.split(/\s+/).filter((w)=>w.length > 3);
    const matches = topics.filter((topic)=>words.some((word)=>topic.includes(word)));
    if (matches.length === 0) return null;
    const topMatches = matches.slice(0, 5);
    return [
        `[llm-wiki] Relevant wiki topics found: ${topMatches.join(', ')}`,
        'Consider reading these wiki pages before answering.',
        `Wiki path: ${wikiRoot}/wiki/`
    ].join('\n');
}

;// CONCATENATED MODULE: ./src/llm-wiki/hooks/auto-query.ts


async function main() {
    const payload = await readStdin();
    const message = payload.user_message || payload.prompt || '';
    const out = scanPrompt(message);
    if (out) injectContext(out);
}
main().catch(()=>process.exit(0));

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
