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
                const traeFile = external_node_path_namespaceObject.join(homeDir, dir, 'hooks.json');
                mergeAndWrite(traeFile, config, 'standalone');
                results.push(traeFile);
            }
        }
        if (target === 'claude' || target === 'both') {
            const claudeFile = external_node_path_namespaceObject.join(homeDir, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
    } else {
        const root = projectRoot || getProjectDir();
        if (target === 'trae' || target === 'both') {
            const traeFile = external_node_path_namespaceObject.join(root, '.trae', 'hooks.json');
            mergeAndWrite(traeFile, config, 'standalone');
            results.push(traeFile);
        }
        if (target === 'claude' || target === 'both') {
            const claudeFile = external_node_path_namespaceObject.join(root, '.claude', 'settings.json');
            mergeAndWrite(claudeFile, config, 'nested');
            results.push(claudeFile);
        }
    }
    return results;
}
function mergeAndWrite(filePath, config, mode) {
    const dir = external_node_path_namespaceObject.dirname(filePath);
    if (!external_node_fs_namespaceObject.existsSync(dir)) external_node_fs_namespaceObject.mkdirSync(dir, {
        recursive: true
    });
    let existing = {};
    if (external_node_fs_namespaceObject.existsSync(filePath)) {
        try {
            existing = JSON.parse(external_node_fs_namespaceObject.readFileSync(filePath, 'utf8'));
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
    external_node_fs_namespaceObject.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
}
function uninstallHooks(skillId, options = {}) {
    const { target = 'both', scope = 'global', projectRoot } = options;
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    const root = projectRoot || getProjectDir();
    const files = [];
    if (scope === 'global') {
        if (target === 'trae' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(homeDir, '.trae', 'hooks.json'));
            files.push(external_node_path_namespaceObject.join(homeDir, '.trae-cn', 'hooks.json'));
        }
        if (target === 'claude' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(homeDir, '.claude', 'settings.json'));
        }
    } else {
        if (target === 'trae' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(root, '.trae', 'hooks.json'));
        }
        if (target === 'claude' || target === 'both') {
            files.push(external_node_path_namespaceObject.join(root, '.claude', 'settings.json'));
        }
    }
    for (const filePath of files){
        if (!external_node_fs_namespaceObject.existsSync(filePath)) continue;
        try {
            const content = JSON.parse(external_node_fs_namespaceObject.readFileSync(filePath, 'utf8'));
            const hooks = content.hooks;
            if (!hooks) continue;
            for (const [event, groups] of Object.entries(hooks)){
                hooks[event] = groups.filter((g)=>{
                    const cmds = (g.hooks || []).map((h)=>h.command || '');
                    return !cmds.some((cmd)=>cmd.includes(skillId));
                });
                if (hooks[event].length === 0) delete hooks[event];
            }
            external_node_fs_namespaceObject.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
        } catch  {
        /* swallow */ }
    }
}

;// CONCATENATED MODULE: ./src/shared/install-entry.ts



function showHelp() {
    console.log(`Usage: node install.cjs <action> [options]

Install or uninstall skill hooks into IDE config files.

Actions:
  install   Install hooks from a skill's hooks config
  uninstall Remove hooks matching a skill identifier

Options:
  --config PATH    Path to skill's hooks.json config file (for install)
  --skill-id ID    Skill identifier string to match commands (for uninstall)
  --target TARGET  trae|claude|both (default: both)
  --scope SCOPE    global|project (default: global)
  --root DIR       Project root (for scope=project, default: cwd)

Examples:
  node install.cjs install --config ../hooks.json --scope global
  node install.cjs uninstall --skill-id english-learner --scope global`);
}
function main() {
    const args = process.argv.slice(2);
    let action = '';
    let configPath = '';
    let skillId = '';
    let target = 'both';
    let scope = 'global';
    let root = process.cwd();
    for(let i = 0; i < args.length; i++){
        const arg = args[i];
        switch(arg){
            case '--config':
                configPath = args[++i] || '';
                break;
            case '--skill-id':
                skillId = args[++i] || '';
                break;
            case '--target':
                target = args[++i] || 'both';
                break;
            case '--scope':
                scope = args[++i] || 'global';
                break;
            case '--root':
                root = args[++i] || process.cwd();
                break;
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
            default:
                if (!action) action = arg;
        }
    }
    if (!action) {
        showHelp();
        process.exit(1);
    }
    if (action === 'install') {
        if (!configPath) {
            console.error('Error: --config required for install');
            process.exit(1);
        }
        const absPath = external_node_path_namespaceObject.resolve(configPath);
        const config = JSON.parse(external_node_fs_namespaceObject.readFileSync(absPath, 'utf8'));
        const results = installHooks(config, {
            target,
            scope,
            projectRoot: external_node_path_namespaceObject.resolve(root)
        });
        results.forEach((f)=>console.log(`\u{2705} Installed to: ${f}`));
    } else if (action === 'uninstall') {
        if (!skillId) {
            console.error('Error: --skill-id required for uninstall');
            process.exit(1);
        }
        uninstallHooks(skillId, {
            target,
            scope,
            projectRoot: external_node_path_namespaceObject.resolve(root)
        });
        console.log(`\u{2705} Uninstalled hooks matching: ${skillId}`);
    } else {
        console.error(`Unknown action: ${action}`);
        showHelp();
        process.exit(1);
    }
}
main();

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
