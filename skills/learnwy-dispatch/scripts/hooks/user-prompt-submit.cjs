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

;// CONCATENATED MODULE: ./src/english-learner/lib/prompt-scan.ts

const ENGLISH_BLOCK = [
    '[english-learner hook] The user wrote in English.',
    'Before responding, scan for grammar/word-choice/expression issues (max 3).',
    'If found, prepend a brief "\uD83D\uDCA1 English Tip" table, then proceed with the task.',
    'After rendering the table, persist the corrections by calling:',
    '`node {english-learner-skill}/scripts/cli.cjs vocab record-correction \'[{"original":"X","corrected":"Y","reason":"Z","words":[{"word":"...","definition":"...","phonetic":"..."}]}]\'`.',
    "The optional `words[]` field also feeds the words table \u2014 include it for genuinely new vocabulary, omit for typo\u2192correct cases.",
    'Skip silently if English is fluent/natural.'
].join(' ');
const CHINESE_BLOCK = [
    '[english-learner hook] The user wrote in Chinese.',
    'Before responding to the task, prepend a "\uD83C\uDF10 \u4E2D\u8BD1\u82F1" section:',
    "1. Check the Chinese for grammar errors, typos, or awkward phrasing \u2014 if found, show corrections in a table.",
    "2. Translate the user's Chinese into natural English (provide 2-3 alternative expressions).",
    '3. Extract 2-3 key vocabulary/phrases from the translation, show phonetic + brief usage note.',
    "4. Auto-save all new words/phrases via batch_save (no need to ask \u2014 just save them).",
    "5. Then proceed with the user's actual task.",
    'Format: "\uD83C\uDF10 \u4E2D\u8BD1\u82F1" header, corrections table (if any), English translations, vocab table, then separator and task response.'
].join(' ');
function scanPrompt(message) {
    if (!message || message.length < 4) return null;
    if (looksLikeNonProse(message)) return null;
    if (/^Use Skill:/i.test(message.trim())) return null;
    const enRatio = englishRatio(message);
    const cnRatio = chineseRatio(message);
    if (enRatio >= 0.6) return ENGLISH_BLOCK;
    if (cnRatio >= 0.3 || looksLikeChineseLearnIntent(message)) {
        if (/代码|编程|bug|修复|重构|编译|部署|配置文件/.test(message)) return null;
        if (message.length > 500) return null;
        return CHINESE_BLOCK;
    }
    return null;
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




function prompt_scan_scanPrompt(message, wikiRoot = WIKI_ROOT) {
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

;// CONCATENATED MODULE: ./src/prompt-optimizer/lib/events.ts



function dataRoot() {
    return envOr('LEARNWY_PROMPT_OPTIMIZER_ROOT', learnwyPath('prompt-optimizer'));
}
function eventsFile() {
    return external_node_path_namespaceObject.join(dataRoot(), 'events.jsonl');
}
const DATA_ROOT = dataRoot();
const EVENTS_FILE = eventsFile();
const MAX_EVENTS_BYTES = 5 * 1024 * 1024;
function appendEvent(event) {
    try {
        const root = dataRoot();
        const file = eventsFile();
        if (!external_node_fs_namespaceObject.existsSync(root)) external_node_fs_namespaceObject.mkdirSync(root, {
            recursive: true
        });
        let size = 0;
        try {
            size = external_node_fs_namespaceObject.statSync(file).size;
        } catch  {
        /* missing file — fine */ }
        if (size > MAX_EVENTS_BYTES) {
            try {
                external_node_fs_namespaceObject.renameSync(file, `${file}.1`);
            } catch  {
            /* swallow */ }
        }
        external_node_fs_namespaceObject.appendFileSync(file, `${JSON.stringify(event)}\n`);
    } catch  {
    /* never break the caller */ }
}
function readEvents(sinceMs) {
    const file = eventsFile();
    if (!fs.existsSync(file)) return [];
    const out = [];
    const cutoff = Date.now() - sinceMs;
    const raw = fs.readFileSync(file, 'utf8');
    for (const line of raw.split('\n')){
        if (!line) continue;
        try {
            const e = JSON.parse(line);
            if (Date.parse(e.ts) >= cutoff) out.push(e);
        } catch  {
        /* skip malformed line */ }
    }
    return out;
}

;// CONCATENATED MODULE: ./src/prompt-optimizer/lib/prompt-scan.ts


const EXPLICIT_TRIGGERS = [
    /\boptimi[sz]e\s+(my|this|the|that)?\s*prompt\b/i,
    /\bimprove\s+(my|this|the|that)?\s*prompt\b/i,
    /\breview\s+(my|this|the|that)?\s*prompt\b/i,
    /\brewrite\s+(my|this|the|that)?\s*prompt\b/i,
    /\bcheck\s+(my|this|the|that)?\s*prompt\b/i,
    /\brefine\s+(my|this|the|that)?\s*prompt\b/i,
    /\bmake\s+(this|the|my)\s+prompt\s+(more|better)\b/i,
    /\bis\s+this\s+prompt\s+good\b/i,
    /优化\s*(我的|这段|这个)?\s*提示词/,
    /改进\s*(我的|这段|这个)?\s*提示词/,
    /重写\s*(我的|这段|这个)?\s*提示词/,
    /帮我.*?(改|优化).*?prompt/i
];
const PROMPT_SHAPE_MARKERS = [
    /\byou are (a|an|the)\b/i,
    /\byour (task|job|role|goal) is\b/i,
    /\bact as (a|an|the)\b/i,
    /\bgenerate (a|an|the)\b/i,
    /\b(analyze|summarize|translate|classify)\b.*\b(the|this|following)\b/i,
    /\binstructions?\s*[:：]/i,
    /\bconstraints?\s*[:：]/i,
    /\brequirements?\s*[:：]/i,
    /\boutput format\s*[:：]/i
];
const looksLikeExplicitAsk = (text)=>EXPLICIT_TRIGGERS.some((re)=>re.test(text));
function looksLikeStructuredPrompt(text) {
    if (text.length < 400) return false;
    const lineCount = text.split('\n').length;
    if (lineCount < 4) return false;
    const matches = PROMPT_SHAPE_MARKERS.filter((re)=>re.test(text)).length;
    return matches >= 2;
}
function lib_prompt_scan_scanPrompt(message) {
    if (!message) return null;
    const trimmed = message.trim();
    if (looksLikeNonProse(message)) return null;
    const explicit = looksLikeExplicitAsk(trimmed);
    const structured = looksLikeStructuredPrompt(trimmed);
    if (!explicit && !structured) return null;
    const reason = explicit ? 'The user explicitly asked to optimize/improve a prompt.' : 'The user submitted a long, structured prompt-shaped instruction.';
    const shapeMarkers = PROMPT_SHAPE_MARKERS.filter((re)=>re.test(trimmed)).length;
    appendEvent({
        ts: new Date().toISOString(),
        trigger: explicit ? 'explicit' : 'structured',
        length: trimmed.length,
        lines: trimmed.split('\n').length,
        shape_markers: shapeMarkers,
        excerpt: trimmed.slice(0, 120).replace(/\s+/g, ' ')
    });
    return [
        '[prompt-optimizer hook]',
        reason,
        'Before executing, run a 7-dimension pre-flight analysis (Clarity, Specificity, Context, Structure, Examples, Constraints, Completeness),',
        'show the critique table + an Optimized Prompt block, then ask: "Use original / Use optimized / Edit manually?".',
        'Skip silently if the user is in mid-conversation and clearly does NOT want a review.'
    ].join(' ');
}

;// CONCATENATED MODULE: ./src/learnwy-dispatch/hooks/user-prompt-submit.ts




const SCANNERS = [
    {
        name: 'english-learner',
        scan: scanPrompt
    },
    {
        name: 'llm-wiki',
        scan: prompt_scan_scanPrompt
    },
    {
        name: 'prompt-optimizer',
        scan: lib_prompt_scan_scanPrompt
    }
];
async function main() {
    const payload = await readStdin();
    const message = payload.user_message || payload.prompt || '';
    if (!message) return;
    const blocks = [];
    for (const { scan } of SCANNERS){
        try {
            const out = scan(message);
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
