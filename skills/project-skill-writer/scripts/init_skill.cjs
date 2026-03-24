#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'shall',
  'should', 'may', 'might', 'must', 'can', 'could', 'need', 'want',
  'keep', 'doing', 'thing', 'stuff', 'every', 'time', 'always', 'never',
  'just', 'really', 'very', 'much', 'many', 'some', 'each', 'also',
  'same', 'like', 'that', 'this', 'with', 'from', 'into', 'about',
  'when', 'where', 'which', 'what', 'make', 'made',
]);

const SKILL_TYPE_PATTERNS = [
  { keywords: ['write', 'create', 'generate', 'boilerplate', 'scaffold', 'template'], type: 'generator' },
  { keywords: ['check', 'verify', 'validate', 'lint', 'scan', 'audit'], type: 'validator' },
  { keywords: ['explain', 'document', 'describe', 'summarize', 'annotate'], type: 'informer' },
  { keywords: ['follow', 'step', 'process', 'deploy', 'release', 'pipeline', 'workflow'], type: 'workflow' },
  { keywords: ['fix', 'refactor', 'repair', 'clean', 'migrate', 'upgrade'], type: 'remediation' },
];

const TRIGGER_PREFIXES = {
  generator: ['create ', 'generate ', 'new '],
  validator: ['validate ', 'check ', 'scan '],
  informer: ['explain ', 'document ', 'describe '],
  workflow: ['run ', 'execute ', 'start '],
  remediation: ['fix ', 'refactor ', 'clean '],
};

function extractKeywords(text, maxCount) {
  maxCount = maxCount || 5;
  const matches = text.toLowerCase().match(/[a-zA-Z]{4,}/g) || [];
  const seen = new Set();
  const result = [];
  for (const w of matches) {
    if (!STOP_WORDS.has(w) && !seen.has(w)) {
      seen.add(w);
      result.push(w);
      if (result.length >= maxCount) break;
    }
  }
  return result;
}

function classifyProblem(text) {
  const lower = text.toLowerCase();
  const scores = {};
  for (const { keywords, type } of SKILL_TYPE_PATTERNS) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > 0) scores[type] = score;
  }
  if (Object.keys(scores).length > 0) {
    return Object.entries(scores).reduce((a, b) => (b[1] > a[1] ? b : a))[0];
  }
  return 'workflow';
}

function slugify(words, maxParts) {
  maxParts = maxParts || 3;
  return words.slice(0, maxParts).join('-');
}

function inferFromProblem(problem) {
  const skillType = classifyProblem(problem);
  const keywords = extractKeywords(problem);
  const triggers = TRIGGER_PREFIXES[skillType] || ['do ', 'run '];

  const baseSlug = keywords.length > 0 ? slugify(keywords) : skillType;
  const name = baseSlug + '-' + skillType;
  const title = name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const triggerKws = keywords.slice(0, 3);

  return {
    SKILL_NAME: name,
    DESCRIPTION: 'Addresses: ' + problem.slice(0, 120),
    USE_CASES: problem.slice(0, 150),
    TRIGGER1: triggerKws.length > 0 ? triggerKws[0] : triggers[0].trim(),
    TRIGGER2: triggerKws.length > 1 ? triggerKws[1] : (triggers.length > 1 ? triggers[1].trim() : 'automate'),
    TRIGGER3: triggerKws.length > 2 ? triggerKws[2] : (triggers.length > 2 ? triggers[2].trim() : 'reusable'),
    EXCEPTIONS: 'unrelated one-off requests',
    SKILL_TITLE: title,
    BRIEF_INTRO: 'Skill to address: ' + problem,
    CONDITION_1: 'The task involves: ' + (keywords.length > 0 ? keywords[0] : 'repeated work'),
    CONDITION_2: 'The user needs consistent output format',
    CONDITION_3: 'The task benefits from structured steps',
    EXCEPTION_1: 'The task is unrelated to this domain',
    EXCEPTION_2: 'A different specialized skill is a better fit',
    STEP_1: 'Analyze input',
    STEP_2: 'Apply ' + skillType + ' logic',
    STEP_3: 'Execute steps',
    STEP_4: 'Verify output',
    COL1: 'Input',
    COL2: 'Action',
    COL3: 'Output',
    VAL1: 'User request',
    VAL2: 'Skill ' + skillType,
    VAL3: 'Structured result',
    ISSUE1: 'Missing input',
    SOLUTION1: 'Request required fields',
    ISSUE2: 'Unsupported scope',
    SOLUTION2: 'Explain supported boundaries',
    REF_1: 'Reference',
    REF_1_FILE: 'reference.md',
    REF_1_DESC: 'Domain notes',
    REF_2: 'Template',
    REF_2_FILE: 'template.md',
    REF_2_DESC: 'Output template',
  };
}

