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

export type InstallTarget = 'trae' | 'claude' | 'codex' | 'both' | 'all';

export interface InstallOptions {
  target?: InstallTarget;
  scope?: 'global' | 'project';
  projectRoot?: string;
}

function wantsTrae(t: InstallTarget): boolean {
  return t === 'trae' || t === 'both' || t === 'all';
}
function wantsClaude(t: InstallTarget): boolean {
  return t === 'claude' || t === 'both' || t === 'all';
}
function wantsCodex(t: InstallTarget): boolean {
  return t === 'codex' || t === 'both' || t === 'all';
}

export function enableCodexHooksFeatureToml(source: string): string {
  const normalized = source.replace(/\r\n/g, '\n');
  const lines = normalized.endsWith('\n') ? normalized.slice(0, -1).split('\n') : normalized.split('\n');
  const effectiveLines = lines.length === 1 && lines[0] === '' ? [] : lines;

  let featuresStart = -1;
  let featuresEnd = effectiveLines.length;
  for (let i = 0; i < effectiveLines.length; i++) {
    if (/^\s*\[features\]\s*(?:#.*)?$/.test(effectiveLines[i])) {
      featuresStart = i;
      for (let j = i + 1; j < effectiveLines.length; j++) {
        if (/^\s*\[[^\]]+\]\s*(?:#.*)?$/.test(effectiveLines[j])) {
          featuresEnd = j;
          break;
        }
      }
      break;
    }
  }

  if (featuresStart === -1) {
    const next = [...effectiveLines];
    if (next.length > 0 && next.some((line) => line.trim() !== '')) next.push('');
    next.push('[features]', 'hooks = true');
    return next.join('\n') + '\n';
  }

  const before = effectiveLines.slice(0, featuresStart + 1);
  const section = effectiveLines.slice(featuresStart + 1, featuresEnd);
  const after = effectiveLines.slice(featuresEnd);
  let hasHooks = false;
  const updatedSection: string[] = [];

  for (const line of section) {
    if (/^\s*codex_hooks\s*=/.test(line)) continue;
    if (/^\s*hooks\s*=/.test(line)) {
      const indent = line.match(/^(\s*)/)?.[1] || '';
      updatedSection.push(`${indent}hooks = true`);
      hasHooks = true;
    } else {
      updatedSection.push(line);
    }
  }

  if (!hasHooks) updatedSection.unshift('hooks = true');
  return [...before, ...updatedSection, ...after].join('\n') + '\n';
}

function ensureCodexHooksFeature(codexDir: string): string {
  const configFile = path.join(codexDir, 'config.toml');
  if (!fs.existsSync(codexDir)) fs.mkdirSync(codexDir, { recursive: true });

  const existing = fs.existsSync(configFile) ? fs.readFileSync(configFile, 'utf8') : '';
  const next = enableCodexHooksFeatureToml(existing);
  if (next !== existing) fs.writeFileSync(configFile, next);
  return configFile;
}

export function installHooks(config: HooksConfig, options: InstallOptions = {}): string[] {
  const { target = 'both', scope = 'global', projectRoot } = options;
  const results: string[] = [];
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';

  if (scope === 'global') {
    if (wantsTrae(target)) {
      for (const dir of ['.trae', '.trae-cn']) {
        const traeFile = path.join(homeDir, dir, 'hooks.json');
        mergeAndWrite(traeFile, config, 'standalone');
        results.push(traeFile);
      }
    }
    if (wantsClaude(target)) {
      const claudeFile = path.join(homeDir, '.claude', 'settings.json');
      mergeAndWrite(claudeFile, config, 'nested');
      results.push(claudeFile);
    }
    if (wantsCodex(target)) {
      const codexDir = path.join(homeDir, '.codex');
      const codexFile = path.join(codexDir, 'hooks.json');
      mergeAndWrite(codexFile, config, 'standalone');
      results.push(codexFile);
      results.push(ensureCodexHooksFeature(codexDir));
    }
  } else {
    const root = projectRoot || getProjectDir();
    if (wantsTrae(target)) {
      const traeFile = path.join(root, '.trae', 'hooks.json');
      mergeAndWrite(traeFile, config, 'standalone');
      results.push(traeFile);
    }
    if (wantsClaude(target)) {
      const claudeFile = path.join(root, '.claude', 'settings.json');
      mergeAndWrite(claudeFile, config, 'nested');
      results.push(claudeFile);
    }
    if (wantsCodex(target)) {
      const codexDir = path.join(root, '.codex');
      const codexFile = path.join(codexDir, 'hooks.json');
      mergeAndWrite(codexFile, config, 'standalone');
      results.push(codexFile);
      results.push(ensureCodexHooksFeature(codexDir));
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
    if (wantsTrae(target)) {
      files.push(path.join(homeDir, '.trae', 'hooks.json'));
      files.push(path.join(homeDir, '.trae-cn', 'hooks.json'));
    }
    if (wantsClaude(target)) {
      files.push(path.join(homeDir, '.claude', 'settings.json'));
    }
    if (wantsCodex(target)) {
      files.push(path.join(homeDir, '.codex', 'hooks.json'));
    }
  } else {
    if (wantsTrae(target)) {
      files.push(path.join(root, '.trae', 'hooks.json'));
    }
    if (wantsClaude(target)) {
      files.push(path.join(root, '.claude', 'settings.json'));
    }
    if (wantsCodex(target)) {
      files.push(path.join(root, '.codex', 'hooks.json'));
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
