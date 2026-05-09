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

;// CONCATENATED MODULE: ./src/requirement-workflow/hooks.ts



function showHelp() {
    console.log(`Usage: node hooks.cjs -r <root> <command> [OPTIONS]

Manage workflow hooks and generate standard IDE hooks.json.

Commands:
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
function ensureHooksFile(file) {
    if (!external_node_fs_namespaceObject.existsSync(file)) {
        const dir = external_node_path_namespaceObject.dirname(file);
        if (!external_node_fs_namespaceObject.existsSync(dir)) external_node_fs_namespaceObject.mkdirSync(dir, {
            recursive: true
        });
        external_node_fs_namespaceObject.writeFileSync(file, 'hooks: {}\n');
    }
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
        const file = s === 'global' ? getGlobalHooksFile() : s === 'project' ? getProjectHooksFile(projectRoot) : workflowDir ? external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml') : '';
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
    const file = scope === 'global' ? getGlobalHooksFile() : scope === 'project' ? getProjectHooksFile(projectRoot) : external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml');
    ensureHooksFile(file);
    const timestamp = getTimestamp();
    const entry = `    - ${type}: "${name}"\n      required: ${required}\n      added_at: "${timestamp}"`;
    let content = external_node_fs_namespaceObject.readFileSync(file, 'utf8');
    if (content.includes(`${hook}:`)) {
        content = content.replace(`${hook}:\n`, `${hook}:\n${entry}\n`);
    } else {
        content = content.replace(/^hooks:/m, `hooks:\n  ${hook}:\n${entry}`);
    }
    external_node_fs_namespaceObject.writeFileSync(file, content);
    console.log(`\u{2705} Added ${type} '${name}' to ${hook} (${scope})`);
}
function buildSessionInitCommand(_projectRoot) {
    return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ -f "$WF" ]; then echo "## Active Workflow"; echo ""; cat "$WF" | head -20; else echo "No active workflow."; fi'`;
}
function buildQualityGateCommand(_projectRoot) {
    return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ ! -f "$WF" ]; then exit 0; fi; STAGE=$(grep "^stage:" "$WF" | cut -d\\\" -f2 2>/dev/null || grep "^stage:" "$WF" | awk "{print \\$2}"); case "$STAGE" in IMPLEMENTING) if [ ! -f ".trae/workflow/tasks.md" ]; then echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"tasks.md not found. Please create task decomposition before stopping.\\"}" ; exit 0; fi ;; TESTING) echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"Please verify tests pass before stopping.\\"}" ; exit 0 ;; esac; exit 0'`;
}
function buildPostEditCommand(_projectRoot) {
    return `bash -c 'exit 0'`;
}
function generateHooksJson(projectRoot, _workflowDir) {
    const hooksConfig = {
        version: 1,
        hooks: {}
    };
    hooksConfig.hooks.SessionStart = [
        {
            hooks: [
                {
                    type: 'command',
                    command: buildSessionInitCommand(projectRoot),
                    timeout: 10
                }
            ]
        }
    ];
    hooksConfig.hooks.Stop = [
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
    ];
    hooksConfig.hooks.PostToolUse = [
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
    ];
    return hooksConfig;
}
function installHooks(projectRoot, target) {
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
function main() {
    const args = process.argv.slice(2);
    let projectRoot = '';
    let workflowDir = '';
    let command = '';
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
                showHelp();
                process.exit(0);
            default:
                if (!command) command = args[i];
                else if (!hook) hook = args[i];
        }
    }
    if (!projectRoot || !command) {
        showHelp();
        process.exit(1);
    }
    projectRoot = external_node_path_namespaceObject.resolve(projectRoot);
    if (!workflowDir) {
        const activeFile = external_node_path_namespaceObject.join(projectRoot, '.trae', 'active_workflow');
        if (external_node_fs_namespaceObject.existsSync(activeFile)) {
            workflowDir = external_node_fs_namespaceObject.readFileSync(activeFile, 'utf8').trim();
        }
    }
    switch(command){
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
            {
                const config = generateHooksJson(projectRoot, workflowDir);
                console.log(JSON.stringify(config, null, 2));
                break;
            }
        case 'install':
            installHooks(projectRoot, target);
            break;
        default:
            console.error(`Unknown command: ${command}`);
            showHelp();
    }
}
main();

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
