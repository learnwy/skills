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
;// CONCATENATED MODULE: ./src/shared/template.ts
const PLACEHOLDER_RE = /\{\{(\w+)\}\}/g;
function render(template, mapping) {
    return template.replace(PLACEHOLDER_RE, (_, key)=>Object.prototype.hasOwnProperty.call(mapping, key) ? mapping[key] : `{{${key}}}`);
}

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

;// CONCATENATED MODULE: ./src/trae-rules-writer/cmd/init.ts




function parseLocal(argv) {
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
function cleanupFrontmatter(text) {
    const lines = text.split('\n');
    if (lines.length >= 4 && lines[0].trim() === '---') {
        if (lines[2].trim() === 'globs:') {
            lines.splice(2, 1);
        }
    }
    return lines.join('\n').trimEnd() + '\n';
}
function run(rawArgs) {
    const args = parseLocal(rawArgs);
    const skillDir = external_node_path_namespaceObject.resolve(args.skillDir);
    const templatePath = external_node_path_namespaceObject.join(skillDir, 'assets', 'rule.md.template');
    const outDir = external_node_path_namespaceObject.resolve(args.outputDir);
    const outFile = external_node_path_namespaceObject.join(outDir, `${args.name}.md`);
    const tpl = external_node_fs_namespaceObject.readFileSync(templatePath, 'utf-8');
    const mapping = defaultValues(args.name, args.mode, args.description, args.globs);
    let content = render(tpl, mapping);
    content = cleanupFrontmatter(content);
    ensureDir(outDir);
    external_node_fs_namespaceObject.writeFileSync(outFile, content, 'utf-8');
    console.log(outFile);
}
const command = {
    description: 'Initialize a Trae rule .md file from the rule template',
    run
};

;// CONCATENATED MODULE: ./src/trae-rules-writer/cli.ts


dispatch({
    name: 'trae-rules-writer',
    commands: {
        init: command
    }
});

for(var __webpack_i__ in __webpack_exports__) {
  exports[__webpack_i__] = __webpack_exports__[__webpack_i__];
}
Object.defineProperty(exports, '__esModule', { value: true });
