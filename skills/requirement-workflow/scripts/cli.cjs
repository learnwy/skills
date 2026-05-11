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
    if (!external_node_fs_namespaceObject.existsSync(file)) return fallback;
    try {
        return JSON.parse(external_node_fs_namespaceObject.readFileSync(file, 'utf8'));
    } catch  {
        return fallback;
    }
}
function writeJson(file, value) {
    ensureDir(external_node_path_namespaceObject.dirname(file));
    external_node_fs_namespaceObject.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/phases.ts
const phases_LIFECYCLES = {
    lite: [
        'INIT',
        'IMPLEMENTING',
        'TESTING',
        'DONE'
    ],
    standard: [
        'INIT',
        'PLANNING',
        'IMPLEMENTING',
        'TESTING',
        'DONE'
    ],
    full: [
        'INIT',
        'DEFINING',
        'PLANNING',
        'DESIGNING',
        'IMPLEMENTING',
        'TESTING',
        'DELIVERING',
        'DONE'
    ]
};
const PHASES = {
    INIT: {
        phase: 'INIT',
        purpose: 'Workflow scaffolded; no artifacts yet.',
        inputs: [],
        outputs: [
            'state.json'
        ],
        defaultAgent: null,
        optionalAgents: [],
        briefSections: [],
        checkpoint: 'never',
        hint: 'Run `cli.cjs advance` to enter the first working phase.'
    },
    DEFINING: {
        phase: 'DEFINING',
        purpose: 'Translate the raw request into a structured spec with EARS acceptance criteria.',
        inputs: [],
        outputs: [
            'spec.md'
        ],
        defaultAgent: 'problem-definer',
        optionalAgents: [
            'iron-audit-pm',
            'risk-auditor',
            'spec-by-example'
        ],
        briefSections: [
            'user-request',
            'similar-past-specs',
            'glossary',
            'risk-keywords'
        ],
        checkpoint: 'always',
        hint: "Edit spec.md so it has scope, \u22653 EARS criteria, and explicit out-of-scope."
    },
    PLANNING: {
        phase: 'PLANNING',
        purpose: 'Decompose spec (or request) into atomic, traceable tasks.',
        inputs: [
            'spec.md'
        ],
        outputs: [
            'tasks.md'
        ],
        defaultAgent: 'story-mapper',
        optionalAgents: [
            'mvp-freeze-architect'
        ],
        briefSections: [
            'spec-summary',
            'code-map',
            'capacity-hint'
        ],
        checkpoint: 'never',
        hint: "Edit tasks.md: every AC maps to \u22651 task; each task touches \u22645 files."
    },
    DESIGNING: {
        phase: 'DESIGNING',
        purpose: 'Lock cross-cutting decisions (data flow, contracts, NFRs) before code.',
        inputs: [
            'spec.md',
            'tasks.md'
        ],
        outputs: [
            'design.md'
        ],
        defaultAgent: 'architecture-advisor',
        optionalAgents: [
            'domain-modeler',
            'responsibility-modeler'
        ],
        briefSections: [
            'spec',
            'tasks',
            'arch-snapshot',
            'nfrs',
            'conventions'
        ],
        checkpoint: 'always',
        hint: 'Edit design.md: components, data flow, API contracts, key trade-offs.'
    },
    IMPLEMENTING: {
        phase: 'IMPLEMENTING',
        purpose: "Execute tasks one by one; each commit traces to a task \u2192 AC.",
        inputs: [
            'tasks.md'
        ],
        outputs: [
            'code',
            'traceability.md'
        ],
        defaultAgent: 'tdd-coach',
        optionalAgents: [
            'refactoring-guide',
            'legacy-surgeon'
        ],
        briefSections: [
            'current-task',
            'touched-files',
            'conventions',
            'test-fixtures'
        ],
        checkpoint: 'never',
        hint: 'Pick next unchecked task in tasks.md; implement; mark `[x]`; rebuild traceability.'
    },
    TESTING: {
        phase: 'TESTING',
        purpose: 'Validate every AC; checklist.md must be fully checked.',
        inputs: [
            'tasks.md',
            'spec.md'
        ],
        outputs: [
            'checklist.md'
        ],
        defaultAgent: 'test-strategist',
        optionalAgents: [
            'test-strategy-advisor',
            'code-reviewer',
            'error-analyzer'
        ],
        briefSections: [
            'changed-files',
            'ac-list',
            'test-patterns'
        ],
        checkpoint: 'always',
        hint: 'Run lint, typecheck, tests; check off checklist.md items as they pass.'
    },
    DELIVERING: {
        phase: 'DELIVERING',
        purpose: 'Final review against the original spec; ready to ship.',
        inputs: [
            'spec.md',
            'tasks.md',
            'checklist.md',
            'traceability.md'
        ],
        outputs: [
            'summary.md'
        ],
        defaultAgent: 'tech-design-reviewer',
        optionalAgents: [
            'code-reviewer'
        ],
        briefSections: [
            'original-spec',
            'change-summary',
            'open-issues'
        ],
        checkpoint: 'always',
        hint: 'Generate summary.md; confirm every AC is verified.'
    },
    DONE: {
        phase: 'DONE',
        purpose: 'Workflow complete.',
        inputs: [],
        outputs: [],
        defaultAgent: null,
        optionalAgents: [],
        briefSections: [],
        checkpoint: 'never',
        hint: 'Workflow finished. Archive artifacts or start a new one.'
    }
};
function nextPhase(lifecycle, current) {
    const order = phases_LIFECYCLES[lifecycle];
    const idx = order.indexOf(current);
    if (idx === -1 || idx >= order.length - 1) return null;
    return order[idx + 1];
}
function priorPhase(lifecycle, current) {
    const order = phases_LIFECYCLES[lifecycle];
    const idx = order.indexOf(current);
    if (idx <= 0) return null;
    return order[idx - 1];
}
function isValidLifecycle(value) {
    return value === 'lite' || value === 'standard' || value === 'full';
}
function isPhaseInLifecycle(lifecycle, phase) {
    return phases_LIFECYCLES[lifecycle].includes(phase);
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/state.ts




const SCHEMA_VERSION = 5;
function workflowBase(projectRoot) {
    return external_node_path_namespaceObject.join(projectRoot, '.agents', 'workflow');
}
function activePointerFile(projectRoot) {
    return external_node_path_namespaceObject.join(projectRoot, '.agents', 'active_workflow');
}
function legacyWorkflowBase(projectRoot) {
    return external_node_path_namespaceObject.join(projectRoot, '.trae', 'workflow');
}
function legacyActivePointerFile(projectRoot) {
    return external_node_path_namespaceObject.join(projectRoot, '.trae', 'active_workflow');
}
function migrateLegacyTraeLayout(projectRoot) {
    const notes = [];
    const legacyBase = legacyWorkflowBase(projectRoot);
    const legacyPointer = legacyActivePointerFile(projectRoot);
    const newBase = workflowBase(projectRoot);
    const newPointer = activePointerFile(projectRoot);
    let migrated = false;
    if (external_node_fs_namespaceObject.existsSync(legacyBase) && !external_node_fs_namespaceObject.existsSync(newBase)) {
        ensureDir(external_node_path_namespaceObject.dirname(newBase));
        external_node_fs_namespaceObject.renameSync(legacyBase, newBase);
        notes.push(`moved ${external_node_path_namespaceObject.relative(projectRoot, legacyBase)} \u{2192} ${external_node_path_namespaceObject.relative(projectRoot, newBase)}`);
        migrated = true;
    }
    if (external_node_fs_namespaceObject.existsSync(legacyPointer) && !external_node_fs_namespaceObject.existsSync(newPointer)) {
        const contents = external_node_fs_namespaceObject.readFileSync(legacyPointer, 'utf8').trim();
        const remapped = contents.replace(legacyBase + external_node_path_namespaceObject.sep, newBase + external_node_path_namespaceObject.sep);
        ensureDir(external_node_path_namespaceObject.dirname(newPointer));
        external_node_fs_namespaceObject.writeFileSync(newPointer, remapped);
        external_node_fs_namespaceObject.unlinkSync(legacyPointer);
        notes.push(`moved ${external_node_path_namespaceObject.relative(projectRoot, legacyPointer)} \u{2192} ${external_node_path_namespaceObject.relative(projectRoot, newPointer)}`);
        migrated = true;
    } else if (external_node_fs_namespaceObject.existsSync(newPointer)) {
        const contents = external_node_fs_namespaceObject.readFileSync(newPointer, 'utf8').trim();
        if (contents.includes(legacyBase + external_node_path_namespaceObject.sep)) {
            const remapped = contents.replace(legacyBase + external_node_path_namespaceObject.sep, newBase + external_node_path_namespaceObject.sep);
            external_node_fs_namespaceObject.writeFileSync(newPointer, remapped);
            notes.push(`updated active_workflow pointer to .agents/ path`);
            migrated = true;
        }
    }
    if (migrated) {
        console.error(`[requirement-workflow] migrated legacy .trae/ layout \u{2192} .agents/: ${notes.join(', ')}`);
    }
    return {
        migrated,
        notes
    };
}
function stateFile(workflowDir) {
    return external_node_path_namespaceObject.join(workflowDir, 'state.json');
}
function newId(projectRoot, name) {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'workflow';
    const base = workflowBase(projectRoot);
    let maxSeq = 0;
    if (external_node_fs_namespaceObject.existsSync(base)) {
        for (const dir of external_node_fs_namespaceObject.readdirSync(base)){
            if (!dir.startsWith(dateStr + '_')) continue;
            const parts = dir.split('_');
            const seq = Number.parseInt(parts[1], 10);
            if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
        }
    }
    const seq = String(maxSeq + 1).padStart(3, '0');
    return `${dateStr}_${seq}_${safeName}`;
}
function createState(opts) {
    const id = newId(opts.projectRoot, opts.name);
    const workflowDir = external_node_path_namespaceObject.join(workflowBase(opts.projectRoot), id);
    const ts = nowIso();
    return {
        schemaVersion: SCHEMA_VERSION,
        id,
        name: opts.name,
        description: opts.description,
        lifecycle: opts.lifecycle,
        phase: 'INIT',
        projectRoot: opts.projectRoot,
        workflowDir,
        createdAt: ts,
        updatedAt: ts,
        tags: opts.tags,
        history: [
            {
                ts,
                event: 'init',
                to: 'INIT'
            }
        ],
        briefs: {}
    };
}
function loadState(workflowDir) {
    const file = stateFile(workflowDir);
    if (!external_node_fs_namespaceObject.existsSync(file)) return null;
    const data = readJsonSafe(file, null);
    if (!data || data.schemaVersion !== SCHEMA_VERSION) return null;
    return data;
}
function saveState(state) {
    state.updatedAt = nowIso();
    writeJson(stateFile(state.workflowDir), state);
}
function setActiveWorkflow(projectRoot, workflowDir) {
    const file = activePointerFile(projectRoot);
    ensureDir(external_node_path_namespaceObject.dirname(file));
    external_node_fs_namespaceObject.writeFileSync(file, workflowDir);
}
function getActiveWorkflowDir(projectRoot) {
    migrateLegacyTraeLayout(projectRoot);
    const file = activePointerFile(projectRoot);
    if (!external_node_fs_namespaceObject.existsSync(file)) return null;
    const dir = external_node_fs_namespaceObject.readFileSync(file, 'utf8').trim();
    if (!dir || !external_node_fs_namespaceObject.existsSync(dir)) return null;
    return dir;
}
function appendHistory(state, entry) {
    state.history.push({
        ts: nowIso(),
        ...entry
    });
}
function escalateLifecycle(state, target, reason) {
    if (!isValidLifecycle(target)) throw new Error(`Invalid lifecycle: ${target}`);
    const rank = {
        lite: 0,
        standard: 1,
        full: 2
    };
    if (rank[target] <= rank[state.lifecycle]) {
        return {
            changed: false,
            from: state.lifecycle
        };
    }
    const from = state.lifecycle;
    state.lifecycle = target;
    appendHistory(state, {
        event: 'escalate',
        reason,
        from: state.phase,
        to: state.phase
    });
    return {
        changed: true,
        from
    };
}
function lifecyclePhases(lifecycle) {
    return LIFECYCLES[lifecycle];
}
function recordGate(state, result) {
    state.lastGate = result;
    appendHistory(state, {
        event: result.ok ? 'gate-pass' : 'gate-fail',
        to: result.phase,
        reason: result.ok ? undefined : result.failures.join('; ')
    });
}

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/init.ts





function init_showHelp() {
    console.log(`Usage: cli.cjs init -r <root> -n <name> [OPTIONS]

Initialize a requirement workflow at the smallest viable lifecycle.

Options:
    -r, --root DIR        Project root (REQUIRED)
    -n, --name NAME       Requirement name (REQUIRED)
    -d, --desc DESC       One-line description
    -l, --lifecycle KIND  lite | standard | full (default: lite)
    --tags TAGS           Comma-separated tags
    -h, --help            Show help

The default lifecycle is "lite" (INIT \u{2192} IMPLEMENTING \u{2192} TESTING \u{2192} DONE).
Escalate later with: cli.cjs escalate --to standard|full --reason "..."
`);
}
const SPEC_TEMPLATE_FULL = `# {{NAME}}

## Background
{{DESC}}

## Scope
- In:
- Out:

## Acceptance Criteria
- [ ] When <trigger>, the system shall <response>
- [ ] While <state>, the system shall <behavior>
- [ ] Where <constraint>, the system shall <limit>

## Constraints
-

## Out of Scope
-
`;
const TASKS_TEMPLATE = `# Tasks

## Phase 1: Foundation
- [ ] 1.1: <description> [files: ]

## Phase 2: Core
- [ ] 2.1: <description> [files: ]

## Phase 3: Polish
- [ ] 3.1: <description> [files: ]
`;
const CHECKLIST_TEMPLATE = `# Checklist

## Code Quality
- [ ] Implementation complete
- [ ] Lint clean
- [ ] Type check pass

## Tests
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)

## Acceptance Criteria
- [ ] All ACs verified

## Review
- [ ] Self-review complete
- [ ] No TODO/FIXME left unresolved
`;
function fillTemplate(tpl, vars) {
    return tpl.replace(/\{\{(\w+)\}\}/g, (_, k)=>vars[k] ?? '');
}
function run(args) {
    let projectRoot = '';
    let name = '';
    let desc = '';
    let lifecycle = 'lite';
    let tags = '';
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-n':
            case '--name':
                name = args[++i];
                break;
            case '-d':
            case '--desc':
                desc = args[++i];
                break;
            case '-l':
            case '--lifecycle':
                {
                    const v = args[++i];
                    if (!isValidLifecycle(v)) {
                        console.error(`Error: --lifecycle must be lite | standard | full (got: ${v})`);
                        process.exit(1);
                    }
                    lifecycle = v;
                    break;
                }
            case '--tags':
                tags = args[++i];
                break;
            case '-h':
            case '--help':
                init_showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot || !name) {
        console.error('Error: --root and --name are required.');
        init_showHelp();
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!external_node_fs_namespaceObject.existsSync(projectRoot)) {
        console.error(`Error: Directory not found: ${projectRoot}`);
        process.exit(1);
    }
    migrateLegacyTraeLayout(projectRoot);
    ensureDir(workflowBase(projectRoot));
    const state = createState({
        projectRoot,
        name,
        description: desc,
        lifecycle,
        tags: tags ? tags.split(',').map((s)=>s.trim()).filter(Boolean) : []
    });
    ensureDir(state.workflowDir);
    ensureDir(external_node_path_namespaceObject.join(state.workflowDir, 'briefs'));
    if (lifecycle === 'full') {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'), fillTemplate(SPEC_TEMPLATE_FULL, {
            NAME: name,
            DESC: desc || '<problem statement>'
        }));
    }
    external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(state.workflowDir, 'tasks.md'), TASKS_TEMPLATE);
    external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(state.workflowDir, 'checklist.md'), CHECKLIST_TEMPLATE);
    saveState(state);
    setActiveWorkflow(projectRoot, state.workflowDir);
    console.log("\u2705 Workflow initialized");
    console.log(`ID:        ${state.id}`);
    console.log(`Lifecycle: ${lifecycle}`);
    console.log(`Dir:       ${state.workflowDir}`);
    console.log('');
    console.log('Next: node scripts/cli.cjs advance -r .');
}
const command = {
    description: 'Initialize a requirement workflow (default: lite lifecycle)',
    run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/markdown.ts

const EARS_RE = /^\s*[-*]\s*\[(?<state>[ xX])\]\s*(?<text>(When|While|Where|If)\b.+)$/;
const TASK_RE = /^\s*[-*]\s*\[(?<state>[ xX])\]\s*(?<rest>.+)$/;
const FILES_RE = /\[files?:\s*([^\]]+)\]/i;
const TASK_ID_RE = /^(Task\s+)?(\d+(?:\.\d+)+|[A-Z]+-\d+)\s*[:\-]\s*/i;
const SECTION_RE = /^##+\s+(.+?)\s*$/;
function readFileOrEmpty(file) {
    if (!external_node_fs_namespaceObject.existsSync(file)) return '';
    return external_node_fs_namespaceObject.readFileSync(file, 'utf8');
}
function extractAcceptanceCriteria(specMarkdown) {
    const lines = specMarkdown.split(/\r?\n/);
    const acs = [];
    let inAcSection = false;
    let counter = 0;
    for (const raw of lines){
        const sec = raw.match(SECTION_RE);
        if (sec) {
            inAcSection = /acceptance criteria/i.test(sec[1]) || /验收标准/.test(sec[1]);
            continue;
        }
        if (!inAcSection) continue;
        const m = raw.match(EARS_RE);
        if (!m || !m.groups) continue;
        counter += 1;
        acs.push({
            id: `AC-${String(counter).padStart(2, '0')}`,
            text: m.groups.text.trim(),
            checked: m.groups.state.toLowerCase() === 'x'
        });
    }
    return acs;
}
function extractTasks(tasksMarkdown) {
    const lines = tasksMarkdown.split(/\r?\n/);
    const tasks = [];
    let currentPhase;
    let auto = 0;
    for (const raw of lines){
        const sec = raw.match(SECTION_RE);
        if (sec) {
            currentPhase = sec[1].trim();
            continue;
        }
        const m = raw.match(TASK_RE);
        if (!m || !m.groups) continue;
        if (currentPhase && /verification|review|done/i.test(currentPhase)) continue;
        let rest = m.groups.rest.trim();
        let files = [];
        const fm = rest.match(FILES_RE);
        if (fm) {
            files = fm[1].split(',').map((s)=>s.trim()).filter(Boolean);
            rest = rest.replace(FILES_RE, '').trim();
        }
        let id;
        const idMatch = rest.match(TASK_ID_RE);
        if (idMatch) {
            id = idMatch[2];
            rest = rest.slice(idMatch[0].length).trim();
        } else {
            auto += 1;
            id = `T-${String(auto).padStart(2, '0')}`;
        }
        tasks.push({
            id,
            title: rest,
            files,
            checked: m.groups.state.toLowerCase() === 'x',
            phase: currentPhase
        });
    }
    return tasks;
}
function summarizeSpec(specMarkdown) {
    const lines = specMarkdown.split(/\r?\n/);
    let section = null;
    const buckets = {};
    for (const raw of lines){
        const sec = raw.match(SECTION_RE);
        if (sec) {
            section = sec[1].toLowerCase();
            buckets[section] = [];
            continue;
        }
        if (!section) continue;
        if (raw.trim()) buckets[section].push(raw);
    }
    const pickList = (key)=>{
        const lines = buckets[key] || [];
        return lines.map((l)=>l.replace(/^\s*[-*]\s*/, '').trim()).filter((l)=>l && !/^[-*]?\s*$/.test(l));
    };
    return {
        background: (buckets['background'] || buckets["\u80CC\u666F"] || []).join('\n').trim(),
        scopeIn: pickList('scope').filter((l)=>/^in[:\-]/i.test(l)).map((l)=>l.replace(/^in[:\-]\s*/i, '')),
        scopeOut: pickList('scope').filter((l)=>/^out[:\-]/i.test(l)).map((l)=>l.replace(/^out[:\-]\s*/i, ''))
    };
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/defining.ts



const RISK_KEYWORDS = [
    'auth',
    'authentication',
    'authorize',
    'oauth',
    'jwt',
    'session',
    'token',
    'login',
    'signin',
    'signup',
    'password',
    'payment',
    'charge',
    'invoice',
    'refund',
    'stripe',
    'billing',
    'crypto',
    'encrypt',
    'decrypt',
    'hash',
    'signature',
    'pii',
    'personal',
    'gdpr',
    'hipaa',
    'admin',
    'permission',
    'role',
    'rbac',
    'sql',
    'injection',
    'xss',
    'csrf',
    'migration',
    'schema',
    'drop table'
];
function detectRiskKeywords(text) {
    const lower = text.toLowerCase();
    const hits = new Set();
    for (const kw of RISK_KEYWORDS){
        if (lower.includes(kw)) hits.add(kw);
    }
    return [
        ...hits
    ];
}
function generateDefiningBrief(state) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'));
    const risks = detectRiskKeywords(`${state.name} ${state.description}`);
    const lines = [];
    lines.push('# Brief: DEFINING');
    lines.push('');
    lines.push(`**Workflow:** ${state.id}  \u{2022}  **Lifecycle:** ${state.lifecycle}`);
    lines.push('');
    lines.push('## Goal');
    lines.push(PHASES.DEFINING.purpose);
    lines.push('');
    lines.push('## User Request');
    lines.push(`> ${state.name}`);
    if (state.description) {
        lines.push('');
        for (const para of state.description.split(/\n+/))lines.push(`> ${para}`);
    }
    lines.push('');
    if (risks.length) {
        lines.push("## \u26A0\uFE0F Risk Keywords Detected");
        lines.push('');
        lines.push(`Words found in the request that flag elevated risk: \`${risks.join('`, `')}\``);
        lines.push('');
        lines.push('Treat AC reviews as mandatory checkpoints; consider running `risk-auditor` (optional agent).');
        lines.push('');
    }
    lines.push('## What to Produce');
    lines.push('');
    lines.push('Edit `spec.md` so that it contains:');
    lines.push('');
    lines.push("1. **Background** \u2014 one short paragraph: the problem, not the solution.");
    lines.push("2. **Scope** \u2014 `In:` and `Out:` bullet lists.");
    lines.push("3. **Acceptance Criteria** \u2014 at least 3 in EARS format:");
    lines.push('   - `When <trigger>, the system shall <response>`');
    lines.push('   - `While <state>, the system shall <behavior>`');
    lines.push('   - `Where <constraint>, the system shall <limit>`');
    lines.push("4. **Constraints** \u2014 performance, security, compatibility.");
    lines.push("5. **Out of Scope** \u2014 what we explicitly will not do.");
    lines.push('');
    lines.push('## Gate Criteria');
    lines.push('');
    lines.push('`cli.cjs advance` will block until:');
    lines.push("- spec.md has \u22653 EARS-format acceptance criteria.");
    lines.push('- Background section is non-empty.');
    lines.push('- Out-of-Scope section is non-empty (write "None" if truly nothing).');
    lines.push('');
    lines.push('## Default Agent');
    lines.push('');
    lines.push(`Run \`${PHASES.DEFINING.defaultAgent}\` first; escalate to \`${PHASES.DEFINING.optionalAgents.join('`, `')}\` if needed.`);
    lines.push('');
    if (spec.trim()) {
        lines.push('## Current spec.md');
        lines.push('');
        lines.push('```markdown');
        lines.push(spec);
        lines.push('```');
    }
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/planning.ts




function topLevelDirs(projectRoot) {
    if (!external_node_fs_namespaceObject.existsSync(projectRoot)) return [];
    const skip = new Set([
        'node_modules',
        '.git',
        'dist',
        '.next',
        '.cache',
        'coverage',
        '.turbo',
        '.trae',
        '.claude'
    ]);
    return external_node_fs_namespaceObject.readdirSync(projectRoot).filter((entry)=>{
        if (skip.has(entry)) return false;
        if (entry.startsWith('.')) return false;
        try {
            return external_node_fs_namespaceObject.statSync(external_node_path_namespaceObject.join(projectRoot, entry)).isDirectory();
        } catch  {
            return false;
        }
    }).slice(0, 12);
}
function generatePlanningBrief(state) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'));
    const acs = extractAcceptanceCriteria(spec);
    const summary = summarizeSpec(spec);
    const dirs = topLevelDirs(state.projectRoot);
    const lines = [];
    lines.push('# Brief: PLANNING');
    lines.push('');
    lines.push(`**Workflow:** ${state.id}  \u{2022}  **Lifecycle:** ${state.lifecycle}`);
    lines.push('');
    lines.push('## Goal');
    lines.push(PHASES.PLANNING.purpose);
    lines.push('');
    lines.push('## Spec Summary');
    if (summary.background) {
        lines.push('');
        lines.push('**Background:** ' + summary.background.split(/\n/).slice(0, 4).join(' '));
    }
    if (summary.scopeIn.length) {
        lines.push('');
        lines.push('**In scope:**');
        for (const item of summary.scopeIn.slice(0, 8))lines.push(`- ${item}`);
    }
    if (summary.scopeOut.length) {
        lines.push('');
        lines.push('**Out of scope:**');
        for (const item of summary.scopeOut.slice(0, 8))lines.push(`- ${item}`);
    }
    lines.push('');
    lines.push('## Acceptance Criteria to Cover');
    lines.push('');
    if (acs.length === 0) {
        lines.push('_No EARS-format acceptance criteria found in spec.md. Go back to DEFINING._');
    } else {
        for (const ac of acs)lines.push(`- **${ac.id}** \u{2014} ${ac.text}`);
    }
    lines.push('');
    lines.push('## Code Map (top-level directories)');
    lines.push('');
    for (const dir of dirs)lines.push(`- \`${dir}/\``);
    if (dirs.length === 0) lines.push('_(none discovered)_');
    lines.push('');
    lines.push('## What to Produce');
    lines.push('');
    lines.push('Edit `tasks.md` so that:');
    lines.push("1. Tasks are grouped under `## Phase 1`, `## Phase 2`, \u2026 sections.");
    lines.push('2. Each task is `- [ ] <id>: <title> [files: a, b]`.');
    lines.push('3. Every AC above maps to **at least one** task. Use IDs like `1.1`, `1.2`, `2.1`.');
    lines.push('4. No task touches more than 5 files (split if it does).');
    lines.push('');
    lines.push('## Gate Criteria');
    lines.push('');
    lines.push("- Every AC in spec.md is referenced by \u22651 task in `traceability.md`.");
    lines.push('- No task lists more than 5 files.');
    lines.push("- \u22651 task with non-empty `files:` annotation.");
    lines.push('');
    lines.push('## Default Agent');
    lines.push('');
    lines.push(`Run \`${PHASES.PLANNING.defaultAgent}\`. Optional: \`${PHASES.PLANNING.optionalAgents.join('`, `')}\`.`);
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/designing.ts




function detectConventions(projectRoot) {
    const hits = [];
    const probe = (file, label)=>{
        if (external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(projectRoot, file))) hits.push(`${label} (\`${file}\`)`);
    };
    probe('package.json', 'Node project');
    probe('pnpm-lock.yaml', 'pnpm');
    probe('tsconfig.json', 'TypeScript');
    probe('biome.json', 'Biome');
    probe('.eslintrc.json', 'ESLint');
    probe('.eslintrc.cjs', 'ESLint');
    probe('vitest.config.ts', 'Vitest');
    probe('rstest.config.ts', 'rstest');
    probe('jest.config.js', 'Jest');
    probe('Cargo.toml', 'Rust');
    probe('go.mod', 'Go');
    probe('pyproject.toml', 'Python (pyproject)');
    return hits;
}
function generateDesigningBrief(state) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'));
    const tasksMd = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'tasks.md'));
    const acs = extractAcceptanceCriteria(spec);
    const tasks = extractTasks(tasksMd);
    const conventions = detectConventions(state.projectRoot);
    const lines = [];
    lines.push('# Brief: DESIGNING');
    lines.push('');
    lines.push(`**Workflow:** ${state.id}  \u{2022}  **Lifecycle:** ${state.lifecycle}`);
    lines.push('');
    lines.push('## Goal');
    lines.push(PHASES.DESIGNING.purpose);
    lines.push('');
    lines.push('## Acceptance Criteria');
    lines.push('');
    for (const ac of acs)lines.push(`- **${ac.id}** \u{2014} ${ac.text}`);
    if (acs.length === 0) lines.push("_None \u2014 go back to DEFINING._");
    lines.push('');
    lines.push('## Tasks Already Planned');
    lines.push('');
    if (tasks.length === 0) lines.push("_None \u2014 go back to PLANNING._");
    for (const t of tasks.slice(0, 20)){
        const files = t.files.length ? ` _(${t.files.join(', ')})_` : '';
        lines.push(`- ${t.id}: ${t.title}${files}`);
    }
    if (tasks.length > 20) lines.push(`- \u{2026} ${tasks.length - 20} more`);
    lines.push('');
    if (conventions.length) {
        lines.push('## Project Conventions Detected');
        lines.push('');
        for (const c of conventions)lines.push(`- ${c}`);
        lines.push('');
    }
    lines.push('## What to Produce');
    lines.push('');
    lines.push('Edit `design.md` covering:');
    lines.push("1. **Components** \u2014 modules, their responsibilities, owners.");
    lines.push("2. **Data flow** \u2014 how information moves between components.");
    lines.push("3. **API contracts** \u2014 request/response shapes for new endpoints.");
    lines.push("4. **Key trade-offs** \u2014 at least 2, with the option not chosen and why.");
    lines.push("5. **Non-functional requirements** \u2014 perf budgets, error handling, observability.");
    lines.push('');
    lines.push('## Gate Criteria');
    lines.push('');
    lines.push('- design.md exists with all five sections above non-empty.');
    lines.push('- design.md mentions every component named in tasks.md `files:` annotations.');
    lines.push('');
    lines.push('## Default Agent');
    lines.push('');
    lines.push(`Run \`${PHASES.DESIGNING.defaultAgent}\`. Optional: \`${PHASES.DESIGNING.optionalAgents.join('`, `')}\`.`);
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/implementing.ts



