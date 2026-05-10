import * as fs from 'node:fs';
import * as path from 'node:path';
import { ensureDir, nowIso } from '../../shared/fs-utils.js';

export { ensureDir };

export function getTimestamp(): string {
  return nowIso();
}

export function sanitizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function yamlRead(file: string, key: string): string {
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

export function yamlWrite(file: string, key: string, value: string): void {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
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

export function yamlAppendHistory(file: string, state: string, timestamp: string, current: boolean): void {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
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

export function getActiveWorkflow(projectRoot: string): string {
  const activeFile = path.join(projectRoot, '.trae', 'active_workflow');
  if (fs.existsSync(activeFile)) {
    return fs.readFileSync(activeFile, 'utf8').trim();
  }
  return '';
}

export function getGlobalHooksFile(): string {
  return path.join(path.dirname(__dirname), 'hooks.yaml');
}

export function getProjectHooksFile(projectRoot: string): string {
  return path.join(projectRoot, '.trae', 'workflow', 'hooks.yaml');
}

export function getWorkflowHooksFile(workflowDir: string): string {
  return path.join(workflowDir, 'workflow.yaml');
}

export function getHooksForPoint(hook: string, globalFile: string, projectFile: string, workflowFile: string): string[] {
  const hooks: string[] = [];
  const files = [globalFile, projectFile, workflowFile].filter((f) => f && fs.existsSync(f));

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

export function getAgentsForPoint(hook: string, globalFile: string, projectFile: string, workflowFile: string): string[] {
  const agents: string[] = [];
  const files = [globalFile, projectFile, workflowFile].filter((f) => f && fs.existsSync(f));

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
