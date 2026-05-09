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
;// CONCATENATED MODULE: ./src/trae-rules-writer/init-rule.ts


function parseArgs(argv) {
    const args = {
        mode: 'intelligent',
        description: '',
        globs: '',
        outputDir: '.trae/rules'
    };
    const required = new Set([
        'skillDir',
        'name'
    ]);
    const modeChoices = [
        'always',
        'file',
        'intelligent',
        'manual'
    ];
    const keyMap = {
        '--skill-dir': 'skillDir',
        '--name': 'name',
        '--mode': 'mode',
        '--description': 'description',
        '--globs': 'globs',
        '--output-dir': 'outputDir'
    };
    for(let i = 0; i < argv.length; i++){
        const key = keyMap[argv[i]];
        if (key) {
            const val = argv[++i];
            if (val === undefined) {
                console.error(`Missing value for ${argv[i - 1]}`);
                process.exit(1);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            args[key] = val;
        }
    }
    for (const r of required){
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (!args[r]) {
            console.error(`Missing required argument: --${r.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
            process.exit(1);
        }
    }
    if (!modeChoices.includes(args.mode)) {
        console.error(`Invalid mode "${args.mode}". Choose from: ${modeChoices.join(', ')}`);
        process.exit(1);
    }
    return args;
}
function defaultValues(name, mode, description, globs) {
    const alwaysApply = mode === 'always' ? 'true' : 'false';
    if (mode === 'file' && !globs) globs = '*.md';
    if (mode === 'intelligent' || mode === 'manual') globs = '';
    return {
        DESCRIPTION: description || `Rule for ${name}`,
        GLOBS: globs,
        ALWAYS_APPLY: alwaysApply,
        RULE_TITLE: name.replace(/-/g, ' ').replace(/\b\w/g, (c)=>c.toUpperCase()),
        OVERVIEW: 'Define concise, actionable behavior constraints for AI.',
        GUIDELINES: '- Keep rules explicit\n- Use project-relative paths\n- Avoid conflicting instructions',
        LANG: 'markdown',
        GOOD_EXAMPLE: '# Good\nUse clear, direct guidance.',
        BAD_EXAMPLE: '# Bad\nUse vague or contradictory guidance.',
        EXCEPTIONS: '- Keep API fields and file paths unchanged when needed.'
    };
}
function render(template, mapping) {
    let out = template;
    for (const [k, v] of Object.entries(mapping)){
        out = out.split(`{{${k}}}`).join(v);
    }
    return out;
}
function cleanupFrontmatter(text) {
    const lines = text.split('\n');
    if (lines.length >= 4 && lines[0].trim() === '---') {
        if (lines[2].trim() === 'globs:') {
            lines.splice(2, 1);
        }
    }
    return lines.join('\n').trimEnd() + '\n';
}
function main() {
    const args = parseArgs(process.argv.slice(2));
    const skillDir = external_node_path_namespaceObject.resolve(args.skillDir);
    const templatePath = external_node_path_namespaceObject.join(skillDir, 'assets', 'rule.md.template');
    const outDir = external_node_path_namespaceObject.resolve(args.outputDir);
    const outFile = external_node_path_namespaceObject.join(outDir, `${args.name}.md`);
    const tpl = external_node_fs_namespaceObject.readFileSync(templatePath, 'utf-8');
    const mapping = defaultValues(args.name, args.mode, args.description, args.globs);
    let content = render(tpl, mapping);
    content = cleanupFrontmatter(content);
    external_node_fs_namespaceObject.mkdirSync(outDir, {
        recursive: true
    });
    external_node_fs_namespaceObject.writeFileSync(outFile, content, 'utf-8');
    console.log(outFile);
}
main();

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