function pickTask(tasks, requestedId) {
    if (requestedId) {
        const exact = tasks.find((t)=>t.id === requestedId);
        if (exact) return exact;
    }
    const next = tasks.find((t)=>!t.checked);
    return next ?? null;
}
function generateImplementingBrief(state, taskId) {
    const tasksMd = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'tasks.md'));
    const allTasks = extractTasks(tasksMd);
    const task = pickTask(allTasks, taskId);
    const lines = [];
    lines.push('# Brief: IMPLEMENTING');
    lines.push('');
    lines.push(`**Workflow:** ${state.id}  \u{2022}  **Lifecycle:** ${state.lifecycle}`);
    lines.push('');
    if (!task) {
        lines.push('## No tasks to implement');
        lines.push('');
        lines.push('Either tasks.md is empty (go back to PLANNING) or every task is already checked off.');
        lines.push('Run `cli.cjs advance` to move to TESTING.');
        return lines.join('\n');
    }
    lines.push('## Current Task');
    lines.push('');
    lines.push(`- **ID:** ${task.id}`);
    lines.push(`- **Title:** ${task.title}`);
    if (task.phase) lines.push(`- **Phase block:** ${task.phase}`);
    if (task.files.length) {
        lines.push(`- **Files to touch:** ${task.files.map((f)=>`\`${f}\``).join(', ')}`);
    } else {
        lines.push("- **Files:** _not annotated \u2014 list them in tasks.md before starting._");
    }
    lines.push('');
    lines.push('## Constraint');
    lines.push('');
    lines.push('Implement **only** this task. Other unchecked tasks are out of scope for this brief.');
    lines.push('When complete:');
    lines.push('1. Mark this task `[x]` in tasks.md.');
    lines.push('2. Run `node scripts/cli.cjs trace` to refresh the traceability matrix.');
    lines.push('3. Pick the next unchecked task and regenerate this brief: `cli.cjs brief --regen`.');
    lines.push('');
    lines.push('## Suggested Reading Before You Start');
    lines.push('');
    if (task.files.length) {
        lines.push('Read these files first to align with existing patterns:');
        for (const f of task.files)lines.push(`- \`${f}\``);
    } else {
        lines.push("Annotate this task with `[files: \u2026]` in tasks.md, then regenerate this brief.");
    }
    lines.push('');
    lines.push('## Gate Criteria (when leaving IMPLEMENTING)');
    lines.push('');
    lines.push('- Every task in tasks.md is checked `[x]`.');
    lines.push('- traceability.md has no entries marked `(unmapped)`.');
    lines.push('');
    lines.push('## Remaining Tasks');
    lines.push('');
    for (const t of allTasks){
        const mark = t.checked ? '[x]' : '[ ]';
        lines.push(`- ${mark} ${t.id}: ${t.title}`);
    }
    lines.push('');
    lines.push('## Default Agent');
    lines.push('');
    lines.push(`Run \`${PHASES.IMPLEMENTING.defaultAgent}\` for TDD-discipline tasks. Optional: \`${PHASES.IMPLEMENTING.optionalAgents.join('`, `')}\`.`);
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/testing.ts




