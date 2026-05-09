"use strict";
const __rslib_import_meta_url__ = /*#__PURE__*/ (function () {
  return typeof document === 'undefined'
    ? new (require('url'.replace('', '')).URL)('file:' + __filename).href
    : (document.currentScript && document.currentScript.src) ||
      new URL('main.js', document.baseURI).href;
})();
;
// The require scope
var __webpack_require__ = {};

/************************************************************************/
// webpack/runtime/define_property_getters
(() => {
__webpack_require__.d = (exports, definition) => {
	for(var key in definition) {
        if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
        }
    }
};
})();
// webpack/runtime/has_own_property
(() => {
__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
})();
// webpack/runtime/make_namespace_object
(() => {
// define __esModule on exports
__webpack_require__.r = (exports) => {
	if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
	}
	Object.defineProperty(exports, '__esModule', { value: true });
};
})();
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  getGlobalHooksFile: () => (/* binding */ getGlobalHooksFile),
  sanitizeName: () => (/* binding */ sanitizeName),
  getProjectHooksFile: () => (/* binding */ getProjectHooksFile),
  getTimestamp: () => (/* binding */ getTimestamp),
  yamlWrite: () => (/* binding */ yamlWrite),
  getHooksForPoint: () => (/* binding */ getHooksForPoint),
  getWorkflowHooksFile: () => (/* binding */ getWorkflowHooksFile),
  getActiveWorkflow: () => (/* binding */ getActiveWorkflow),
  getAgentsForPoint: () => (/* binding */ getAgentsForPoint),
  ensureDir: () => (/* binding */ ensureDir),
  yamlAppendHistory: () => (/* binding */ yamlAppendHistory),
  yamlRead: () => (/* binding */ yamlRead)
});

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
    return external_node_path_namespaceObject.join(workflowDir, 'workflow.yaml');
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

exports.ensureDir = __webpack_exports__.ensureDir;
exports.getActiveWorkflow = __webpack_exports__.getActiveWorkflow;
exports.getAgentsForPoint = __webpack_exports__.getAgentsForPoint;
exports.getGlobalHooksFile = __webpack_exports__.getGlobalHooksFile;
exports.getHooksForPoint = __webpack_exports__.getHooksForPoint;
exports.getProjectHooksFile = __webpack_exports__.getProjectHooksFile;
exports.getTimestamp = __webpack_exports__.getTimestamp;
exports.getWorkflowHooksFile = __webpack_exports__.getWorkflowHooksFile;
exports.sanitizeName = __webpack_exports__.sanitizeName;
exports.yamlAppendHistory = __webpack_exports__.yamlAppendHistory;
exports.yamlRead = __webpack_exports__.yamlRead;
exports.yamlWrite = __webpack_exports__.yamlWrite;
for(var __webpack_i__ in __webpack_exports__) {
  if(["ensureDir","getActiveWorkflow","getAgentsForPoint","getGlobalHooksFile","getHooksForPoint","getProjectHooksFile","getTimestamp","getWorkflowHooksFile","sanitizeName","yamlAppendHistory","yamlRead","yamlWrite"].indexOf(__webpack_i__) === -1) {
    exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
  }
}
Object.defineProperty(exports, '__esModule', { value: true });
