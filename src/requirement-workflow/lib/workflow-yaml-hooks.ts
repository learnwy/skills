import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getGlobalHooksFile, getProjectHooksFile,
  getHooksForPoint, getAgentsForPoint, getTimestamp,
} from './common.js';

export type Scope = 'global' | 'project' | 'workflow';

export function ensureHooksFile(file: string): void {
  if (!fs.existsSync(file)) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, 'hooks: {}\n');
  }
}

function resolveScopeFile(scope: Scope, projectRoot: string, workflowDir: string): string {
  if (scope === 'global') return getGlobalHooksFile();
  if (scope === 'project') return getProjectHooksFile(projectRoot);
  return path.join(workflowDir, 'workflow.yaml');
}

export function listHooks(projectRoot: string, workflowDir: string, hook: string, scope: Scope | ''): void {
  const scopes: Scope[] = scope ? [scope] : ['global', 'project', 'workflow'];
  const icons: Record<Scope, string> = { global: '🌍', project: '📁', workflow: '📄' };

  for (const s of scopes) {
    if (s === 'workflow' && !workflowDir) continue;
    const file = resolveScopeFile(s, projectRoot, workflowDir);
    if (!file || !fs.existsSync(file)) continue;

    console.log(`\n${icons[s]} ${s.toUpperCase()}`);
    console.log('─'.repeat(40));

    const skills = hook ? getHooksForPoint(hook, file, '', '') : [];
    const agents = hook ? getAgentsForPoint(hook, file, '', '') : [];

    if (skills.length === 0 && agents.length === 0) {
      console.log('  (none)');
    } else {
      skills.forEach((sk, i) => console.log(`  ${i + 1}. skill: ${sk}`));
      agents.forEach((ag, i) => console.log(`  ${i + 1}. agent: ${ag}`));
    }
  }
  console.log('');
}

export function addHook(
  projectRoot: string, workflowDir: string, scope: Scope, hook: string, type: string, name: string, required: boolean,
): void {
  const file = resolveScopeFile(scope, projectRoot, workflowDir);
  ensureHooksFile(file);

  const entry = `    - ${type}: "${name}"\n      required: ${required}\n      added_at: "${getTimestamp()}"`;

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(`${hook}:`)) {
    content = content.replace(`${hook}:\n`, `${hook}:\n${entry}\n`);
  } else {
    content = content.replace(/^hooks:/m, `hooks:\n  ${hook}:\n${entry}`);
  }

  fs.writeFileSync(file, content);
  console.log(`✅ Added ${type} '${name}' to ${hook} (${scope})`);
}