function defaults(skillName, summary) {
  const title = skillName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return {
    SKILL_NAME: skillName,
    DESCRIPTION: summary || title + ' capability',
    USE_CASES: 'users need this workflow repeatedly',
    TRIGGER1: skillName + ' workflow',
    TRIGGER2: 'automate this process',
    TRIGGER3: 'make this reusable',
    EXCEPTIONS: 'unrelated one-off requests',
    SKILL_TITLE: title,
    BRIEF_INTRO: 'Provide a reusable workflow with clear inputs and outputs.',
    CONDITION_1: 'The task is repetitive and should be standardized.',
    CONDITION_2: 'The user needs consistent output format.',
    CONDITION_3: 'The task benefits from structured steps.',
    EXCEPTION_1: 'The task is unrelated to this domain.',
    EXCEPTION_2: 'A different specialized skill is a better fit.',
    STEP_1: 'Analyze input',
    STEP_2: 'Select workflow path',
    STEP_3: 'Execute steps',
    STEP_4: 'Verify output',
    COL1: 'Input',
    COL2: 'Action',
    COL3: 'Output',
    VAL1: 'User request',
    VAL2: 'Skill workflow',
    VAL3: 'Structured result',
    ISSUE1: 'Missing input',
    SOLUTION1: 'Request required fields',
    ISSUE2: 'Unsupported scope',
    SOLUTION2: 'Explain supported boundaries',
    REF_1: 'Reference',
    REF_1_FILE: 'reference.md',
    REF_1_DESC: 'Domain notes',
    REF_2: 'Template',
    REF_2_FILE: 'template.md',
    REF_2_DESC: 'Output template',
  };
}

function render(template, mapping) {
  let out = template;
  for (const [k, v] of Object.entries(mapping)) {
    out = out.split('{{' + k + '}}').join(v);
  }
  return out;
}

function validateOutputPath(resolved) {
  const home = os.homedir();
  const globalDirs = [
    path.join(home, '.trae'),
    path.join(home, '.trae-cn'),
    path.join(home, '.claude'),
    path.join(home, '.cursor'),
  ];
  for (const gd of globalDirs) {
    if (resolved.startsWith(gd)) {
      console.error('ERROR: Output path ' + resolved + ' is inside global directory ' + gd + '. Use a project-relative path.');
      process.exit(1);
    }
  }
}

function showHelp() {
  console.log(`Usage: node init_skill.cjs --skill-dir <dir> [OPTIONS]

Initialize a skill from a problem description or name.

Options:
    --skill-dir DIR       Path to this skill's own directory (for loading template) (REQUIRED)
    --name NAME           Skill name (use --problem instead for auto-detection)
    --summary TEXT        Brief summary (used with --name)
    --problem TEXT        Problem description - auto-generate skill metadata
    --output-root DIR     Project-relative output root (default: .trae/skills)
    -h, --help            Show help

Examples:
    node init_skill.cjs --skill-dir ./ --problem "I keep writing the same React component boilerplate"
    node init_skill.cjs --skill-dir ./ --name my-skill --summary "does X"`);
}

function main() {
  const args = process.argv.slice(2);
  let skillDir = '';
  let name = '';
  let summary = '';
  let problem = '';
  let outputRoot = '.trae/skills';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--skill-dir': skillDir = args[++i]; break;
      case '--name': name = args[++i]; break;
      case '--summary': summary = args[++i]; break;
      case '--problem': problem = args[++i]; break;
      case '--output-root': outputRoot = args[++i]; break;
      case '-h': case '--help': showHelp(); process.exit(0);
    }
  }

  if (!skillDir) {
    console.error('Error: --skill-dir is required');
    showHelp();
    process.exit(1);
  }

  const writerSkillDir = path.resolve(skillDir);
  const tplPath = path.join(writerSkillDir, 'assets', 'skill.md.template');
  if (!fs.existsSync(tplPath)) {
    console.error('ERROR: Template not found at ' + tplPath);
    process.exit(1);
  }

  const tpl = fs.readFileSync(tplPath, 'utf8');

  let mapping;
  if (problem) {
    mapping = inferFromProblem(problem);
  } else if (name) {
    mapping = defaults(name, summary);
  } else {
    console.error('Error: Either --name or --problem is required');
    showHelp();
    process.exit(1);
  }

  const targetDir = path.resolve(path.join(outputRoot, mapping.SKILL_NAME));
  validateOutputPath(targetDir);

  fs.mkdirSync(targetDir, { recursive: true });
  const outFile = path.join(targetDir, 'SKILL.md');
  fs.writeFileSync(outFile, render(tpl, mapping), 'utf8');
  console.log(outFile);
}

main();
