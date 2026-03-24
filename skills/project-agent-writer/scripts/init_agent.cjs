#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function render(template, mapping) {
  let out = template;
  for (const [k, v] of Object.entries(mapping)) {
    out = out.split('{{' + k + '}}').join(v);
  }
  return out;
}

function defaults(agentName, role) {
  return {
    AGENT_NAME: agentName.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    ONE_SENTENCE_ROLE: role || 'Perform a single isolated task with structured output.',
    EXPANDED_ROLE_DESCRIPTION: 'Handle one focused workflow and return deterministic results.',
    NEGATIVE_CONSTRAINT_1: 'Do NOT broaden scope',
    EXPLANATION_1: 'Stay within the requested task.',
    NEGATIVE_CONSTRAINT_2: 'Do NOT infer missing critical inputs',
    EXPLANATION_2: 'Return explicit missing-input error instead.',
    NEGATIVE_CONSTRAINT_3: 'Do NOT output unstructured text only',
    EXPLANATION_3: 'Always follow the defined output schema.',
    ALLOWED_OUTPUT_TYPES: 'JSON summary and evidence list',
    INPUT_1: 'task_input',
    INPUT_1_DESCRIPTION: 'Primary task payload',
    INPUT_2: 'constraints',
    INPUT_2_DESCRIPTION: 'Rules and boundaries',
    OUTPUT_PATH: 'output_path',
    FIRST_ACTION_TITLE: 'Read Input',
    SUBSTEP_1: 'Parse task payload',
    SUBSTEP_2: 'Validate required fields',
    SUBSTEP_3: 'Prepare execution plan',
    SECOND_ACTION_TITLE: 'Execute',
    THIRD_ACTION_TITLE: 'Evaluate Items',
    ITEM: 'item',
    SUB_ACTION_A: 'Assess',
    SUB_ACTION_B: 'Record evidence',
    DETAIL: 'Use objective criteria',
    MAIN_FIELD: 'results',
    ITEM_FIELD_1: 'text',
    ITEM_FIELD_2: 'passed',
    ITEM_FIELD_3: 'evidence',
    DESCRIPTION: 'description',
    EVIDENCE_PLACEHOLDER: 'quoted evidence',
    SUMMARY_FIELD_1: 'passed_count',
    SUMMARY_FIELD_2: 'total_count',
    SUMMARY_RATE: 'pass_rate',
    FIELD_DESCRIPTION: 'field description',
    GUIDELINE_1_QUALITY: 'objective',
    GUIDELINE_1_EXPLANATION: 'Judge by evidence only.',
    GUIDELINE_2_QUALITY: 'consistent',
    GUIDELINE_2_EXPLANATION: 'Apply the same criteria to all items.',
    GUIDELINE_3_QUALITY: 'traceable',
    GUIDELINE_3_EXPLANATION: 'Include explicit evidence.',
    GUIDELINE_4_VERB: 'Stay scoped',
    GUIDELINE_4_EXPLANATION: 'Do not add unrelated analysis.',
  };
}

function parseArgs(argv) {
  const args = { skillDir: null, name: null, role: '', outputDir: 'agents' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--skill-dir' && i + 1 < argv.length) {
      args.skillDir = argv[++i];
    } else if (argv[i] === '--name' && i + 1 < argv.length) {
      args.name = argv[++i];
    } else if (argv[i] === '--role' && i + 1 < argv.length) {
      args.role = argv[++i];
    } else if (argv[i] === '--output-dir' && i + 1 < argv.length) {
      args.outputDir = argv[++i];
    }
  }
  if (!args.skillDir) {
    console.error('error: --skill-dir is required');
    process.exit(1);
  }
  if (!args.name) {
    console.error('error: --name is required');
    process.exit(1);
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  const writerSkillDir = path.resolve(args.skillDir);
  const tplPath = path.join(writerSkillDir, 'assets', 'agent.md.template');
  const tpl = fs.readFileSync(tplPath, 'utf-8');

  const outDir = path.resolve(args.outputDir);
  fs.mkdirSync(outDir, { recursive: true });

  const outFile = path.join(outDir, args.name + '.md');
  fs.writeFileSync(outFile, render(tpl, defaults(args.name, args.role)), 'utf-8');
  console.log(outFile);
}

main();
