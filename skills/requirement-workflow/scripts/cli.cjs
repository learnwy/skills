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

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/common.ts




function getTimestamp() {
    return nowIso();
}
function sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function yamlRead(file, key) {
    if (!external_node_fs_namespaceObject.existsSync(file)) return '';
    const content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (const line of lines){
        if (line.startsWith(key + ':')) {
            return line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        }
    }
    return '';
}
function yamlWrite(file, key, value) {
    if (!external_node_fs_namespaceObject.existsSync(file)) return;
    const content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let found = false;
    for(let i = 0; i < lines.length; i++){
        if (lines[i].startsWith(key + ':')) {
            lines[i] = `${key}: "${value}"`;
            found = true;
            break;
        }
    }
    if (!found) {
        lines.push(`${key}: "${value}"`);
    }
    external_node_fs_namespaceObject.writeFileSync(file, lines.join('\n'));
}
function yamlAppendHistory(file, state, timestamp, current) {
    if (!external_node_fs_namespaceObject.existsSync(file)) return;
    const content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let historyStart = -1;
    for(let i = 0; i < lines.length; i++){
        if (lines[i].includes('state_history:')) {
            historyStart = i;
            break;
        }
    }
    const newEntry = `  - state: "${state}"
    entered_at: "${timestamp}"
    current: ${current}`;
    if (historyStart === -1) {
        external_node_fs_namespaceObject.appendFileSync(file, `\nstate_history:\n${newEntry}\n`);
        return;
    }
    for(let i = historyStart + 1; i < lines.length; i++){
        if (lines[i].includes('current: true')) {
            lines[i] = '    current: false';
        }
        if (lines[i].trim() === '' || lines[i].trim().startsWith('- state:') && i > historyStart + 1) {
            lines.splice(i, 0, newEntry);
            break;
        }
    }
    external_node_fs_namespaceObject.writeFileSync(file, lines.join('\n'));
}
function getActiveWorkflow(projectRoot) {
    const activeFile = external_node_path_namespaceObject.join(projectRoot, '.trae', 'active_workflow');
    if (external_node_fs_namespaceObject.existsSync(activeFile)) {
        return external_node_fs_namespaceObject.readFileSync(activeFile, 'utf8').trim();
    }
    return '';
}
function getGlobalHooksFile() {
    return external_node_path_namespaceObject.join(external_node_path_namespaceObject.dirname(__dirname), 'hooks.yaml');
}
function getProjectHooksFile(projectRoot) {
    return external_node_path_namespaceObject.join(projectRoot, '.trae', 'workflow', 'hooks.yaml');
}
function getWorkflowHooksFile(workflowDir) {
    return path.join(workflowDir, 'workflow.yaml');
}
function getHooksForPoint(hook, globalFile, projectFile, workflowFile) {
    const hooks = [];
    const files = [
        globalFile,
        projectFile,
        workflowFile
    ].filter((f)=>f && external_node_fs_namespaceObject.existsSync(f));
    for (const file of files){
        const content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        let inHook = false;
        for (const line of lines){
            if (line.trim() === `${hook}:` || line.trim() === `${hook.replace('pre_', 'pre ').replace('post_', 'post ')}:`) {
                inHook = true;
                continue;
            }
            if (inHook) {
                if (line.trim().startsWith('- skill:')) {
                    hooks.push(line.split(':')[1].trim().replace(/["']/g, ''));
                }
                if (line.trim() === '' || !line.startsWith(' ') && !line.startsWith('-')) {
                    break;
                }
            }
        }
    }
    return hooks;
}
function getAgentsForPoint(hook, globalFile, projectFile, workflowFile) {
    const agents = [];
    const files = [
        globalFile,
        projectFile,
        workflowFile
    ].filter((f)=>f && external_node_fs_namespaceObject.existsSync(f));
    for (const file of files){
        const content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        let inAgents = false;
        let inHook = false;
        for(let i = 0; i < lines.length; i++){
            const line = lines[i];
            if (line.trim() === 'agents:') {
                inAgents = true;
                continue;
            }
            if (inAgents && line.trim().startsWith(hook + ':')) {
                inHook = true;
                continue;
            }
            if (inHook) {
                if (line.trim().startsWith('- agent:')) {
                    const agent = line.split(':')[1].trim().replace(/["']/g, '');
                    agents.push(agent);
                }
                if (line.trim() === '' || i > 0 && !line.startsWith(' ') && !line.startsWith('-')) {
                    break;
                }
            }
        }
    }
    return agents;
}

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/init.ts



const TYPES = [
    'bugfix',
    'feature',
    'refactor',
    'tech-debt'
];
const SIZES = [
    'tiny',
    'small',
    'medium',
    'large'
];
const RISKS = [
    'normal',
    'elevated',
    'critical'
];
function init_showHelp() {
    console.log(`Usage: cli.cjs init -r <root> -n <name> [OPTIONS]

Initialize a requirement workflow.

Options:
    -r, --root DIR      Project root (REQUIRED)
    -n, --name NAME     Requirement name (REQUIRED)
    -t, --type TYPE     bugfix|feature|refactor|tech-debt (default: feature)
    -s, --size SIZE     tiny|small|medium|large (default: small)
    -k, --risk RISK     normal|elevated|critical (default: normal)
    -d, --desc DESC     Brief description
    --tags TAGS         Comma-separated tags
    -h, --help          Show help`);
}
function getNextSeqNum(workflowBase, datePrefix) {
    let maxSeq = 0;
    if (external_node_fs_namespaceObject.existsSync(workflowBase)) {
        const dirs = external_node_fs_namespaceObject.readdirSync(workflowBase).filter((d)=>d.startsWith(datePrefix + '_'));
        for (const dir of dirs){
            const seq = parseInt(dir.split('_')[1], 10);
            if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
        }
    }
    return String(maxSeq + 1).padStart(3, '0');
}
function getStages(type, size) {
    if (type === 'bugfix') {
        if (size === 'tiny') return [
            'INIT',
            'IMPLEMENTING',
            'DONE'
        ];
        if (size === 'small') return [
            'INIT',
            'IMPLEMENTING',
            'TESTING',
            'DONE'
        ];
    }
    return [
        'INIT',
        'DEFINING',
        'PLANNING',
        'DESIGNING',
        'IMPLEMENTING',
        'TESTING',
        'DELIVERING',
        'DONE'
    ];
}
function needsCheckpoint(stage, risk) {
    const checkpoints = {
        DEFINING: [
            'elevated',
            'critical'
        ],
        PLANNING: [
            'large',
            'elevated',
            'critical'
        ],
        DESIGNING: [
            'medium',
            'large',
            'elevated',
            'critical'
        ],
        TESTING: [
            'normal',
            'elevated',
            'critical'
        ]
    };
    return Boolean(checkpoints[stage] && checkpoints[stage].includes(risk));
}
function createWorkflowYaml(workflowDir, workflowId, type, size, risk, name, desc, tags, projectRoot) {
    const timestamp = new Date().toISOString();
    const stages = getStages(type, size);
    const yaml = `id: "${workflowId}"
name: "${name}"
type: "${type}"
size: "${size}"
risk: "${risk}"
status: "INIT"
description: "${desc}"
tags: [${tags}]
project_root: "${projectRoot}"
created_at: "${timestamp}"
updated_at: "${timestamp}"
stages: ${JSON.stringify(stages)}
current_stage: { name: null, progress: 0, current_task: null }
state_history:
  - state: "INIT"
    entered_at: "${timestamp}"
    current: true
artifacts: []
checkpoints:
  defining: ${needsCheckpoint('DEFINING', risk)}
  planning: ${needsCheckpoint('PLANNING', risk)}
  designing: ${needsCheckpoint('DESIGNING', risk)}
  testing: ${needsCheckpoint('TESTING', risk)}`;
    external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml'), yaml);
}
function createSpec(workflowDir, name, desc, type, size) {
    const isSimple = type === 'bugfix' && (size === 'tiny' || size === 'small');
    if (isSimple) {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'spec.md'), `# ${name}\n\n## Problem\n${desc}\n\n## Fix\n- [ ] \n\n## Verification\n- [ ] Test passes\n`);
    } else {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'spec.md'), `# ${name}\n\n## Background\n${desc}\n\n## Scope\n- In: \n- Out: \n\n## Acceptance Criteria (EARS format)\n- [ ] When <condition>, the system shall <response>\n\n## Constraints\n- \n\n## Out of Scope\n- \n`);
    }
}
function createTasks(workflowDir, type) {
    if (type === 'bugfix') {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'tasks.md'), `# Tasks\n\n## Fix\n- [ ] Identify root cause\n- [ ] Implement fix\n- [ ] Add regression test\n\n## Verification\n- [ ] Run tests\n- [ ] Manual verification\n`);
    } else {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'tasks.md'), `# Tasks\n\n## Phase 1: Foundation\n- [ ] \n\n## Phase 2: Core Logic\n- [ ] \n\n## Phase 3: Integration & Polish\n- [ ] \n\n## Verification\n- [ ] All acceptance criteria pass\n- [ ] Lint clean\n- [ ] Type check pass\n`);
    }
}
function createChecklist(workflowDir, type, size) {
    const isSimple = type === 'bugfix' && (size === 'tiny' || size === 'small');
    if (isSimple) {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'checklist.md'), `# Checklist\n\n- [ ] Code complete\n- [ ] Tests pass\n- [ ] Lint clean\n`);
    } else {
        external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(workflowDir, 'checklist.md'), `# Checklist

## Code Quality
- [ ] Implementation complete
- [ ] Lint clean
- [ ] Type check pass

## Tests
- [ ] Unit tests pass
- [ ] Integration tests pass (if applicable)

## Acceptance Criteria
- [ ] AC 1: {from spec.md} \u{2014} verified

## Review
- [ ] Self-review complete
- [ ] No TODO/FIXME left unresolved
`);
    }
}
function run(args) {
    let name = '';
    let type = 'feature';
    let size = 'small';
    let risk = 'normal';
    let projectRoot = '';
    let desc = '';
    let tags = '';
    for(let i = 0; i < args.length; i++){
        switch(args[i]){
            case '-n':
            case '--name':
                name = args[++i];
                break;
            case '-t':
            case '--type':
                type = args[++i];
                break;
            case '-s':
            case '--size':
                size = args[++i];
                break;
            case '-k':
            case '--risk':
                risk = args[++i];
                break;
            case '-r':
            case '--root':
                projectRoot = args[++i];
                break;
            case '-d':
            case '--desc':
                desc = args[++i];
                break;
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
        console.error('Error: --root and --name are required');
        init_showHelp();
        process.exit(1);
    }
    if (!TYPES.includes(type)) {
        console.error(`Error: Invalid type. Must be: ${TYPES.join('|')}`);
        process.exit(1);
    }
    if (!SIZES.includes(size)) {
        console.error(`Error: Invalid size. Must be: ${SIZES.join('|')}`);
        process.exit(1);
    }
    if (!RISKS.includes(risk)) {
        console.error(`Error: Invalid risk. Must be: ${RISKS.join('|')}`);
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!external_node_fs_namespaceObject.existsSync(projectRoot)) {
        console.error(`Error: Directory not found: ${projectRoot}`);
        process.exit(1);
    }
    const workflowBase = external_node_path_namespaceObject.join(projectRoot, '.trae', 'workflow');
    ensureDir(workflowBase);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = getNextSeqNum(workflowBase, dateStr);
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const workflowId = `${dateStr}_${seq}_${type}_${safeName}`;
    const workflowDir = external_node_path_namespaceObject.join(workflowBase, workflowId);
    external_node_fs_namespaceObject.mkdirSync(external_node_path_namespaceObject.join(workflowDir, 'logs'), {
        recursive: true
    });
    external_node_fs_namespaceObject.mkdirSync(external_node_path_namespaceObject.join(workflowDir, 'artifacts'), {
        recursive: true
    });
    createWorkflowYaml(workflowDir, workflowId, type, size, risk, name, desc, tags, projectRoot);
    createSpec(workflowDir, name, desc, type, size);
    createTasks(workflowDir, type);
    createChecklist(workflowDir, type, size);
    external_node_fs_namespaceObject.writeFileSync(external_node_path_namespaceObject.join(projectRoot, '.trae', 'active_workflow'), workflowDir);
    const stages = getStages(type, size);
    console.log(`\u{2705} Workflow initialized`);
    console.log(`ID: ${workflowId}`);
    console.log(`Type: ${type} | Size: ${size} | Risk: ${risk}`);
    console.log(`Stages: ${stages.join(" \u2192 ")}`);
    console.log(`Dir: ${workflowDir}`);
    console.log(`\nNext: cli.cjs advance -r "${projectRoot}"`);
}
const command = {
    description: 'Initialize a requirement workflow with classification',
    run
};

;// CONCATENATED MODULE: external "node:readline"
const external_node_readline_namespaceObject = require("node:readline");
;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/advance.ts




const FULL_STAGES = [
    'INIT',
    'DEFINING',
    'PLANNING',
    'DESIGNING',
    'IMPLEMENTING',
    'TESTING',
    'DELIVERING',
    'DONE'
];
function advance_showHelp() {
    console.log(`Usage: cli.cjs advance -r <root> [OPTIONS]

Advance workflow to the next stage.

Options:
    -r, --root DIR      Project root (REQUIRED)
    -p, --path DIR      Specific workflow path
    -t, --to STAGE      Target stage (auto if not specified)
    --auto              Skip confirmation prompts (for auto mode)
    --force             Force transition despite validation
    -h, --help          Show help`);
}
function validateTransition(current, target, stages) {
    const currentIdx = stages.indexOf(current);
    const targetIdx = stages.indexOf(target);
    if (targetIdx === -1) return false;
    return targetIdx === currentIdx + 1 || target === current;
}
function advance_needsCheckpoint(stage, checkpoints) {
    const key = stage.toLowerCase();
    return Boolean(checkpoints && checkpoints[key]);
}
function askUserConfirm(stage, type, size, risk) {
    return new Promise((resolve)=>{
        const questions = {
            DEFINING: {
                header: "\uD83D\uDCCB Requirements Definition Complete?",
                question: 'Is spec.md complete with clear scope and acceptance criteria? (yes/skip/cancel)'
            },
            PLANNING: {
                header: "\uD83D\uDCCB Planning Complete?",
                question: 'Are tasks.md and estimate approved? (yes/skip/cancel)'
            },
            DESIGNING: {
                header: "\uD83D\uDCCB Design Review?",
                question: 'Is design.md approved? (yes/skip/cancel)'
            },
            TESTING: {
                header: "\uD83D\uDCCB Ready for Delivery?",
                question: 'Is checklist.md verified and tests pass? (yes/skip/cancel)'
            }
        };
        if (!questions[stage]) {
            resolve({
                action: 'continue',
                nextStage: stage
            });
            return;
        }
        const q = questions[stage];
        console.log(`\n${q.header}`);
        console.log(`Type: ${type} | Size: ${size} | Risk: ${risk}`);
        console.log("\u2500".repeat(40));
        const rl = external_node_readline_namespaceObject.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        rl.question(q.question + ' ', (answer)=>{
            rl.close();
            const a = answer.toLowerCase().trim();
            if (a === 'yes' || a === 'y') resolve({
                action: 'continue',
                nextStage: stage
            });
            else if (a === 'skip' || a === 's') resolve({
                action: 'skip',
                nextStage: stage
            });
            else if (a === 'cancel' || a === 'c') resolve({
                action: 'cancel'
            });
            else {
                console.log('Please answer: yes (y), skip (s), or cancel (c)');
                askUserConfirm(stage, type, size, risk).then(resolve);
            }
        });
    });
}
function updateWorkflowState(workflowFile, newState) {
    const timestamp = new Date().toISOString();
    yamlWrite(workflowFile, 'status', newState);
    yamlWrite(workflowFile, 'updated_at', timestamp);
    yamlAppendHistory(workflowFile, newState, timestamp, true);
}
async function advance_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let targetStage = '';
    let autoMode = false;
    let force = false;
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
            case '-t':
            case '--to':
                targetStage = args[++i];
                break;
            case '--auto':
                autoMode = true;
                break;
            case '--force':
                force = true;
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
        workflowDir = getActiveWorkflow(projectRoot);
    }
    if (!workflowDir || !external_node_fs_namespaceObject.existsSync(workflowDir)) {
        console.error('Error: No active workflow. Run cli.cjs init first.');
        process.exit(1);
    }
    const workflowFile = external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml');
    if (!external_node_fs_namespaceObject.existsSync(workflowFile)) {
        console.error('Error: workflow.yaml not found');
        process.exit(1);
    }
    const currentStatus = yamlRead(workflowFile, 'status');
    const type = yamlRead(workflowFile, 'type');
    const size = yamlRead(workflowFile, 'size');
    const risk = yamlRead(workflowFile, 'risk');
    const stagesStr = yamlRead(workflowFile, 'stages');
    let stages;
    try {
        stages = JSON.parse(stagesStr.replace(/'/g, '"'));
    } catch  {
        stages = FULL_STAGES;
    }
    const checkpoints = {
        defining: yamlRead(workflowFile, 'checkpoints_defining') === 'true',
        planning: yamlRead(workflowFile, 'checkpoints_planning') === 'true',
        designing: yamlRead(workflowFile, 'checkpoints_designing') === 'true',
        testing: yamlRead(workflowFile, 'checkpoints_testing') === 'true'
    };
    const workflowId = external_node_path_namespaceObject.basename(workflowDir);
    if (!targetStage) {
        const currentIdx = stages.indexOf(currentStatus);
        if (currentIdx === -1 || currentIdx >= stages.length - 1) {
            console.log('Workflow is at final stage');
            process.exit(0);
        }
        targetStage = stages[currentIdx + 1];
    }
    console.log(`Workflow: ${workflowId}`);
    console.log(`Type: ${type} | Size: ${size} | Risk: ${risk}`);
    console.log(`Transition: ${currentStatus} \u{2192} ${targetStage}`);
    if (!validateTransition(currentStatus, targetStage, stages)) {
        if (!force) {
            console.error(`\u{274C} Invalid transition. Valid stages: ${stages.join(', ')}`);
            process.exit(1);
        }
        console.log("\u26A0\uFE0F Forced transition");
    }
    if (advance_needsCheckpoint(targetStage, checkpoints) && !autoMode) {
        const result = await askUserConfirm(targetStage, type, size, risk);
        if (result.action === 'cancel') {
            console.log("\u274C Transition cancelled");
            process.exit(0);
        }
        if (result.action === 'skip') {
            console.log("\u23ED\uFE0F  Skipped");
        }
    }
    updateWorkflowState(workflowFile, targetStage);
    console.log(`\u{2705} Transitioned to ${targetStage}`);
    const hints = {
        DEFINING: "\u2192 Edit spec.md",
        PLANNING: "\u2192 Edit tasks.md",
        DESIGNING: "\u2192 Edit design.md",
        IMPLEMENTING: "\u2192 Implement tasks",
        TESTING: "\u2192 Run tests",
        DELIVERING: "\u2192 Verify checklist",
        DONE: "\uD83C\uDF89 Complete!"
    };
    console.log(`\n${hints[targetStage] || ''}`);
}
const advance_command = {
    description: 'Advance the active workflow to the next stage',
    run: advance_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cmd/status.ts



const status_FULL_STAGES = [
    'INIT',
    'DEFINING',
    'PLANNING',
    'DESIGNING',
    'IMPLEMENTING',
    'TESTING',
    'DELIVERING',
    'DONE'
];
const STAGE_PROGRESS = {
    INIT: 0,
    DEFINING: 15,
    PLANNING: 30,
    DESIGNING: 45,
    IMPLEMENTING: 60,
    TESTING: 80,
    DELIVERING: 95,
    DONE: 100
};
function status_showHelp() {
    console.log(`Usage: cli.cjs status -r <root> [OPTIONS]

Show workflow status.

Options:
    -r, --root DIR      Project root (REQUIRED)
    -p, --path DIR      Specific workflow path
    --json              JSON output
    -h, --help          Show help`);
}
function drawProgressBar(progress) {
    const width = 20;
    const filled = Math.round(progress * width / 100);
    return `[${"\u2588".repeat(filled)}${"\u2591".repeat(width - filled)}] ${progress}%`;
}
function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
function showStatus(workflowDir, showJson) {
    const workflowFile = external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml');
    if (!external_node_fs_namespaceObject.existsSync(workflowFile)) {
        console.error('Error: workflow.yaml not found');
        return;
    }
    const id = external_node_path_namespaceObject.basename(workflowDir);
    const name = yamlRead(workflowFile, 'name');
    const type = yamlRead(workflowFile, 'type');
    const size = yamlRead(workflowFile, 'size');
    const risk = yamlRead(workflowFile, 'risk');
    const status = yamlRead(workflowFile, 'status');
    const createdAt = yamlRead(workflowFile, 'created_at');
    const stagesStr = yamlRead(workflowFile, 'stages');
    let stages;
    try {
        stages = JSON.parse(stagesStr.replace(/'/g, '"'));
    } catch  {
        stages = status_FULL_STAGES;
    }
    const progress = STAGE_PROGRESS[status] || 0;
    const createdTs = new Date(createdAt).getTime();
    const duration = Math.floor((Date.now() - createdTs) / 1000);
    if (showJson) {
        console.log(JSON.stringify({
            id,
            name,
            type,
            size,
            risk,
            status,
            progress,
            stages,
            created_at: createdAt,
            duration_seconds: duration
        }, null, 2));
        return;
    }
    const riskIcon = {
        normal: "\uD83D\uDFE2",
        elevated: "\uD83D\uDFE1",
        critical: "\uD83D\uDD34"
    };
    const sizeLabel = {
        tiny: 'Tiny',
        small: 'Small',
        medium: 'Medium',
        large: 'Large'
    };
    console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log(`\u{1F4CB} ${name}`);
    console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
    console.log(`ID:     ${id}`);
    console.log(`Type:   ${type} | Size: ${sizeLabel[size] || size} ${riskIcon[risk] || ''} ${risk}`);
    console.log(`Stage:  ${status}`);
    console.log(`Stages: ${stages.join(" \u2192 ")}`);
    console.log(`Progress: ${drawProgressBar(progress)}`);
    console.log(`Duration: ${formatDuration(duration)}`);
    console.log('');
}
function status_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let showJson = false;
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
                showJson = true;
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
        workflowDir = getActiveWorkflow(projectRoot);
    }
    if (!workflowDir || !external_node_fs_namespaceObject.existsSync(workflowDir)) {
        console.error('Error: No active workflow');
        process.exit(1);
    }
    showStatus(workflowDir, showJson);
}
const status_command = {
    description: 'Show current workflow status',
    run: status_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/workflow-yaml-hooks.ts



function ensureHooksFile(file) {
    if (!external_node_fs_namespaceObject.existsSync(file)) {
        const dir = external_node_path_namespaceObject.dirname(file);
        if (!external_node_fs_namespaceObject.existsSync(dir)) external_node_fs_namespaceObject.mkdirSync(dir, {
            recursive: true
        });
        external_node_fs_namespaceObject.writeFileSync(file, 'hooks: {}\n');
    }
}
function resolveScopeFile(scope, projectRoot, workflowDir) {
    if (scope === 'global') return getGlobalHooksFile();
    if (scope === 'project') return getProjectHooksFile(projectRoot);
    return external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml');
}
function listHooks(projectRoot, workflowDir, hook, scope) {
    const scopes = scope ? [
        scope
    ] : [
        'global',
        'project',
        'workflow'
    ];
    const icons = {
        global: "\uD83C\uDF0D",
        project: "\uD83D\uDCC1",
        workflow: "\uD83D\uDCC4"
    };
    for (const s of scopes){
        if (s === 'workflow' && !workflowDir) continue;
        const file = resolveScopeFile(s, projectRoot, workflowDir);
        if (!file || !external_node_fs_namespaceObject.existsSync(file)) continue;
        console.log(`\n${icons[s]} ${s.toUpperCase()}`);
        console.log("\u2500".repeat(40));
        const skills = hook ? getHooksForPoint(hook, file, '', '') : [];
        const agents = hook ? getAgentsForPoint(hook, file, '', '') : [];
        if (skills.length === 0 && agents.length === 0) {
            console.log('  (none)');
        } else {
            skills.forEach((sk, i)=>console.log(`  ${i + 1}. skill: ${sk}`));
            agents.forEach((ag, i)=>console.log(`  ${i + 1}. agent: ${ag}`));
        }
    }
    console.log('');
}
function addHook(projectRoot, workflowDir, scope, hook, type, name, required) {
    const file = resolveScopeFile(scope, projectRoot, workflowDir);
    ensureHooksFile(file);
    const entry = `    - ${type}: "${name}"\n      required: ${required}\n      added_at: "${getTimestamp()}"`;
    let content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
    if (content.includes(`${hook}:`)) {
        content = content.replace(`${hook}:\n`, `${hook}:\n${entry}\n`);
    } else {
        content = content.replace(/^hooks:/m, `hooks:\n  ${hook}:\n${entry}`);
    }
    external_node_fs_namespaceObject.writeFileSync(file, content);
    console.log(`\u{2705} Added ${type} '${name}' to ${hook} (${scope})`);
}

;// CONCATENATED MODULE: ./src/requirement-workflow/lib/ide-hooks-installer.ts


function buildSessionInitCommand(_projectRoot) {
    return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ -f "$WF" ]; then echo "## Active Workflow"; echo ""; cat "$WF" | head -20; else echo "No active workflow."; fi'`;
}
function buildQualityGateCommand(_projectRoot) {
    return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ ! -f "$WF" ]; then exit 0; fi; STAGE=$(grep "^stage:" "$WF" | cut -d\\\" -f2 2>/dev/null || grep "^stage:" "$WF" | awk "{print \\$2}"); case "$STAGE" in IMPLEMENTING) if [ ! -f ".trae/workflow/tasks.md" ]; then echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"tasks.md not found. Please create task decomposition before stopping.\\"}" ; exit 0; fi ;; TESTING) echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"Please verify tests pass before stopping.\\"}" ; exit 0 ;; esac; exit 0'`;
}
function buildPostEditCommand(_projectRoot) {
    return `bash -c 'exit 0'`;
}
function generateHooksJson(projectRoot) {
    return {
        version: 1,
        hooks: {
            SessionStart: [
                {
                    hooks: [
                        {
                            type: 'command',
                            command: buildSessionInitCommand(projectRoot),
                            timeout: 10
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
                            command: buildQualityGateCommand(projectRoot),
                            timeout: 30
                        }
                    ]
                }
            ],
            PostToolUse: [
                {
                    matcher: 'Edit|Write',
                    hooks: [
                        {
                            type: 'command',
                            command: buildPostEditCommand(projectRoot),
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

Manage workflow hooks and generate standard IDE hooks.json.

Actions:
    list [hook]       List internal workflow hooks (all or specific)
    add <hook> <name> Add internal workflow hook
    generate          Generate standard hooks.json for IDE integration
    install           Install hooks.json into both .trae/ and .claude/

Options:
    -r, --root DIR     Project root (REQUIRED)
    -p, --path DIR     Specific workflow path
    --scope SCOPE     global|project|workflow (default: workflow)
    --type TYPE       skill|agent (default: skill)
    -n, --name NAME   Name (for add)
    --required        Mark as required
    --target TARGET   trae|claude|both (for generate/install, default: both)
    -h, --help        Show help`);
}
function hooks_run(args) {
    let projectRoot = '';
    let workflowDir = '';
    let action = '';
    let scope = 'workflow';
    let hook = '';
    let type = 'skill';
    let name = '';
    let required = false;
    let target = 'both';
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
            case '--scope':
                scope = args[++i];
                break;
            case '--type':
                type = args[++i];
                break;
            case '-n':
            case '--name':
                name = args[++i];
                break;
            case '--required':
                required = true;
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
                else if (!hook) hook = args[i];
        }
    }
    if (!projectRoot || !action) {
        hooks_showHelp();
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const activeFile = external_node_path_namespaceObject.join(projectRoot, '.trae', 'active_workflow');
        if (external_node_fs_namespaceObject.existsSync(activeFile)) {
            workflowDir = external_node_fs_namespaceObject.readFileSync(activeFile, 'utf8').trim();
        }
    }
    switch(action){
        case 'list':
            listHooks(projectRoot, workflowDir, hook, scope);
            break;
        case 'add':
            if (!hook || !name) {
                console.error('Error: hook and name required for add');
                process.exit(1);
            }
            addHook(projectRoot, workflowDir, scope, hook, type, name, required);
            break;
        case 'generate':
            console.log(JSON.stringify(generateHooksJson(projectRoot), null, 2));
            break;
        case 'install':
            installIdeHooks(projectRoot, target);
            break;
        default:
            console.error(`Unknown action: ${action}`);
            hooks_showHelp();
    }
}
const hooks_command = {
    description: 'Manage workflow-internal hooks (list/add) and generate/install IDE hooks.json',
    run: hooks_run
};

;// CONCATENATED MODULE: ./src/requirement-workflow/cli.ts





dispatch({
    name: 'requirement-workflow',
    commands: {
        init: command,
        advance: advance_command,
        status: status_command,
        hooks: hooks_command
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
