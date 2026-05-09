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
;// CONCATENATED MODULE: ./src/knowledge-consolidation/get-knowledge-path.ts


const AI_TYPE_MAP = {
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
};
const VALID_TYPES = [
    'debug',
    'architecture',
    'pattern',
    'config',
    'api',
    'workflow',
    'lesson',
    'reference'
];
function showHelp() {
    console.log(`Usage: get-knowledge-path.cjs -r <project_root> -a <ai_type> -t <type> -n <filename>

Generate a knowledge document path based on project and AI IDE context.

Arguments:
  -r, --root      Project root directory (required)
  -a, --ai-type   AI/LLM type: trae, trae-cn, claude-code, cursor, windsurf (required)
  -t, --type      Knowledge type: debug, architecture, pattern, config, api, workflow, lesson, reference (required)
  -n, --name      Filename (without extension, required)
  -h, --help      Show this help message`);
}
function parseArgs(argv) {
    const args = {
        root: '',
        aiType: '',
        type: '',
        name: ''
    };
    let i = 0;
    while(i < argv.length){
        switch(argv[i]){
            case '-r':
            case '--root':
                args.root = argv[++i] || '';
                break;
            case '-a':
            case '--ai-type':
                args.aiType = argv[++i] || '';
                break;
            case '-t':
            case '--type':
                args.type = argv[++i] || '';
                break;
            case '-n':
            case '--name':
                args.name = argv[++i] || '';
                break;
            case '-h':
            case '--help':
                showHelp();
                process.exit(0);
                break;
            default:
                process.stderr.write(`Error: Unknown option: ${argv[i]}\n`);
                showHelp();
                process.exit(1);
        }
        i++;
    }
    return args;
}
function getToday() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}
function sanitizeFilename(name) {
    return name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-{2,}/g, '-').replace(/^-/, '').replace(/-$/, '');
}
function countExisting(dir, datePrefix) {
    if (!external_node_fs_namespaceObject.existsSync(dir)) return 0;
    const entries = external_node_fs_namespaceObject.readdirSync(dir);
    return entries.filter((e)=>{
        if (!e.startsWith(`${datePrefix}_`)) return false;
        const full = external_node_path_namespaceObject.join(dir, e);
        return external_node_fs_namespaceObject.statSync(full).isFile();
    }).length;
}
function main() {
    const args = parseArgs(process.argv.slice(2));
    if (!args.root || !args.aiType || !args.type || !args.name) {
        process.stderr.write('Error: Missing required arguments\n');
        showHelp();
        process.exit(1);
    }
    if (!external_node_fs_namespaceObject.existsSync(args.root) || !external_node_fs_namespaceObject.statSync(args.root).isDirectory()) {
        process.stderr.write(`Error: Project root does not exist: ${args.root}\n`);
        process.exit(1);
    }
    const aiPath = AI_TYPE_MAP[args.aiType];
    if (!aiPath) {
        process.stderr.write(`Error: Unknown AI type: ${args.aiType}\n`);
        process.stderr.write(`Supported types: trae, trae-cn, claude-code, cursor, windsurf\n`);
        process.exit(1);
    }
    if (!VALID_TYPES.includes(args.type)) {
        process.stderr.write(`Error: Unknown knowledge type: ${args.type}\n`);
        process.stderr.write(`Supported types: ${VALID_TYPES.join(' ')}\n`);
        process.exit(1);
    }
    const knowledgeDir = external_node_path_namespaceObject.join(args.root, aiPath, 'knowledges');
    external_node_fs_namespaceObject.mkdirSync(knowledgeDir, {
        recursive: true
    });
    const today = getToday();
    const existingCount = countExisting(knowledgeDir, today);
    const dailySeq = String(existingCount + 1).padStart(3, '0');
    const safeName = sanitizeFilename(args.name);
    const outputPath = external_node_path_namespaceObject.join(knowledgeDir, `${today}_${dailySeq}_${args.type}_${safeName}.md`);
    process.stdout.write(outputPath + '\n');
}
main();

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
