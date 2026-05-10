import * as fs from 'node:fs';
import * as path from 'node:path';

export type Target = 'trae' | 'claude' | 'both';

export interface HooksConfig {
  version: number;
  hooks: Record<string, unknown[]>;
}

function buildSessionInitCommand(_projectRoot: string): string {
  return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ -f "$WF" ]; then echo "## Active Workflow"; echo ""; cat "$WF" | head -20; else echo "No active workflow."; fi'`;
}

function buildQualityGateCommand(_projectRoot: string): string {
  return `bash -c 'WF=".trae/workflow/workflow.yaml"; if [ ! -f "$WF" ]; then exit 0; fi; STAGE=$(grep "^stage:" "$WF" | cut -d\\\" -f2 2>/dev/null || grep "^stage:" "$WF" | awk "{print \\$2}"); case "$STAGE" in IMPLEMENTING) if [ ! -f ".trae/workflow/tasks.md" ]; then echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"tasks.md not found. Please create task decomposition before stopping.\\"}" ; exit 0; fi ;; TESTING) echo "{\\"decision\\":\\"block\\",\\"reason\\":\\"Please verify tests pass before stopping.\\"}" ; exit 0 ;; esac; exit 0'`;
}

function buildPostEditCommand(_projectRoot: string): string {
  return `bash -c 'exit 0'`;
}

export function generateHooksJson(projectRoot: string): HooksConfig {
  return {
    version: 1,
    hooks: {
      SessionStart: [
        { hooks: [{ type: 'command', command: buildSessionInitCommand(projectRoot), timeout: 10 }] },
      ],
      Stop: [
        { loop_limit: 3, hooks: [{ type: 'command', command: buildQualityGateCommand(projectRoot), timeout: 30 }] },
      ],
      PostToolUse: [
        { matcher: 'Edit|Write', hooks: [{ type: 'command', command: buildPostEditCommand(projectRoot), timeout: 10 }] },
      ],
    },
  };
}

export function installIdeHooks(projectRoot: string, target: Target): void {
  const hooksConfig = generateHooksJson(projectRoot);

  if (target === 'trae' || target === 'both') {
    const traeDir = path.join(projectRoot, '.trae');
    if (!fs.existsSync(traeDir)) fs.mkdirSync(traeDir, { recursive: true });
    const traeFile = path.join(traeDir, 'hooks.json');
    fs.writeFileSync(traeFile, JSON.stringify(hooksConfig, null, 2) + '\n');
    console.log(`✅ Installed: ${path.relative(projectRoot, traeFile)}`);
  }

  if (target === 'claude' || target === 'both') {
    const claudeDir = path.join(projectRoot, '.claude');
    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
    const claudeFile = path.join(claudeDir, 'settings.json');

    let claudeSettings: Record<string, unknown> = {};
    if (fs.existsSync(claudeFile)) {
      try {
        claudeSettings = JSON.parse(fs.readFileSync(claudeFile, 'utf8'));
      } catch {
        claudeSettings = {};
      }
    }
    claudeSettings.hooks = hooksConfig.hooks;
    fs.writeFileSync(claudeFile, JSON.stringify(claudeSettings, null, 2) + '\n');
    console.log(`✅ Installed: ${path.relative(projectRoot, claudeFile)}`);
  }
}
