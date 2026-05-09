import * as fs from 'node:fs';
import * as path from 'node:path';

export interface HookPayload {
  user_message?: string;
  prompt?: string;
  assistant_message?: string;
  last_response?: string;
  transcript?: string;
  [key: string]: unknown;
}

export function readStdin(): Promise<HookPayload> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    process.stdin.on('error', () => resolve({}));
  });
}

export function getProjectDir(): string {
  return process.env.TRAE_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

export function injectContext(text: string): void {
  process.stdout.write(text);
}

export function respond(output: unknown): void {
  process.stdout.write(JSON.stringify(output));
}

export function block(reason: string): void {
  respond({ decision: 'block', reason });
}

export function deny(reason: string): void {
  respond({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  });
}

export interface HookEntry {
  type: 'command';
  command: string;
  timeout?: number;
}

export interface HookGroup {
  hooks: HookEntry[];
}

export interface HooksConfig {
  version?: number;
  hooks: Record<string, HookGroup[]>;
}

export interface InstallOptions {
  target?: 'trae' | 'claude' | 'both';
  scope?: 'global' | 'project';
  projectRoot?: string;
}

export function installHooks(config: HooksConfig, options: InstallOptions = {}): string[] {
  const { target = 'both', scope = 'global', projectRoot } = options;
  const results: string[] = [];
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';

  if (scope === 'global') {
    if (target === 'trae' || target === 'both') {
      for (const dir of ['.trae', '.trae-cn']) {
        const traeFile = path.join(homeDir, dir, 'hooks.json');
        mergeAndWrite(traeFile, config, 'standalone');
        results.push(traeFile);
      }
    }
    if (target === 'claude' || target === 'both') {
      const claudeFile = path.join(homeDir, '.claude', 'settings.json');
      mergeAndWrite(claudeFile, config, 'nested');
      results.push(claudeFile);
    }
  } else {
    const root = projectRoot || getProjectDir();
    if (target === 'trae' || target === 'both') {
      const traeFile = path.join(root, '.trae', 'hooks.json');
      mergeAndWrite(traeFile, config, 'standalone');
      results.push(traeFile);
    }
    if (target === 'claude' || target === 'both') {
      const claudeFile = path.join(root, '.claude', 'settings.json');
      mergeAndWrite(claudeFile, config, 'nested');
      results.push(claudeFile);
    }
  }

  return results;
}

type FileMode = 'standalone' | 'nested';

function mergeAndWrite(filePath: string, config: HooksConfig, mode: FileMode): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let existing: Record<string, unknown> = {};
  if (fs.existsSync(filePath)) {
    try {
      existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      existing = {};
    }
  }

  if (mode === 'standalone') {
    existing.version = config.version || 1;
  }
  const hooks = ((existing.hooks ??= {}) as Record<string, HookGroup[]>);

  for (const [event, groups] of Object.entries(config.hooks || {})) {
    hooks[event] = hooks[event] || [];
    for (const group of groups) {
      const isDup = hooks[event].some((g) => JSON.stringify(g) === JSON.stringify(group));
      if (!isDup) hooks[event].push(group);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
}

export function uninstallHooks(skillId: string, options: InstallOptions = {}): void {
  const { target = 'both', scope = 'global', projectRoot } = options;
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const root = projectRoot || getProjectDir();

  const files: string[] = [];
  if (scope === 'global') {
    if (target === 'trae' || target === 'both') {
      files.push(path.join(homeDir, '.trae', 'hooks.json'));
      files.push(path.join(homeDir, '.trae-cn', 'hooks.json'));
    }
    if (target === 'claude' || target === 'both') {
      files.push(path.join(homeDir, '.claude', 'settings.json'));
    }
  } else {
    if (target === 'trae' || target === 'both') {
      files.push(path.join(root, '.trae', 'hooks.json'));
    }
    if (target === 'claude' || target === 'both') {
      files.push(path.join(root, '.claude', 'settings.json'));
    }
  }

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, unknown>;
      const hooks = content.hooks as Record<string, HookGroup[]> | undefined;
      if (!hooks) continue;

      for (const [event, groups] of Object.entries(hooks)) {
        hooks[event] = groups.filter((g) => {
          const cmds = (g.hooks || []).map((h) => h.command || '');
          return !cmds.some((cmd) => cmd.includes(skillId));
        });
        if (hooks[event].length === 0) delete hooks[event];
      }

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    } catch {
      /* swallow */
    }
  }
}
