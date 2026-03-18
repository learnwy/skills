#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getTimestamp() {
  return new Date().toISOString();
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function sanitizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function yamlRead(file, key) {
  if (!fs.existsSync(file)) return '';
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  for (const line of lines) {
    if (line.startsWith(key + ':')) {
      return line.split(':').slice(1).join(':').trim().replace(/^["']|["']$/g, '');
    }
  }
  return '';
}

function yamlWrite(file, key, value) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let found = false;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith(key + ':')) {
      lines[i] = `${key}: "${value}"`;
      found = true;
      break;
    }
  }

  if (!found) {
    lines.push(`${key}: "${value}"`);
  }

  fs.writeFileSync(file, lines.join('\n'));
}

function yamlAppendHistory(file, state, timestamp, current) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  let historyStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('state_history:')) {
      historyStart = i;
      break;
    }
  }

  const newEntry = `  - state: "${state}"
    entered_at: "${timestamp}"
    current: ${current}`;

  if (historyStart === -1) {
    fs.appendFileSync(file, `\nstate_history:\n${newEntry}\n`);
    return;
  }

  for (let i = historyStart + 1; i < lines.length; i++) {
    if (lines[i].includes('current: true')) {
      lines[i] = '    current: false';
    }
    if (lines[i].trim() === '' || (lines[i].trim().startsWith('- state:') && i > historyStart + 1)) {
      lines.splice(i, 0, newEntry);
      break;
    }
  }

  fs.writeFileSync(file, lines.join('\n'));
}

function getActiveWorkflow(projectRoot) {
  const activeFile = path.join(projectRoot, '.trae', 'active_workflow');
  if (fs.existsSync(activeFile)) {
    return fs.readFileSync(activeFile, 'utf8').trim();
  }
  return '';
}

function getGlobalHooksFile() {
  return path.join(path.dirname(__dirname), 'hooks.yaml');
}

function getProjectHooksFile(projectRoot) {
  return path.join(projectRoot, '.trae', 'workflow', 'hooks.yaml');
}

function getWorkflowHooksFile(workflowDir) {
  return path.join(workflowDir, 'workflow.yaml');
}

function getHooksForPoint(hook, globalFile, projectFile, workflowFile) {
  const hooks = [];
  const files = [globalFile, projectFile, workflowFile].filter(f => fs.existsSync(f));

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let inHook = false;

    for (const line of lines) {
      if (line.trim() === `${hook}:` || line.trim() === `${hook.replace('pre_', 'pre ').replace('post_', 'post ')}:`) {
        inHook = true;
        continue;
      }
      if (inHook) {
        if (line.trim().startsWith('- skill:')) {
          hooks.push(line.split(':')[1].trim().replace(/["']/g, ''));
        }
        if (line.trim() === '' || (!line.startsWith(' ') && !line.startsWith('-'))) {
          break;
        }
      }
    }
  }
  return hooks;
}

function getAgentsForPoint(hook, globalFile, projectFile, workflowFile) {
  const agents = [];
  const files = [globalFile, projectFile, workflowFile].filter(f => fs.existsSync(f));

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let inAgents = false;
    let inHook = false;

    for (let i = 0; i < lines.length; i++) {
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
        if (line.trim() === '' || (i > 0 && !line.startsWith(' ') && !line.startsWith('-'))) {
          break;
        }
      }
    }
  }
  return agents;
}

module.exports = {
  getTimestamp,
  ensureDir,
  sanitizeName,
  yamlRead,
  yamlWrite,
  yamlAppendHistory,
  getActiveWorkflow,
  getGlobalHooksFile,
  getProjectHooksFile,
  getWorkflowHooksFile,
  getHooksForPoint,
  getAgentsForPoint
};
