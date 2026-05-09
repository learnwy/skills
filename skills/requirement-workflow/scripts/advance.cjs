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
;// CONCATENATED MODULE: external "node:readline"
const external_node_readline_namespaceObject = require("node:readline");
;// CONCATENATED MODULE: ./src/requirement-workflow/lib/common.ts


function getTimestamp() {
    return new Date().toISOString();
}
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {
            recursive: true
        });
    }
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

;// CONCATENATED MODULE: ./src/requirement-workflow/advance.ts




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
function showHelp() {
    console.log(`Usage: node advance.cjs -r <root> [OPTIONS]

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
function needsCheckpoint(stage, checkpoints) {
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
async function main() {
    const args = process.argv.slice(2);
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
                showHelp();
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
        console.error('Error: No active workflow. Run init.cjs first.');
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
    if (needsCheckpoint(targetStage, checkpoints) && !autoMode) {
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
main().catch((e)=>{
    console.error('Error:', e.message);
    process.exit(1);
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
