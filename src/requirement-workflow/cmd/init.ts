import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureDir } from '../lib/common.js';
import type { Command } from '../../shared/cli.js';

const TYPES = ['bugfix', 'feature', 'refactor', 'tech-debt'] as const;
const SIZES = ['tiny', 'small', 'medium', 'large'] as const;
const RISKS = ['normal', 'elevated', 'critical'] as const;

type Type = (typeof TYPES)[number];
type Size = (typeof SIZES)[number];
type Risk = (typeof RISKS)[number];

function showHelp(): void {
  console.log(`Usage: cli.cjs init -r <root> -n <name> [OPTIONS]

Initialize a requirement workflow.

Options:
    -r, --root DIR      Project root (REQUIRED)
    -n, --name NAME     Requirement name (REQUIRED)
    -t, --type TYPE     bugfix|feature|refactor|tech-debt (default: feature)
    -s, --size SIZE     tiny|small|medium|large (default: small)
    -k, --risk RISK     normal|elevated|critical (default: normal)
    -d, --desc DESC     Brief description
    --tags TAGS         Comma-separated tags
    -h, --help          Show help`);
}

function getNextSeqNum(workflowBase: string, datePrefix: string): string {
  let maxSeq = 0;
  if (fs.existsSync(workflowBase)) {
    const dirs = fs.readdirSync(workflowBase).filter((d) => d.startsWith(datePrefix + '_'));
    for (const dir of dirs) {
      const seq = parseInt(dir.split('_')[1], 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  }
  return String(maxSeq + 1).padStart(3, '0');
}

function getStages(type: Type, size: Size): string[] {
  if (type === 'bugfix') {
    if (size === 'tiny') return ['INIT', 'IMPLEMENTING', 'DONE'];
    if (size === 'small') return ['INIT', 'IMPLEMENTING', 'TESTING', 'DONE'];
  }
  return ['INIT', 'DEFINING', 'PLANNING', 'DESIGNING', 'IMPLEMENTING', 'TESTING', 'DELIVERING', 'DONE'];
}

function needsCheckpoint(stage: string, risk: string): boolean {
  const checkpoints: Record<string, string[]> = {
    DEFINING: ['elevated', 'critical'],
    PLANNING: ['large', 'elevated', 'critical'],
    DESIGNING: ['medium', 'large', 'elevated', 'critical'],
    TESTING: ['normal', 'elevated', 'critical'],
  };
  return Boolean(checkpoints[stage] && checkpoints[stage].includes(risk));
}

function createWorkflowYaml(
  workflowDir: string, workflowId: string, type: Type, size: Size, risk: Risk,
  name: string, desc: string, tags: string, projectRoot: string,
): void {
  const timestamp = new Date().toISOString();
  const stages = getStages(type, size);

  const yaml = `id: "${workflowId}"
name: "${name}"
type: "${type}"
size: "${size}"
risk: "${risk}"
status: "INIT"
description: "${desc}"
tags: [${tags}]
project_root: "${projectRoot}"
created_at: "${timestamp}"
updated_at: "${timestamp}"
stages: ${JSON.stringify(stages)}
current_stage: { name: null, progress: 0, current_task: null }
state_history:
  - state: "INIT"
    entered_at: "${timestamp}"
    current: true
artifacts: []
checkpoints:
  defining: ${needsCheckpoint('DEFINING', risk)}
  planning: ${needsCheckpoint('PLANNING', risk)}
  designing: ${needsCheckpoint('DESIGNING', risk)}
  testing: ${needsCheckpoint('TESTING', risk)}`;
  fs.writeFileSync(path.join(workflowDir, 'workflow.yaml'), yaml);
}

function createSpec(workflowDir: string, name: string, desc: string, type: Type, size: Size): void {
  const isSimple = type === 'bugfix' && (size === 'tiny' || size === 'small');
  if (isSimple) {
    fs.writeFileSync(path.join(workflowDir, 'spec.md'), `# ${name}\n\n## Problem\n${desc}\n\n## Fix\n- [ ] \n\n## Verification\n- [ ] Test passes\n`);
  } else {
    fs.writeFileSync(path.join(workflowDir, 'spec.md'), `# ${name}\n\n## Background\n${desc}\n\n## Scope\n- In: \n- Out: \n\n## Acceptance Criteria (EARS format)\n- [ ] When <condition>, the system shall <response>\n\n## Constraints\n- \n\n## Out of Scope\n- \n`);
  }
}

function createTasks(workflowDir: string, type: Type): void {
  if (type === 'bugfix') {
    fs.writeFileSync(path.join(workflowDir, 'tasks.md'), `# Tasks\n\n## Fix\n- [ ] Identify root cause\n- [ ] Implement fix\n- [ ] Add regression test\n\n## Verification\n- [ ] Run tests\n- [ ] Manual verification\n`);
  } else {
    fs.writeFileSync(path.join(workflowDir, 'tasks.md'), `# Tasks\n\n## Phase 1: Foundation\n- [ ] \n\n## Phase 2: Core Logic\n- [ ] \n\n## Phase 3: Integration & Polish\n- [ ] \n\n## Verification\n- [ ] All acceptance criteria pass\n- [ ] Lint clean\n- [ ] Type check pass\n`);
  }
}

function createChecklist(workflowDir: string, type: Type, size: Size): void {
  const isSimple = type === 'bugfix' && (size === 'tiny' || size === 'small');
  if (isSimple) {
    fs.writeFileSync(path.join(workflowDir, 'checklist.md'), `# Checklist\n\n- [ ] Code complete\n- [ ] Tests pass\n- [ ] Lint clean\n`);
  } else {
    fs.writeFileSync(path.join(workflowDir, 'checklist.md'), `# Checklist\n\n## Code Quality\n- [ ] Implementation complete\n- [ ] Lint clean\n- [ ] Type check pass\n\n## Tests\n- [ ] Unit tests pass\n- [ ] Integration tests pass (if applicable)\n\n## Acceptance Criteria\n- [ ] AC 1: {from spec.md} — verified\n\n## Review\n- [ ] Self-review complete\n- [ ] No TODO/FIXME left unresolved\n`);
  }
}

function run(args: string[]): void {
  let name = '';
  let type: Type = 'feature';
  let size: Size = 'small';
  let risk: Risk = 'normal';
  let projectRoot = '';
  let desc = '';
  let tags = '';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-n': case '--name': name = args[++i]; break;
      case '-t': case '--type': type = args[++i] as Type; break;
      case '-s': case '--size': size = args[++i] as Size; break;
      case '-k': case '--risk': risk = args[++i] as Risk; break;
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-d': case '--desc': desc = args[++i]; break;
      case '--tags': tags = args[++i]; break;
      case '-h': case '--help': showHelp(); process.exit(0);
    }
  }

  if (!projectRoot || !name) {
    console.error('Error: --root and --name are required');
    showHelp();
    process.exit(1);
  }

  if (!(TYPES as readonly string[]).includes(type)) {
    console.error(`Error: Invalid type. Must be: ${TYPES.join('|')}`);
    process.exit(1);
  }
  if (!(SIZES as readonly string[]).includes(size)) {
    console.error(`Error: Invalid size. Must be: ${SIZES.join('|')}`);
    process.exit(1);
  }
  if (!(RISKS as readonly string[]).includes(risk)) {
    console.error(`Error: Invalid risk. Must be: ${RISKS.join('|')}`);
    process.exit(1);
  }

  projectRoot = path.resolve(projectRoot);
  if (!fs.existsSync(projectRoot)) {
    console.error(`Error: Directory not found: ${projectRoot}`);
    process.exit(1);
  }

  const workflowBase = path.join(projectRoot, '.trae', 'workflow');
  ensureDir(workflowBase);

  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = getNextSeqNum(workflowBase, dateStr);
  const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const workflowId = `${dateStr}_${seq}_${type}_${safeName}`;
  const workflowDir = path.join(workflowBase, workflowId);

  fs.mkdirSync(path.join(workflowDir, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(workflowDir, 'artifacts'), { recursive: true });

  createWorkflowYaml(workflowDir, workflowId, type, size, risk, name, desc, tags, projectRoot);
  createSpec(workflowDir, name, desc, type, size);
  createTasks(workflowDir, type);
  createChecklist(workflowDir, type, size);

  fs.writeFileSync(path.join(projectRoot, '.trae', 'active_workflow'), workflowDir);

  const stages = getStages(type, size);
  console.log(`✅ Workflow initialized`);
  console.log(`ID: ${workflowId}`);
  console.log(`Type: ${type} | Size: ${size} | Risk: ${risk}`);
  console.log(`Stages: ${stages.join(' → ')}`);
  console.log(`Dir: ${workflowDir}`);
  console.log(`\nNext: cli.cjs advance -r "${projectRoot}"`);
}

export const command: Command = {
  description: 'Initialize a requirement workflow with classification',
  run,
};
