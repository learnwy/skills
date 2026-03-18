#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const { yamlRead, getActiveWorkflow } = require('./lib/common.cjs');

const FULL_STAGES = ['INIT', 'DEFINING', 'PLANNING', 'DESIGNING', 'IMPLEMENTING', 'TESTING', 'DELIVERING', 'DONE'];

const STAGE_PROGRESS = {
  'INIT': 0, 'DEFINING': 15, 'PLANNING': 30, 'DESIGNING': 45,
  'IMPLEMENTING': 60, 'TESTING': 80, 'DELIVERING': 95, 'DONE': 100
};

function showHelp() {
  console.log(`Usage: node status.cjs -r <root> [OPTIONS]

Show workflow status.

Options:
    -r, --root DIR      Project root (REQUIRED)
    -p, --path DIR      Specific workflow path
    --json              JSON output
    -h, --help          Show help`);
}

function drawProgressBar(progress) {
  const width = 20;
  const filled = Math.round(progress * width / 100);
  return `[${'█'.repeat(filled)}${'░'.repeat(width - filled)}] ${progress}%`;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function showStatus(workflowDir, showJson) {
  const workflowFile = path.join(workflowDir, 'workflow.yaml');
  if (!fs.existsSync(workflowFile)) {
    console.error('Error: workflow.yaml not found');
    return;
  }

  const id = path.basename(workflowDir);
  const name = yamlRead(workflowFile, 'name');
  const type = yamlRead(workflowFile, 'type');
  const size = yamlRead(workflowFile, 'size');
  const risk = yamlRead(workflowFile, 'risk');
  const status = yamlRead(workflowFile, 'status');
  const createdAt = yamlRead(workflowFile, 'created_at');
  const stagesStr = yamlRead(workflowFile, 'stages');

  let stages;
  try {
    stages = JSON.parse(stagesStr.replace(/'/g, '"'));
  } catch {
    stages = FULL_STAGES;
  }

  const progress = STAGE_PROGRESS[status] || 0;
  const createdTs = new Date(createdAt).getTime();
  const duration = Math.floor((Date.now() - createdTs) / 1000);

  if (showJson) {
    console.log(JSON.stringify({
      id, name, type, size, risk, status, progress,
      stages,
      created_at: createdAt,
      duration_seconds: duration
    }, null, 2));
    return;
  }

  const riskIcon = { normal: '🟢', elevated: '🟡', critical: '🔴' };
  const sizeLabel = { tiny: 'Tiny', small: 'Small', medium: 'Medium', large: 'Large' };

  console.log('═══════════════════════════════════════════');
  console.log(`📋 ${name}`);
  console.log('═══════════════════════════════════════════');
  console.log(`ID:     ${id}`);
  console.log(`Type:   ${type} | Size: ${sizeLabel[size] || size} ${riskIcon[risk] || ''} ${risk}`);
  console.log(`Stage:  ${status}`);
  console.log(`Stages: ${stages.join(' → ')}`);
  console.log(`Progress: ${drawProgressBar(progress)}`);
  console.log(`Duration: ${formatDuration(duration)}`);
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  let projectRoot = '', workflowDir = '', showJson = false;

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '-r': case '--root': projectRoot = args[++i]; break;
      case '-p': case '--path': workflowDir = args[++i]; break;
      case '--json': showJson = true; break;
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
    console.error('Error: No active workflow');
    process.exit(1);
  }

  showStatus(workflowDir, showJson);
}

main();
