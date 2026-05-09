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

;// CONCATENATED MODULE: ./src/requirement-workflow/status.ts



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
function showHelp() {
    console.log(`Usage: node status.cjs -r <root> [OPTIONS]

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
        stages = FULL_STAGES;
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
function main() {
    const args = process.argv.slice(2);
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
        console.error('Error: No active workflow');
        process.exit(1);
    }
    showStatus(workflowDir, showJson);
}
main();

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
