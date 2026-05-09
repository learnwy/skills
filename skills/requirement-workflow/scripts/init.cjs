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
;// CONCATENATED MODULE: ./src/requirement-workflow/lib/common.ts


function getTimestamp() {
    return new Date().toISOString();
}
function ensureDir(dir) {
    if (!external_node_fs_namespaceObject.existsSync(dir)) {
        external_node_fs_namespaceObject.mkdirSync(dir, {
            recursive: true
        });
    }
}
function sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
function yamlRead(file, key) {
    if (!fs.existsSync(file)) return '';
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    for (const line of lines){
        if (line.startsWith(key + ':')) {
            return line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        }
    }
    return '';
}
function yamlWrite(file, key, value) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
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
    fs.writeFileSync(file, lines.join('\n'));
}
function yamlAppendHistory(file, state, timestamp, current) {
    if (!fs.existsSync(file)) return;
    const content = fs.readFileSync(file, 'utf8');
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
        fs.appendFileSync(file, `\nstate_history:\n${newEntry}\n`);
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
    fs.writeFileSync(file, lines.join('\n'));
}
function getActiveWorkflow(projectRoot) {
    const activeFile = path.join(projectRoot, '.trae', 'active_workflow');
    if (fs.existsSync(activeFile)) {
        return fs.readFileSync(activeFile, 'utf8').trim();
    }
    return '';
}
function getGlobalHooksFile() {
    return path.join(path.dirname(__dirname), 'hooks.yaml');
}
function getProjectHooksFile(projectRoot) {
    return path.join(projectRoot, '.trae', 'workflow', 'hooks.yaml');
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
    ].filter((f)=>f && fs.existsSync(f));
    for (const file of files){
        const content = fs.readFileSync(file, 'utf8');
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
    ].filter((f)=>f && fs.existsSync(f));
    for (const file of files){
        const content = fs.readFileSync(file, 'utf8');
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

;// CONCATENATED MODULE: ./src/requirement-workflow/init.ts



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
function showHelp() {
    console.log(`Usage: node init.cjs -r <root> -n <name> [OPTIONS]

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
function main() {
    const args = process.argv.slice(2);
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
                showHelp();
                process.exit(0);
        }
    }
    if (!projectRoot || !name) {
        console.error('Error: --root and --name are required');
        showHelp();
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
    console.log(`\nNext: node advance.cjs -r "${projectRoot}"`);
}
main();

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