function detectTestRunner(projectRoot) {
    const exists = (p)=>external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(projectRoot, p));
    if (exists('rstest.config.ts')) return 'pnpm test';
    if (exists('vitest.config.ts')) return 'pnpm vitest run';
    if (exists('jest.config.js') || exists('jest.config.ts')) return 'pnpm jest';
    if (exists('Cargo.toml')) return 'cargo test';
    if (exists('go.mod')) return 'go test ./...';
    if (exists('pyproject.toml')) return 'pytest';
    return "(no recognised test runner \u2014 set the project standard)";
}
function detectLinter(projectRoot) {
    const exists = (p)=>external_node_fs_namespaceObject.existsSync(external_node_path_namespaceObject.join(projectRoot, p));
    if (exists('biome.json')) return 'pnpm biome check .';
    if (exists('.eslintrc.json') || exists('.eslintrc.cjs')) return 'pnpm eslint .';
    if (exists('Cargo.toml')) return 'cargo clippy';
    if (exists('pyproject.toml')) return 'ruff check .';
    return '(no linter detected)';
}
function generateTestingBrief(state) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'));
    const tasksMd = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'tasks.md'));
    const acs = extractAcceptanceCriteria(spec);
    const tasks = extractTasks(tasksMd);
    const changed = new Set();
    for (const t of tasks)for (const f of t.files)changed.add(f);
    const lines = [];
    lines.push('# Brief: TESTING');
    lines.push('');
    lines.push(`**Workflow:** ${state.id}  \u{2022}  **Lifecycle:** ${state.lifecycle}`);
    lines.push('');
    lines.push('## Goal');
    lines.push(PHASES.TESTING.purpose);
    lines.push('');
    lines.push('## Files Touched in this Workflow');
    lines.push('');
    if (changed.size === 0) {
        lines.push('_No files annotated in tasks.md._');
    } else {
        for (const f of [
            ...changed
        ].sort())lines.push(`- \`${f}\``);
    }
    lines.push('');
    lines.push('## Acceptance Criteria to Verify');
    lines.push('');
    if (acs.length === 0) {
        lines.push('_No spec.md (lite lifecycle). Verify against the user request directly._');
    } else {
        for (const ac of acs)lines.push(`- ${ac.checked ? "\u2713" : "\xb7"} **${ac.id}** \u{2014} ${ac.text}`);
    }
    lines.push('');
    lines.push('## Suggested Commands');
    lines.push('');
    lines.push(`- Lint: \`${detectLinter(state.projectRoot)}\``);
    lines.push(`- Tests: \`${detectTestRunner(state.projectRoot)}\``);
    lines.push('');
    lines.push('## What to Produce');
    lines.push('');
    lines.push('Update `checklist.md`:');
    lines.push('1. Tick `Implementation complete` once every task in tasks.md is `[x]`.');
    lines.push('2. Tick `Lint clean` after the lint command passes.');
    lines.push('3. Tick `Type check pass` after `pnpm tsc --noEmit` (or equivalent).');
    lines.push('4. Tick each AC line under `## Acceptance Criteria` after manual or automated verification.');
    lines.push('');
    lines.push('## Gate Criteria');
    lines.push('');
    lines.push('- Every checkbox in checklist.md is `[x]`.');
    lines.push("- traceability.md shows every AC with `Tasks done: \u2713`.");
    lines.push('');
    lines.push('## Default Agent');
    lines.push('');
    lines.push(`Run \`${PHASES.TESTING.defaultAgent}\`. Optional: \`${PHASES.TESTING.optionalAgents.join('`, `')}\`.`);
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/delivering.ts



