import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type { Command } from '../../shared/cli.js';
import { parseArgs } from '../../shared/cli.js';

type Status = 'ok' | 'warn' | 'error';

interface Check {
  name: string;
  status: Status;
  detail: string;
}

const HOME = os.homedir();
const LEARNWY_ROOT = path.join(HOME, '.learnwy');
const CLAUDE_SETTINGS = path.join(HOME, '.claude', 'settings.json');
const TRAE_HOOKS = path.join(HOME, '.trae', 'hooks.json');
const CODEX_HOOKS = path.join(HOME, '.codex', 'hooks.json');
const CODEX_CONFIG = path.join(HOME, '.codex', 'config.toml');

const REQUIRED_DISPATCHER_HOOKS = ['UserPromptSubmit', 'Stop', 'SessionStart'];

function checkNode(): Check {
  const major = parseInt(process.versions.node.split('.')[0] ?? '0', 10);
  if (major >= 22) return { name: 'Node version', status: 'ok', detail: `${process.version} (≥ 22 required)` };
  return { name: 'Node version', status: 'error', detail: `${process.version} — too old; upgrade to ≥ 22` };
}

interface SettingsHooks {
  hooks?: Record<string, Array<{ hooks?: Array<{ command?: string }> }>>;
}

function readHooksConfig(file: string): SettingsHooks | null {
  if (!fs.existsSync(file)) return null;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8')) as SettingsHooks;
  } catch {
    return null;
  }
}

function hookCommands(cfg: SettingsHooks | null, event: string): string[] {
  if (!cfg?.hooks?.[event]) return [];
  const out: string[] = [];
  for (const g of cfg.hooks[event]) {
    for (const h of g.hooks || []) {
      if (h.command) out.push(h.command);
    }
  }
  return out;
}

function checkHookRegistration(file: string, label: string): Check[] {
  const cfg = readHooksConfig(file);
  if (!cfg) {
    return [{ name: `${label} hooks`, status: 'warn', detail: `${file} not present (skill not yet installed for this IDE?)` }];
  }
  const checks: Check[] = [];
  for (const event of REQUIRED_DISPATCHER_HOOKS) {
    const cmds = hookCommands(cfg, event);
    const dispatcher = cmds.find((c) => c.includes('learnwy-dispatch'));
    const stale = cmds.filter((c) =>
      ['llm-wiki/scripts/hooks', 'prompt-optimizer/scripts/hooks',
       'knowledge-consolidation/scripts/hooks', 'learnwy-status/scripts/hooks'].some((p) => c.includes(p)),
    );
    if (!dispatcher) {
      checks.push({ name: `${label} ${event}`, status: 'error', detail: 'learnwy-dispatch hook missing — run `pnpm run install:hooks`' });
    } else if (stale.length) {
      checks.push({ name: `${label} ${event}`, status: 'warn', detail: `${stale.length} stale per-skill entry/entries — run \`pnpm run install:hooks\` (idempotent sweep clears them)` });
    } else {
      checks.push({ name: `${label} ${event}`, status: 'ok', detail: 'dispatcher registered' });
    }
  }
  return checks;
}

