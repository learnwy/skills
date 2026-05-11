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
;// CONCATENATED MODULE: ./src/shared/template.ts
const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;
function render(template, mapping) {
    return template.replace(PLACEHOLDER_RE, (_, key)=>Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] : `{{${key}}}`);
}

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

;// CONCATENATED MODULE: external "node:os"
const external_node_os_namespaceObject = require("node:os");
;// CONCATENATED MODULE: ./src/shared/ide-markers.ts



const IDE_MARKER_DIRS = (/* unused pure expression or super */ null && ([
    '.trae',
    '.claude',
    '.cursor',
    '.windsurf'
]));
const AI_TYPE_MAP = (/* unused pure expression or super */ null && ({
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
}));
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
    const home = external_node_os_namespaceObject.homedir();
    return [
        '.trae',
        '.trae-cn',
        '.claude',
        '.cursor'
    ].map((d)=>external_node_path_namespaceObject.join(home, d));
}
function isInsideHomeIdeDir(absPath) {
    for (const d of homeIdeDirs()){
        if (absPath === d || absPath.startsWith(d + external_node_path_namespaceObject.sep)) return d;
    }
    return null;
}

;// CONCATENATED MODULE: ./src/project-skill-writer/cmd/init.ts





const STOP_WORDS = new Set([
    'a',
    'an',
    'the',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'being',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'shall',
    'should',
    'may',
    'might',
    'must',
    'can',
    'could',
    'need',
    'want',
    'keep',
    'doing',
    'thing',
    'stuff',
    'every',
    'time',
    'always',
    'never',
    'just',
    'really',
    'very',
    'much',
    'many',
    'some',
    'each',
    'also',
    'same',
    'like',
    'that',
    'this',
    'with',
    'from',
    'into',
    'about',
    'when',
    'where',
    'which',
    'what',
    'make',
    'made'
]);
const SKILL_TYPE_PATTERNS = [
    {
        keywords: [
            'write',
            'create',
            'generate',
            'boilerplate',
            'scaffold',
            'template'
        ],
        type: 'generator'
    },
    {
        keywords: [
            'check',
            'verify',
            'validate',
            'lint',
            'scan',
            'audit'
        ],
        type: 'validator'
    },
    {
        keywords: [
            'explain',
            'document',
            'describe',
            'summarize',
            'annotate'
        ],
        type: 'informer'
    },
    {
        keywords: [
            'follow',
            'step',
            'process',
            'deploy',
            'release',
            'pipeline',
            'workflow'
        ],
        type: 'workflow'
    },
    {
        keywords: [
            'fix',
            'refactor',
            'repair',
            'clean',
            'migrate',
            'upgrade'
        ],
        type: 'remediation'
    }
];
const TRIGGER_PREFIXES = {
    generator: [
        'create ',
        'generate ',
        'new '
    ],
    validator: [
        'validate ',
        'check ',
        'scan '
    ],
    informer: [
        'explain ',
        'document ',
        'describe '
    ],
    workflow: [
        'run ',
        'execute ',
        'start '
    ],
    remediation: [
        'fix ',
        'refactor ',
        'clean '
    ]
};
function extractKeywords(text, maxCount = 5) {
    const matches = text.toLowerCase().match(/[a-zA-Z]{4,}/g) || [];
    const seen = new Set();
    const result = [];
    for (const w of matches){
        if (!STOP_WORDS.has(w) && !seen.has(w)) {
            seen.add(w);
            result.push(w);
            if (result.length >= maxCount) break;
        }
    }
    return result;
}
function classifyProblem(text) {
    const lower = text.toLowerCase();
    const scores = {};
    for (const { keywords, type } of SKILL_TYPE_PATTERNS){
        const score = keywords.filter((kw)=>lower.includes(kw)).length;
        if (score > 0) scores[type] = score;
    }
    if (Object.keys(scores).length > 0) {
        return Object.entries(scores).reduce((a, b)=>b[1] > a[1] ? b : a)[0];
    }
    return 'workflow';
}
function slugify(words, maxParts = 3) {
    return words.slice(0, maxParts).join('-');
}
function inferFromProblem(problem) {
    const skillType = classifyProblem(problem);
    const keywords = extractKeywords(problem);
    const triggers = TRIGGER_PREFIXES[skillType] || [
        'do ',
        'run '
    ];
    const baseSlug = keywords.length > 0 ? slugify(keywords) : skillType;
    const name = baseSlug + '-' + skillType;
    const title = name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase());
    const triggerKws = keywords.slice(0, 3);
    return {
        SKILL_NAME: name,
        DESCRIPTION: 'Addresses: ' + problem.slice(0, 120),
        USE_CASES: problem.slice(0, 150),
        TRIGGER1: triggerKws.length > 0 ? triggerKws[0] : triggers[0].trim(),
        TRIGGER2: triggerKws.length > 1 ? triggerKws[1] : triggers.length > 1 ? triggers[1].trim() : 'automate',
        TRIGGER3: triggerKws.length > 2 ? triggerKws[2] : triggers.length > 2 ? triggers[2].trim() : 'reusable',
        EXCEPTIONS: 'unrelated one-off requests',
        SKILL_TITLE: title,
        BRIEF_INTRO: 'Skill to address: ' + problem,
        CONDITION_1: 'The task involves: ' + (keywords.length > 0 ? keywords[0] : 'repeated work'),
        CONDITION_2: 'The user needs consistent output format',
        CONDITION_3: 'The task benefits from structured steps',
        EXCEPTION_1: 'The task is unrelated to this domain',
        EXCEPTION_2: 'A different specialized skill is a better fit',
        STEP_1: 'Analyze input',
        STEP_2: 'Apply ' + skillType + ' logic',
        STEP_3: 'Execute steps',
        STEP_4: 'Verify output',
        COL1: 'Input',
        COL2: 'Action',
        COL3: 'Output',
        VAL1: 'User request',
        VAL2: 'Skill ' + skillType,
        VAL3: 'Structured result',
        ISSUE1: 'Missing input',
        SOLUTION1: 'Request required fields',
        ISSUE2: 'Unsupported scope',
        SOLUTION2: 'Explain supported boundaries',
        REF_1: 'Reference',
        REF_1_FILE: 'reference.md',
        REF_1_DESC: 'Domain notes',
        REF_2: 'Template',
        REF_2_FILE: 'template.md',
        REF_2_DESC: 'Output template'
    };
}
function defaults(skillName, summary) {
    const title = skillName.replace(/-/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase());
    return {
        SKILL_NAME: skillName,
        DESCRIPTION: summary || title + ' capability',
        USE_CASES: 'users need this workflow repeatedly',
        TRIGGER1: skillName + ' workflow',
        TRIGGER2: 'automate this process',
        TRIGGER3: 'make this reusable',
        EXCEPTIONS: 'unrelated one-off requests',
        SKILL_TITLE: title,
        BRIEF_INTRO: 'Provide a reusable workflow with clear inputs and outputs.',
        CONDITION_1: 'The task is repetitive and should be standardized.',
        CONDITION_2: 'The user needs consistent output format.',
        CONDITION_3: 'The task benefits from structured steps.',
        EXCEPTION_1: 'The task is unrelated to this domain.',
        EXCEPTION_2: 'A different specialized skill is a better fit.',
        STEP_1: 'Analyze input',
        STEP_2: 'Select workflow path',
        STEP_3: 'Execute steps',
        STEP_4: 'Verify output',
        COL1: 'Input',
        COL2: 'Action',
        COL3: 'Output',
        VAL1: 'User request',
        VAL2: 'Skill workflow',
        VAL3: 'Structured result',
        ISSUE1: 'Missing input',
        SOLUTION1: 'Request required fields',
        ISSUE2: 'Unsupported scope',
        SOLUTION2: 'Explain supported boundaries',
        REF_1: 'Reference',
        REF_1_FILE: 'reference.md',
        REF_1_DESC: 'Domain notes',
        REF_2: 'Template',
        REF_2_FILE: 'template.md',
        REF_2_DESC: 'Output template'
    };
}
function validateOutputPath(resolved) {
    const inside = isInsideHomeIdeDir(resolved);
    if (inside) {
        console.error('ERROR: Output path ' + resolved + ' is inside global directory ' + inside + '. Use a project-relative path.');
        process.exit(1);
    }
}
function init_showHelp() {
    console.log(`Usage: cli.cjs init --skill-dir <dir> [OPTIONS]

Initialize a skill from a problem description or name.

Options:
    --skill-dir DIR       Path to this skill's own directory (for loading template) (REQUIRED)
    --name NAME           Skill name (use --problem instead for auto-detection)
    --summary TEXT        Brief summary (used with --name)
    --problem TEXT        Problem description - auto-generate skill metadata
    --output-root DIR     Project-relative output root (default: .agents/skills)
    -h, --help            Show help`);
}
function run(args) {
    let skillDir = '';
    let name = '';
    let summary = '';
    let problem = '';
    let outputRoot = '.agents/skills';
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '--skill-dir':
                skillDir = args[++i];
                break;
            case '--name':
                name = args[++i];
                break;
            case '--summary':
                summary = args[++i];
                break;
            case '--problem':
                problem = args[++i];
                break;
            case '--output-root':
                outputRoot = args[++i];
                break;
            case '-h':
            case '--help':
                init_showHelp();
                process.exit(0);
        }
    }
    if (!skillDir) {
        console.error('Error: --skill-dir is required');
        init_showHelp();
        process.exit(1);
    }
    const writerSkillDir = external_node_path_namespaceObject.resolve(skillDir);
    const tplPath = external_node_path_namespaceObject.join(writerSkillDir, 'assets', 'skill.md.template');
    if (!external_node_fs_namespaceObject.existsSync(tplPath)) {
        console.error('ERROR: Template not found at ' + tplPath);
        process.exit(1);
    }
    const tpl = external_node_fs_namespaceObject.readFileSync(tplPath, 'utf8');
    let mapping;
    if (problem) {
        mapping = inferFromProblem(problem);
    } else if (name) {
        mapping = defaults(name, summary);
    } else {
        console.error('Error: Either --name or --problem is required');
        init_showHelp();
        process.exit(1);
    }
    const targetDir = external_node_path_namespaceObject.resolve(external_node_path_namespaceObject.join(outputRoot, mapping.SKILL_NAME));
    validateOutputPath(targetDir);
    ensureDir(targetDir);
    const outFile = external_node_path_namespaceObject.join(targetDir, 'SKILL.md');
    external_node_fs_namespaceObject.writeFileSync(outFile, render(tpl, mapping), 'utf8');
    console.log(outFile);
}
const command = {
    description: 'Initialize a SKILL.md from a problem description or name',
    run
};

;// CONCATENATED MODULE: ./src/project-skill-writer/cli.ts


dispatch({
    name: 'project-skill-writer',
    commands: {
        init: command
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