function generateDeliveringBrief(state) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'));
    const tasksMd = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'tasks.md'));
    const checklist = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'checklist.md'));
    const trace = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'traceability.md'));
    const acs = extractAcceptanceCriteria(spec);
    const tasks = extractTasks(tasksMd);
    const doneTasks = tasks.filter((t)=>t.checked);
    const lines = [];
    lines.push('# Brief: DELIVERING');
    lines.push('');
    lines.push(`**Workflow:** ${state.id}  \u{2022}  **Lifecycle:** ${state.lifecycle}`);
    lines.push('');
    lines.push('## Goal');
    lines.push(PHASES.DELIVERING.purpose);
    lines.push('');
    lines.push('## Final Verification Checklist');
    lines.push('');
    lines.push(`- ACs in spec: ${acs.length}`);
    lines.push(`- Tasks completed: ${doneTasks.length} / ${tasks.length}`);
    lines.push(`- traceability.md present: ${trace ? 'yes' : 'no'}`);
    lines.push(`- checklist.md present: ${checklist ? 'yes' : 'no'}`);
    lines.push('');
    lines.push('## What to Produce');
    lines.push('');
    lines.push('Write `summary.md` with:');
    lines.push("1. **What shipped** \u2014 one paragraph anchored to the original user request.");
    lines.push("2. **Files changed** \u2014 bullet list grouped by area.");
    lines.push("3. **AC verification** \u2014 table of AC \u2192 status \u2192 evidence (test name / manual step).");
    lines.push('4. **Open issues / follow-ups** \u2014 explicit, even if "none".');
    lines.push("5. **How to demo** \u2014 3 steps a reviewer can run.");
    lines.push('');
    lines.push('## Gate Criteria');
    lines.push('');
    lines.push('- summary.md exists with all five sections.');
    lines.push("- traceability.md shows every AC with `AC done: \u2713`.");
    lines.push('- No unmapped tasks in traceability.md.');
    lines.push('');
    lines.push('## Default Agent');
    lines.push('');
    lines.push(`Run \`${PHASES.DELIVERING.defaultAgent}\` for the final review.`);
    lines.push('');
    lines.push('---');
    lines.push('## Original Spec (for reference)');
    lines.push('');
    lines.push('```markdown');
    lines.push(spec.trim() || '_(empty)_');
    lines.push('```');
    return lines.join('\n');
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/briefs/index.ts