function readFeatureValue(toml: string, key: string): string | null {
  const lines = toml.replace(/\r\n/g, '\n').split('\n');
  let inFeatures = false;
  for (const line of lines) {
    if (/^\s*\[features\]\s*(?:#.*)?$/.test(line)) {
      inFeatures = true;
      continue;
    }
    if (inFeatures && /^\s*\[[^\]]+\]\s*(?:#.*)?$/.test(line)) break;
    if (!inFeatures) continue;
    const match = line.match(new RegExp(`^\\s*${key}\\s*=\\s*([^#]+)`));
    if (match) return match[1].trim();
  }
  return null;
}

function checkCodexFeatureFlag(): Check {
  if (!fs.existsSync(CODEX_CONFIG)) {
    return { name: 'Codex hooks feature', status: 'ok', detail: 'default enabled (no ~/.codex/config.toml)' };
  }
  try {
    const toml = fs.readFileSync(CODEX_CONFIG, 'utf8');
    const hooks = readFeatureValue(toml, 'hooks');
    const legacyHooks = readFeatureValue(toml, 'codex_hooks');
    if (hooks === 'false') {
      return { name: 'Codex hooks feature', status: 'error', detail: '`[features].hooks = false` disables hooks — run `pnpm run install:hooks`' };
    }
    if (legacyHooks !== null) {
      return { name: 'Codex hooks feature', status: 'warn', detail: '`codex_hooks` is deprecated — run `pnpm run install:hooks` to migrate to `hooks = true`' };
    }
    if (hooks === 'true') {
      return { name: 'Codex hooks feature', status: 'ok', detail: '`[features].hooks = true`' };
    }
    return { name: 'Codex hooks feature', status: 'ok', detail: 'default enabled' };
  } catch (err) {
    return { name: 'Codex hooks feature', status: 'warn', detail: `cannot read ${CODEX_CONFIG}: ${(err as Error).message}` };
  }
}

function checkPathLayout(): Check[] {
  const required = ['llm-wiki', path.join('.var', 'logs')];
  const checks: Check[] = [];
  for (const sub of required) {
    const p = path.join(LEARNWY_ROOT, sub);
    checks.push({
      name: `~/.learnwy/${sub}/`,
      status: fs.existsSync(p) ? 'ok' : 'warn',
      detail: fs.existsSync(p) ? 'present' : 'missing — will be created when the subsystem first runs',
    });
  }
  return checks;
}

function checkBundles(): Check[] {
  const agents = path.join(HOME, '.agents', 'skills');
  if (!fs.existsSync(agents)) {
    return [{ name: 'global skills install', status: 'warn', detail: '~/.agents/skills/ missing — run `pnpm run release` or `pnpm dlx skills install -g -y learnwy/skills`' }];
  }
  const required = ['learnwy-dispatch/scripts/hooks/user-prompt-submit.cjs', 'learnwy-dispatch/scripts/hooks/stop.cjs', 'learnwy-dispatch/scripts/hooks/session-start.cjs'];
  const missing = required.filter((p) => !fs.existsSync(path.join(agents, p)));
  if (missing.length === 0) return [{ name: 'dispatcher bundles', status: 'ok', detail: 'all 3 dispatcher cjs present in ~/.agents/' }];
  return [{ name: 'dispatcher bundles', status: 'error', detail: `${missing.length} missing under ~/.agents/skills/ — re-run release: ${missing.join(', ')}` }];
}

export function runDoctor(): Check[] {
  const checks: Check[] = [];
  checks.push(checkNode());
  checks.push(...checkHookRegistration(CLAUDE_SETTINGS, 'Claude'));
  checks.push(...checkHookRegistration(TRAE_HOOKS, 'Trae'));
  checks.push(...checkHookRegistration(CODEX_HOOKS, 'Codex'));
  checks.push(checkCodexFeatureFlag());
  checks.push(...checkPathLayout());
  checks.push(...checkBundles());
  return checks;
}

const SYMBOL: Record<Status, string> = { ok: '✓', warn: '⚠', error: '✗' };

function format(checks: Check[]): { text: string; exit: number } {
  const lines: string[] = ['learnwy doctor — system health check', ''];
  let warnings = 0;
  let errors = 0;
  const nameWidth = Math.max(...checks.map((c) => c.name.length));
  for (const c of checks) {
    if (c.status === 'warn') warnings++;
    if (c.status === 'error') errors++;
    lines.push(`  ${SYMBOL[c.status]} ${c.name.padEnd(nameWidth)}  ${c.detail}`);
  }
  lines.push('');
  if (errors === 0 && warnings === 0) {
    lines.push('All systems healthy.');
  } else {
    lines.push(`Summary: ${checks.length} checks, ${warnings} warning(s), ${errors} error(s).`);
  }
  return { text: lines.join('\n'), exit: errors > 0 ? 1 : 0 };
}

export const command: Command = {
  description: 'System health check across ~/.learnwy/ subsystems and hook registrations',
  run: (args) => {
    const { flags } = parseArgs(args);
    const checks = runDoctor();
    if (flags.json) {
      console.log(JSON.stringify({ checks }, null, 2));
      const errors = checks.filter((c) => c.status === 'error').length;
      process.exit(errors > 0 ? 1 : 0);
    } else {
      const { text, exit } = format(checks);
      console.log(text);
      process.exit(exit);
    }
  },
};
