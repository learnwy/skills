#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { yamlRead, yamlWrite, yamlAppendHistory, getActiveWorkflow } = require('./lib/common.cjs');

const FULL_STAGES = ['INIT', 'DEFINING', 'PLANNING', 'DESIGNING', 'IMPLEMENTING', 'TESTING', 'DELIVERING', 'DONE'];

const NEXT_STAGE = {
  'INIT': 'DEFINING',
  'DEFINING': 'PLANNING',
  'PLANNING': 'DESIGNING',
  'DESIGNING': 'IMPLEMENTING',
  'IMPLEMENTING': 'TESTING',
  'TESTING': 'DELIVERING',
  'DELIVERING': 'DONE'
};

function showHelp() {
  console.log(`Usage: node advance.cjs -r <root> [OPTIONS]

Advance workflow to the next stage.

Options:
    -r, --root DIR      Project root (REQUIRED)
    -p, --path DIR      Specific workflow path
    -t, --to STAGE      Target stage (auto if not specified)
    --auto              Skip confirmation prompts (for auto mode)
    --force             Force transition despite validation
    -h, --help          Show help`);
}

function validateTransition(current, target, stages) {
  const currentIdx = stages.indexOf(current);
  const targetIdx = stages.indexOf(target);
  if (targetIdx === -1) return false;
  return targetIdx === currentIdx + 1 || target === current;
}

function needsCheckpoint(stage, checkpoints) {
  const key = stage.toLowerCase();
  return checkpoints && checkpoints[key];
}

function askUserConfirm(stage, type, size, risk) {
  return new Promise((resolve) => {
    const questions = {
      'DEFINING': {
        header: '📋 Requirements Definition Complete?',
        question: 'Is spec.md complete with clear scope and acceptance criteria? (yes/skip/cancel)'
      },
      'PLANNING': {
        header: '📋 Planning Complete?',
        question: 'Are tasks.md and estimate approved? (yes/skip/cancel)'
      },
      'DESIGNING': {
        header: '📋 Design Review?',
        question: 'Is design.md approved? (yes/skip/cancel)'
      },
      'TESTING': {
        header: '📋 Ready for Delivery?',
        question: 'Is checklist.md verified and tests pass? (yes/skip/cancel)'
      }
    };

    if (!questions[stage]) {
      resolve({ action: 'continue', nextStage: stage });
      return;
    }

    const q = questions[stage];
    console.log(`\n${q.header}`);
    console.log(`Type: ${type} | Size: ${size} | Risk: ${risk}`);
    console.log('─'.repeat(40));

    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(q.question + ' ', (answer) => {
      rl.close();
      const a = answer.toLowerCase().trim();
      if (a === 'yes' || a === 'y') resolve({ action: 'continue', nextStage: stage });
      else if (a === 'skip' || a === 's') resolve({ action: 'skip', nextStage: stage });
      else if (a === 'cancel' || a === 'c') resolve({ action: 'cancel' });
      else {
        console.log('Please answer: yes (y), skip (s), or cancel (c)');
        askUserConfirm(stage, type, size, risk).then(resolve);
      }
    });
  });
}

function updateWorkflowState(workflowFile, newState) {
  const timestamp = new Date().toISOString();
  yamlWrite(workflowFile, 'status', newState);
  yamlWrite(workflowFile, 'updated_at', timestamp);
  yamlAppendHistory(workflowFile, newState, timestamp, true);
}

async function main() {
  const args = process.argv.slice(2);
  let projectRoot = '', workflowDir = '', targetStage = '', autoMode = false, force = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '-t': case '--to': targetStage = args[++i]; break;
      case '--auto': autoMode = true; break;
      case '--force': force = true; break;
      case '-h': case '--help': showHelp(); process.exit(0);
    }
  }

  if (!projectRoot) {
    console.error('Error: --root is required');
    process.exit(1);
  }

  projectRoot = path.resolve(projectRoot);

  if (!workflowDir) {
    workflowDir = getActiveWorkflow(projectRoot);
  }

  if (!workflowDir || !fs.existsSync(workflowDir)) {
    console.error('Error: No active workflow. Run init.cjs first.');
    process.exit(1);
  }

  const workflowFile = path.join(workflowDir, 'workflow.yaml');
  if (!fs.existsSync(workflowFile)) {
    console.error('Error: workflow.yaml not found');
    process.exit(1);
  }

  const currentStatus = yamlRead(workflowFile, 'status');
  const type = yamlRead(workflowFile, 'type');
  const size = yamlRead(workflowFile, 'size');
  const risk = yamlRead(workflowFile, 'risk');
  const stagesStr = yamlRead(workflowFile, 'stages');

  let stages;
  try {
    stages = JSON.parse(stagesStr.replace(/'/g, '"'));
  } catch {
    stages = FULL_STAGES;
  }

  const checkpoints = {
    defining: yamlRead(workflowFile, 'checkpoints_defining') === 'true',
    planning: yamlRead(workflowFile, 'checkpoints_planning') === 'true',
    designing: yamlRead(workflowFile, 'checkpoints_designing') === 'true',
    testing: yamlRead(workflowFile, 'checkpoints_testing') === 'true'
  };

  const workflowId = path.basename(workflowDir);

  if (!targetStage) {
    const currentIdx = stages.indexOf(currentStatus);
    if (currentIdx === -1 || currentIdx >= stages.length - 1) {
      console.log('Workflow is at final stage');
      process.exit(0);
    }
    targetStage = stages[currentIdx + 1];
  }

  console.log(`Workflow: ${workflowId}`);
  console.log(`Type: ${type} | Size: ${size} | Risk: ${risk}`);
  console.log(`Transition: ${currentStatus} → ${targetStage}`);

  if (!validateTransition(currentStatus, targetStage, stages)) {
    if (!force) {
      console.error(`❌ Invalid transition. Valid stages: ${stages.join(', ')}`);
      process.exit(1);
    }
    console.log('⚠️ Forced transition');
  }

  if (needsCheckpoint(targetStage, checkpoints) && !autoMode) {
    const result = await askUserConfirm(targetStage, type, size, risk);

    if (result.action === 'cancel') {
      console.log('❌ Transition cancelled');
      process.exit(0);
    }

    if (result.action === 'skip') {
      console.log('⏭️  Skipped');
    }
  }

  updateWorkflowState(workflowFile, targetStage);
  console.log(`✅ Transitioned to ${targetStage}`);

  const hints = {
    'DEFINING': '→ Edit spec.md',
    'PLANNING': '→ Edit tasks.md',
    'DESIGNING': '→ Edit design.md',
    'IMPLEMENTING': '→ Implement tasks',
    'TESTING': '→ Run tests',
    'DELIVERING': '→ Verify checklist',
    'DONE': '🎉 Complete!'
  };

  console.log(`\n${hints[targetStage] || ''}`);
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