function briefDir(workflowDir) {
    return external_node_path_namespaceObject.join(workflowDir, 'briefs');
}
function briefs_briefPath(workflowDir, phase, ctx) {
    if (phase === 'IMPLEMENTING' && ctx?.taskId) {
        return external_node_path_namespaceObject.join(briefDir(workflowDir), `IMPLEMENTING-${ctx.taskId}.md`);
    }
    return external_node_path_namespaceObject.join(briefDir(workflowDir), `${phase}.md`);
}
function generateBrief(state, phase, ctx) {
    let content;
    switch(phase){
        case 'DEFINING':
            content = generateDefiningBrief(state);
            break;
        case 'PLANNING':
            content = generatePlanningBrief(state);
            break;
        case 'DESIGNING':
            content = generateDesigningBrief(state);
            break;
        case 'IMPLEMENTING':
            content = generateImplementingBrief(state, ctx?.taskId);
            break;
        case 'TESTING':
            content = generateTestingBrief(state);
            break;
        case 'DELIVERING':
            content = generateDeliveringBrief(state);
            break;
        default:
            return null;
    }
    if (content === null) return null;
    const file = briefs_briefPath(state.workflowDir, phase, ctx);
    ensureDir(external_node_path_namespaceObject.dirname(file));
    external_node_fs_namespaceObject.writeFileSync(file, content);
    return {
        path: file,
        content
    };
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/init.ts
function gateInit(_state) {
    return [];
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/defining.ts


function gateDefining(state) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'spec.md'));
    const failures = [];
    if (!spec.trim()) {
        failures.push('spec.md is empty.');
        return failures;
    }
    const acs = extractAcceptanceCriteria(spec);
    const real = acs.filter((ac)=>!/<[^>]+>/.test(ac.text));
    if (real.length < 3) {
        failures.push(`spec.md has ${real.length} real EARS-format AC(s); need \u{2265}3 (replace the \`<placeholder>\` syntax with concrete text).`);
    }
    const summary = summarizeSpec(spec);
    if (!summary.background) {
        failures.push('spec.md is missing a non-empty `## Background` section.');
    }
    const hasOutOfScope = /##\s+(Out of Scope|超出范围)/i.test(spec);
    if (!hasOutOfScope) {
        failures.push('spec.md is missing a `## Out of Scope` section (write "None" if truly nothing).');
    }
    return failures;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/traceability.ts



const MAP_RE = /^\s*[-*]\s*(AC-\d+)\s*[→\->]+\s*(.+)$/;
function parseExistingMap(traceMarkdown) {
    const map = new Map();
    for (const raw of traceMarkdown.split(/\r?\n/)){
        const m = raw.match(MAP_RE);
        if (!m) continue;
        const ac = m[1];
        const tasks = m[2].split(/[,，]/).map((s)=>s.trim()).filter(Boolean);
        map.set(ac, tasks);
    }
    return map;
}
function autoMapByOrder(acs, tasks) {
    const map = new Map();
    if (acs.length === 0 || tasks.length === 0) return map;
    for(let i = 0; i < acs.length; i++){
        const ac = acs[i];
        const taskIds = [];
        if (i < tasks.length) taskIds.push(tasks[i].id);
        map.set(ac.id, taskIds);
    }
    return map;
}
function buildMatrix(workflowDir) {
    const spec = readFileOrEmpty(external_node_path_namespaceObject.join(workflowDir, 'spec.md'));
    const tasksMd = readFileOrEmpty(external_node_path_namespaceObject.join(workflowDir, 'tasks.md'));
    const traceMd = readFileOrEmpty(external_node_path_namespaceObject.join(workflowDir, 'traceability.md'));
    const acs = extractAcceptanceCriteria(spec);
    const tasks = extractTasks(tasksMd);
    const existing = parseExistingMap(traceMd);
    const autoMap = autoMapByOrder(acs, tasks);
    const taskById = new Map(tasks.map((t)=>[
            t.id,
            t
        ]));
    const usedTaskIds = new Set();
    const rows = acs.map((ac)=>{
        const taskIds = (existing.get(ac.id) ?? autoMap.get(ac.id) ?? []).filter((id)=>taskById.has(id));
        const taskFiles = new Set();
        let allDone = taskIds.length > 0;
        for (const id of taskIds){
            usedTaskIds.add(id);
            const t = taskById.get(id);
            if (!t) continue;
            for (const f of t.files)taskFiles.add(f);
            if (!t.checked) allDone = false;
        }
        return {
            acId: ac.id,
            acText: ac.text,
            taskIds,
            taskFiles: [
                ...taskFiles
            ],
            acDone: ac.checked,
            tasksDone: allDone
        };
    });
    const unmappedTasks = tasks.filter((t)=>!usedTaskIds.has(t.id));
    return {
        rows,
        unmappedTasks,
        acs,
        tasks
    };
}
function renderMatrix(matrix) {
    const lines = [];
    lines.push('# Traceability Matrix');
    lines.push('');
    lines.push("Auto-generated. Edit the `AC \u2192 tasks` lines to override the default mapping.");
    lines.push('');
    lines.push("## AC \u2192 Tasks");
    lines.push('');
    if (matrix.rows.length === 0) {
        lines.push('_No acceptance criteria found in spec.md._');
    } else {
        for (const row of matrix.rows){
            const taskList = row.taskIds.length ? row.taskIds.join(', ') : "\u2014 (unmapped)";
            lines.push(`- ${row.acId} \u{2192} ${taskList}`);
        }
    }
    lines.push('');
    lines.push('## Detail');
    lines.push('');
    lines.push('| AC | Tasks | Files | AC done | Tasks done |');
    lines.push('|----|-------|-------|---------|------------|');
    for (const row of matrix.rows){
        const tasks = row.taskIds.join(', ') || "\u2014";
        const files = row.taskFiles.join(', ') || "\u2014";
        lines.push(`| ${row.acId} | ${tasks} | ${files} | ${row.acDone ? "\u2713" : "\xb7"} | ${row.tasksDone ? "\u2713" : "\xb7"} |`);
    }
    if (matrix.unmappedTasks.length) {
        lines.push('');
        lines.push('## Unmapped Tasks');
        lines.push('');
        for (const t of matrix.unmappedTasks){
            lines.push(`- ${t.id}: ${t.title}`);
        }
    }
    lines.push('');
    return lines.join('\n');
}
function writeMatrix(workflowDir, matrix) {
    const file = external_node_path_namespaceObject.join(workflowDir, 'traceability.md');
    external_node_fs_namespaceObject.writeFileSync(file, renderMatrix(matrix));
    return file;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/planning.ts

const MAX_FILES_PER_TASK = 5;
function gatePlanning(state) {
    const matrix = buildMatrix(state.workflowDir);
    writeMatrix(state.workflowDir, matrix);
    const failures = [];
    if (matrix.tasks.length === 0) {
        failures.push('tasks.md has no tasks.');
        return failures;
    }
    const oversized = matrix.tasks.filter((t)=>t.files.length > MAX_FILES_PER_TASK);
    if (oversized.length) {
        failures.push(`${oversized.length} task(s) touch >${MAX_FILES_PER_TASK} files: ${oversized.map((t)=>t.id).join(', ')}.`);
    }
    const annotated = matrix.tasks.filter((t)=>t.files.length > 0);
    if (annotated.length === 0) {
        failures.push("No task in tasks.md has a `[files: \u2026]` annotation.");
    }
    if (matrix.acs.length > 0) {
        const unmappedAcs = matrix.rows.filter((r)=>r.taskIds.length === 0);
        if (unmappedAcs.length) {
            failures.push(`${unmappedAcs.length} AC(s) have no mapped task: ${unmappedAcs.map((r)=>r.acId).join(', ')}.`);
        }
    }
    return failures;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/designing.ts


const REQUIRED_SECTIONS = [
    /##\s+Components/i,
    /##\s+Data Flow/i,
    /##\s+API/i,
    /##\s+Trade[-\s]?offs?/i,
    /##\s+(Non[-\s]?Functional|NFR)/i
];
const SECTION_LABELS = [
    'Components',
    'Data Flow',
    'API',
    'Trade-offs',
    'Non-Functional Requirements'
];
function gateDesigning(state) {
    const design = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'design.md'));
    const failures = [];
    if (!design.trim()) {
        failures.push('design.md is empty.');
        return failures;
    }
    for(let i = 0; i < REQUIRED_SECTIONS.length; i++){
        if (!REQUIRED_SECTIONS[i].test(design)) {
            failures.push(`design.md is missing the \`## ${SECTION_LABELS[i]}\` section.`);
        }
    }
    return failures;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/implementing.ts

function gateImplementing(state) {
    const matrix = buildMatrix(state.workflowDir);
    writeMatrix(state.workflowDir, matrix);
    const failures = [];
    if (matrix.tasks.length === 0) {
        failures.push('tasks.md has no tasks. Cannot leave IMPLEMENTING with nothing planned.');
        return failures;
    }
    const open = matrix.tasks.filter((t)=>!t.checked);
    if (open.length) {
        const sample = open.slice(0, 5).map((t)=>t.id).join(', ');
        failures.push(`${open.length} task(s) still open: ${sample}${open.length > 5 ? ", \u2026" : ''}.`);
    }
    if (matrix.acs.length > 0 && matrix.unmappedTasks.length) {
        failures.push(`${matrix.unmappedTasks.length} task(s) are not mapped to any AC. Edit traceability.md or add ACs.`);
    }
    return failures;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/testing.ts



const CHECKBOX_RE = /^\s*[-*]\s*\[([ xX])\]/;
function gateTesting(state) {
    const checklist = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'checklist.md'));
    const failures = [];
    if (!checklist.trim()) {
        failures.push('checklist.md is empty.');
        return failures;
    }
    let total = 0;
    let unchecked = 0;
    for (const line of checklist.split(/\r?\n/)){
        const m = line.match(CHECKBOX_RE);
        if (!m) continue;
        total += 1;
        if (m[1] === ' ') unchecked += 1;
    }
    if (total === 0) {
        failures.push('checklist.md has no checkbox items.');
    } else if (unchecked > 0) {
        failures.push(`${unchecked} of ${total} checklist item(s) still unchecked.`);
    }
    const matrix = buildMatrix(state.workflowDir);
    writeMatrix(state.workflowDir, matrix);
    if (matrix.acs.length > 0) {
        const incomplete = matrix.rows.filter((r)=>!r.tasksDone);
        if (incomplete.length) {
            failures.push(`${incomplete.length} AC(s) not fully covered by completed tasks: ${incomplete.map((r)=>r.acId).join(', ')}.`);
        }
    }
    return failures;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/delivering.ts



const delivering_REQUIRED_SECTIONS = [
    /##\s+(What\s+shipped|Summary)/i,
    /##\s+Files\s+changed/i,
    /##\s+AC\s+verification/i,
    /##\s+(Open\s+issues|Follow[-\s]?ups)/i,
    /##\s+(How\s+to\s+demo|Demo)/i
];
const delivering_SECTION_LABELS = [
    'What shipped',
    'Files changed',
    'AC verification',
    'Open issues',
    'How to demo'
];
function gateDelivering(state) {
    const summary = readFileOrEmpty(external_node_path_namespaceObject.join(state.workflowDir, 'summary.md'));
    const failures = [];
    if (!summary.trim()) {
        failures.push('summary.md is empty.');
        return failures;
    }
    for(let i = 0; i < delivering_REQUIRED_SECTIONS.length; i++){
        if (!delivering_REQUIRED_SECTIONS[i].test(summary)) {
            failures.push(`summary.md is missing the \`## ${delivering_SECTION_LABELS[i]}\` section.`);
        }
    }
    const matrix = buildMatrix(state.workflowDir);
    if (matrix.acs.length > 0) {
        const unverified = matrix.rows.filter((r)=>!r.acDone);
        if (unverified.length) {
            failures.push(`${unverified.length} AC(s) not yet ticked in spec.md: ${unverified.map((r)=>r.acId).join(', ')}.`);
        }
        if (matrix.unmappedTasks.length) {
            failures.push(`${matrix.unmappedTasks.length} task(s) not mapped to any AC.`);
        }
    }
    return failures;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/gates/index.ts








const GATES = {
    INIT: gateInit,
    DEFINING: gateDefining,
    PLANNING: gatePlanning,
    DESIGNING: gateDesigning,
    IMPLEMENTING: gateImplementing,
    TESTING: gateTesting,
    DELIVERING: gateDelivering,
    DONE: ()=>[]
};
function runGate(state, phase) {
    const fn = GATES[phase];
    const failures = fn ? fn(state) : [];
    return {
        phase,
        ok: failures.length === 0,
        failures,
        checkedAt: nowIso()
    };
}

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/advance.ts





function advance_showHelp() {
    console.log(`Usage: cli.cjs advance -r <root> [OPTIONS]

Run the current-phase gate; if it passes, generate the next brief and transition.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path (default: active workflow)
    --force           Skip gate failures and advance anyway
    --skip-brief      Do not regenerate the next-phase brief
    -h, --help        Show help
`);
}
async function advance_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let force = false;
    let skipBrief = false;
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-p':
            case '--path':
                workflowDir = args[++i];
                break;
            case '--force':
                force = true;
                break;
            case '--skip-brief':
                skipBrief = true;
                break;
            case '-h':
            case '--help':
                advance_showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot) {
        console.error('Error: --root is required');
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const dir = getActiveWorkflowDir(projectRoot);
        if (!dir) {
            console.error('Error: no active workflow. Run `cli.cjs init` first.');
            process.exit(1);
        }
        workflowDir = dir;
    }
    const state = loadState(workflowDir);
    if (!state) {
        console.error(`Error: state.json not found or unreadable in ${workflowDir}`);
        process.exit(1);
    }
    const next = nextPhase(state.lifecycle, state.phase);
    if (!next) {
        console.log(`Workflow already at terminal phase: ${state.phase}`);
        return;
    }
    console.log(`Workflow: ${state.id}`);
    console.log(`Lifecycle: ${state.lifecycle}`);
    console.log(`Transition: ${state.phase} \u{2192} ${next}`);
    console.log('');
    const gate = runGate(state, state.phase);
    recordGate(state, gate);
    if (!gate.ok) {
        console.error(`\u{2718} Gate failed for ${state.phase}:`);
        for (const f of gate.failures)console.error(`  - ${f}`);
        if (!force) {
            saveState(state);
            console.error('');
            console.error('Fix and retry, or rerun with --force.');
            process.exit(2);
        }
        console.error("\u26A0 Forcing advance despite gate failures.");
    } else {
        console.log(`\u{2713} Gate passed for ${state.phase}`);
    }
    const from = state.phase;
    state.phase = next;
    appendHistory(state, {
        event: 'advance',
        from,
        to: next
    });
    if (!skipBrief) {
        const brief = generateBrief(state, next);
        if (brief) {
            state.briefs[next] = brief.path;
            appendHistory(state, {
                event: 'brief-regen',
                to: next
            });
            console.log(`\u{1F4DD} Brief written: ${external_node_path_namespaceObject.relative(projectRoot, brief.path)}`);
        }
    }
    saveState(state);
    console.log('');
    console.log(`\u{2192} ${PHASES[next].hint}`);
    if (PHASES[next].defaultAgent) {
        console.log(`\u{2192} Default agent: ${PHASES[next].defaultAgent}`);
    }
    if (PHASES[next].checkpoint === 'always') {
        console.log("\u23F8  Checkpoint phase \u2014 review the brief with the user before continuing.");
    }
}
const advance_command = {
    description: 'Run the current-phase gate and transition to the next phase',
    run: advance_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/status.ts




function status_showHelp() {
    console.log(`Usage: cli.cjs status -r <root> [OPTIONS]

Show the active workflow's phase, brief, gate, and traceability summary.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path
    --json            Machine-readable output
    -h, --help        Show help
`);
}
function progressBar(idx, total) {
    const pct = total <= 1 ? 100 : Math.round(idx / (total - 1) * 100);
    const width = 20;
    const filled = Math.round(pct * width / 100);
    return `[${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}] ${pct}%`;
}
function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}
function status_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let asJson = false;
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-p':
            case '--path':
                workflowDir = args[++i];
                break;
            case '--json':
                asJson = true;
                break;
            case '-h':
            case '--help':
                status_showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot) {
        console.error('Error: --root is required');
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const dir = getActiveWorkflowDir(projectRoot);
        if (!dir) {
            console.error('No active workflow. Run `cli.cjs init` to start one.');
            process.exit(1);
        }
        workflowDir = dir;
    }
    const state = loadState(workflowDir);
    if (!state) {
        console.error(`state.json not found in ${workflowDir}`);
        process.exit(1);
    }
    const phases = phases_LIFECYCLES[state.lifecycle];
    const idx = phases.indexOf(state.phase);
    const matrix = buildMatrix(workflowDir);
    const briefPath = state.briefs[state.phase];
    if (asJson) {
        console.log(JSON.stringify({
            id: state.id,
            name: state.name,
            lifecycle: state.lifecycle,
            phase: state.phase,
            next: nextPhase(state.lifecycle, state.phase),
            lifecyclePhases: phases,
            brief: briefPath ? external_node_path_namespaceObject.relative(projectRoot, briefPath) : null,
            lastGate: state.lastGate,
            ac: {
                total: matrix.acs.length,
                done: matrix.rows.filter((r)=>r.acDone).length
            },
            tasks: {
                total: matrix.tasks.length,
                done: matrix.tasks.filter((t)=>t.checked).length
            },
            unmappedTasks: matrix.unmappedTasks.length
        }, null, 2));
        return;
    }
    const created = new Date(state.createdAt).getTime();
    console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log(`\u{1F4CB} ${state.name}`);
    console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log(`ID:        ${state.id}`);
    console.log(`Lifecycle: ${state.lifecycle}`);
    console.log(`Phase:     ${state.phase}  (${PHASES[state.phase].purpose})`);
    console.log(`Path:      ${phases.join(" \u2192 ")}`);
    console.log(`Progress:  ${progressBar(idx, phases.length)}`);
    console.log(`Age:       ${formatDuration(Date.now() - created)}`);
    console.log('');
    if (briefPath) {
        console.log(`Brief:     ${external_node_path_namespaceObject.relative(projectRoot, briefPath)}`);
    } else {
        console.log("Brief:     (none \u2014 run `cli.cjs brief --regen`)");
    }
    if (state.lastGate) {
        const tag = state.lastGate.ok ? "\u2713 pass" : "\u2718 fail";
        console.log(`Last gate: ${state.lastGate.phase} ${tag}`);
        if (!state.lastGate.ok) {
            for (const f of state.lastGate.failures)console.log(`           - ${f}`);
        }
    }
    console.log('');
    console.log(`AC:        ${matrix.rows.filter((r)=>r.acDone).length} / ${matrix.acs.length} verified`);
    console.log(`Tasks:     ${matrix.tasks.filter((t)=>t.checked).length} / ${matrix.tasks.length} done`);
    if (matrix.unmappedTasks.length) {
        console.log(`Unmapped:  ${matrix.unmappedTasks.length} task(s) without an AC`);
    }
    console.log('');
    console.log(`\u{2192} ${PHASES[state.phase].hint}`);
    if (PHASES[state.phase].defaultAgent) {
        console.log(`\u{2192} Default agent: ${PHASES[state.phase].defaultAgent}`);
    }
}
const status_command = {
    description: 'Show active workflow status, brief, and traceability summary',
    run: status_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/escalate.ts



function escalate_showHelp() {
    console.log(`Usage: cli.cjs escalate -r <root> --to <lifecycle> --reason "<why>"

Promote the active workflow to a richer lifecycle.

Options:
    -r, --root DIR        Project root (REQUIRED)
    -p, --path DIR        Specific workflow path
        --to KIND         lite | standard | full (REQUIRED; must be higher than current)
        --reason TEXT     Why escalating \u{2014} recorded in state history (REQUIRED)
    -h, --help            Show help

Escalation rationale matters: when scope grows mid-flight, recording the
reason on advance lets you audit later why the lifecycle changed.
`);
}
function escalate_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let target = null;
    let reason = '';
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-p':
            case '--path':
                workflowDir = args[++i];
                break;
            case '--to':
                {
                    const v = args[++i];
                    if (!isValidLifecycle(v)) {
                        console.error(`Error: --to must be lite | standard | full (got: ${v})`);
                        process.exit(1);
                    }
                    target = v;
                    break;
                }
            case '--reason':
                reason = args[++i];
                break;
            case '-h':
            case '--help':
                escalate_showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot || !target || !reason) {
        console.error('Error: --root, --to, and --reason are required');
        escalate_showHelp();
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const dir = getActiveWorkflowDir(projectRoot);
        if (!dir) {
            console.error('Error: no active workflow.');
            process.exit(1);
        }
        workflowDir = dir;
    }
    const state = loadState(workflowDir);
    if (!state) {
        console.error(`state.json not found in ${workflowDir}`);
        process.exit(1);
    }
    const result = escalateLifecycle(state, target, reason);
    if (!result.changed) {
        console.error(`\u{2718} Cannot escalate: current lifecycle is "${state.lifecycle}", target "${target}" is not higher.`);
        process.exit(1);
    }
    saveState(state);
    console.log(`\u{2713} Lifecycle: ${result.from} \u{2192} ${state.lifecycle}`);
    console.log(`Reason: ${reason}`);
    console.log('');
    console.log('The next `cli.cjs advance` will route through the new path.');
    console.log('Earlier-phase artifacts (spec.md, design.md) may need to be back-filled.');
}
const escalate_command = {
    description: "Promote workflow lifecycle (lite \u2192 standard \u2192 full)",
    run: escalate_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/trace.ts



function trace_showHelp() {
    console.log(`Usage: cli.cjs trace -r <root> [OPTIONS]

Rebuild and print the AC \u{2194} task \u{2194} files traceability matrix.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path
    --json            Machine-readable output (no file write)
    --print           Print rendered Markdown instead of writing
    -h, --help        Show help
`);
}
function trace_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let asJson = false;
    let printOnly = false;
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-p':
            case '--path':
                workflowDir = args[++i];
                break;
            case '--json':
                asJson = true;
                break;
            case '--print':
                printOnly = true;
                break;
            case '-h':
            case '--help':
                trace_showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot) {
        console.error('Error: --root is required');
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const dir = getActiveWorkflowDir(projectRoot);
        if (!dir) {
            console.error('Error: no active workflow.');
            process.exit(1);
        }
        workflowDir = dir;
    }
    const state = loadState(workflowDir);
    if (!state) {
        console.error(`state.json not found in ${workflowDir}`);
        process.exit(1);
    }
    const matrix = buildMatrix(workflowDir);
    if (asJson) {
        console.log(JSON.stringify(matrix, null, 2));
        return;
    }
    if (printOnly) {
        console.log(renderMatrix(matrix));
        return;
    }
    const file = writeMatrix(workflowDir, matrix);
    console.log(`\u{2713} Wrote ${external_node_path_namespaceObject.relative(projectRoot, file)}`);
    console.log(`AC:    ${matrix.rows.filter((r)=>r.acDone).length} / ${matrix.acs.length} verified`);
    console.log(`Tasks: ${matrix.tasks.filter((t)=>t.checked).length} / ${matrix.tasks.length} done`);
    if (matrix.unmappedTasks.length) {
        console.log(`Unmapped: ${matrix.unmappedTasks.map((t)=>t.id).join(', ')}`);
    }
}
const trace_command = {
    description: "Rebuild the AC \u2194 task \u2194 files traceability matrix",
    run: trace_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/brief.ts




const PHASE_NAMES = [
    'INIT',
    'DEFINING',
    'PLANNING',
    'DESIGNING',
    'IMPLEMENTING',
    'TESTING',
    'DELIVERING',
    'DONE'
];
function brief_showHelp() {
    console.log(`Usage: cli.cjs brief -r <root> [OPTIONS]

Show or regenerate the curated context brief for a phase.

Options:
    -r, --root DIR    Project root (REQUIRED)
    -p, --path DIR    Specific workflow path
    --phase NAME      Phase name (default: current phase)
    --task ID         Task id for IMPLEMENTING brief (default: next unchecked)
    --regen           Regenerate the brief from current artifacts
    --print           Print brief contents to stdout
    -h, --help        Show help

By default, prints the brief path. Combine --regen --print to refresh and dump.
`);
}
function brief_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let phase = null;
    let taskId = '';
    let regen = false;
    let printContents = false;
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-p':
            case '--path':
                workflowDir = args[++i];
                break;
            case '--phase':
                {
                    const v = args[++i];
                    if (!PHASE_NAMES.includes(v)) {
                        console.error(`Error: --phase must be one of ${PHASE_NAMES.join(', ')}`);
                        process.exit(1);
                    }
                    phase = v;
                    break;
                }
            case '--task':
                taskId = args[++i];
                break;
            case '--regen':
                regen = true;
                break;
            case '--print':
                printContents = true;
                break;
            case '-h':
            case '--help':
                brief_showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot) {
        console.error('Error: --root is required');
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const dir = getActiveWorkflowDir(projectRoot);
        if (!dir) {
            console.error('Error: no active workflow.');
            process.exit(1);
        }
        workflowDir = dir;
    }
    const state = loadState(workflowDir);
    if (!state) {
        console.error(`state.json not found in ${workflowDir}`);
        process.exit(1);
    }
    const target = phase ?? state.phase;
    const ctx = taskId ? {
        taskId
    } : undefined;
    let file = briefs_briefPath(state.workflowDir, target, ctx);
    if (regen) {
        const out = generateBrief(state, target, ctx);
        if (!out) {
            console.error(`No brief generator for phase ${target}`);
            process.exit(1);
        }
        file = out.path;
        state.briefs[target] = file;
        appendHistory(state, {
            event: 'brief-regen',
            to: target
        });
        saveState(state);
        console.log(`\u{2713} Regenerated ${external_node_path_namespaceObject.relative(projectRoot, file)}`);
    }
    if (!external_node_fs_namespaceObject.existsSync(file)) {
        console.error(`Brief not found: ${file}`);
        console.error('Run with --regen to create it.');
        process.exit(1);
    }
    if (printContents) {
        console.log(external_node_fs_namespaceObject.readFileSync(file, 'utf8'));
    } else if (!regen) {
        console.log(file);
    }
}
const brief_command = {
    description: 'Show or regenerate the curated brief for a phase',
    run: brief_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/ide-hooks-installer.ts


const SESSION_INIT = `bash -c '
ROOT="\${TRAE_PROJECT_DIR:-\${CLAUDE_PROJECT_DIR:-$PWD}}"
ACTIVE="$ROOT/.agents/active_workflow"
[ -f "$ACTIVE" ] || ACTIVE="$ROOT/.trae/active_workflow"
[ -f "$ACTIVE" ] || exit 0
WF=$(cat "$ACTIVE")
STATE="$WF/state.json"
[ -f "$STATE" ] || exit 0
echo "## Active requirement workflow"
echo ""
PHASE=$(grep -o "\\"phase\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
LIFE=$(grep -o "\\"lifecycle\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
NAME=$(grep -o "\\"name\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
echo "- Workflow: $NAME"
echo "- Phase:    $PHASE  (lifecycle: $LIFE)"
BRIEF="$WF/briefs/$PHASE.md"
[ -f "$BRIEF" ] && echo "- Brief:    $BRIEF (read this before working on the phase)"
echo ""
echo "Run \\\`node scripts/cli.cjs status -r .\\\` for full status."
'`;
const QUALITY_GATE = `bash -c '
ROOT="\${TRAE_PROJECT_DIR:-\${CLAUDE_PROJECT_DIR:-$PWD}}"
ACTIVE="$ROOT/.agents/active_workflow"
[ -f "$ACTIVE" ] || ACTIVE="$ROOT/.trae/active_workflow"
[ -f "$ACTIVE" ] || exit 0
WF=$(cat "$ACTIVE")
STATE="$WF/state.json"
[ -f "$STATE" ] || exit 0
PHASE=$(grep -o "\\"phase\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
case "$PHASE" in
  IMPLEMENTING)
    if [ ! -s "$WF/tasks.md" ]; then
      printf "{\\"decision\\":\\"block\\",\\"reason\\":\\"tasks.md is empty. Plan tasks before stopping.\\"}"
    fi
    ;;
  TESTING)
    printf "{\\"decision\\":\\"block\\",\\"reason\\":\\"In TESTING phase \u{2014} run gate (cli.cjs advance) or confirm checklist.md is complete before stopping.\\"}"
    ;;
esac
exit 0
'`;
function generateHooksJson(_projectRoot) {
    return {
        version: 1,
        hooks: {
            SessionStart: [
                {
                    hooks: [
                        {
                            type: 'command',
                            command: SESSION_INIT,
                            timeout: 5
                        }
                    ]
                }
            ],
            Stop: [
                {
                    loop_limit: 3,
                    hooks: [
                        {
                            type: 'command',
                            command: QUALITY_GATE,
                            timeout: 10
                        }
                    ]
                }
            ]
        }
    };
}
function installIdeHooks(projectRoot, target) {
    const hooksConfig = generateHooksJson(projectRoot);
    if (target === 'trae' || target === 'both') {
        const traeDir = external_node_path_namespaceObject.join(projectRoot, '.trae');
        if (!external_node_fs_namespaceObject.existsSync(traeDir)) external_node_fs_namespaceObject.mkdirSync(traeDir, {
            recursive: true
        });
        const traeFile = external_node_path_namespaceObject.join(traeDir, 'hooks.json');
        external_node_fs_namespaceObject.writeFileSync(traeFile, JSON.stringify(hooksConfig, null, 2) + '\n');
        console.log(`\u{2705} Installed: ${external_node_path_namespaceObject.relative(projectRoot, traeFile)}`);
    }
    if (target === 'claude' || target === 'both') {
        const claudeDir = external_node_path_namespaceObject.join(projectRoot, '.claude');
        if (!external_node_fs_namespaceObject.existsSync(claudeDir)) external_node_fs_namespaceObject.mkdirSync(claudeDir, {
            recursive: true
        });
        const claudeFile = external_node_path_namespaceObject.join(claudeDir, 'settings.json');
        let claudeSettings = {};
        if (external_node_fs_namespaceObject.existsSync(claudeFile)) {
            try {
                claudeSettings = JSON.parse(external_node_fs_namespaceObject.readFileSync(claudeFile, 'utf8'));
            } catch  {
                claudeSettings = {};
            }
        }
        claudeSettings.hooks = hooksConfig.hooks;
        external_node_fs_namespaceObject.writeFileSync(claudeFile, JSON.stringify(claudeSettings, null, 2) + '\n');
        console.log(`\u{2705} Installed: ${external_node_path_namespaceObject.relative(projectRoot, claudeFile)}`);
    }
}

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/hooks.ts


function hooks_showHelp() {
    console.log(`Usage: cli.cjs hooks -r <root> <action> [OPTIONS]

Generate or install IDE hooks (SessionStart context + Stop quality gate).

Actions:
    generate          Print hooks.json to stdout
    install           Write hooks.json into .trae/ and .claude/

Options:
    -r, --root DIR    Project root (REQUIRED)
    --target T        trae | claude | both (default: both)
    -h, --help        Show help
`);
}
function hooks_run(args) {
    let projectRoot = '';
    let action = '';
    let target = 'both';
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '--target':
                target = args[++i];
                break;
            case '-h':
            case '--help':
                hooks_showHelp();
                process.exit(0);
            default:
                if (!action) action = args[i];
        }
    }
    if (!projectRoot || !action) {
        hooks_showHelp();
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    switch(action){
        case 'generate':
            console.log(JSON.stringify(generateHooksJson(projectRoot), null, 2));
            break;
        case 'install':
            installIdeHooks(projectRoot, target);
            break;
        default:
            console.error(`Unknown action: ${action}`);
            hooks_showHelp();
            process.exit(1);
    }
}
const hooks_command = {
    description: 'Generate or install IDE hooks (SessionStart context + Stop gate)',
    run: hooks_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cli.ts








dispatch({
    name: 'requirement-workflow',
    commands: {
        init: command,
        advance: advance_command,
        status: status_command,
        escalate: escalate_command,
        trace: trace_command,
        brief: brief_command,
        hooks: hooks_command
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
