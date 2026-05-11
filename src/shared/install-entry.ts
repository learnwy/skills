import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  installHooks,
  uninstallHooks,
  type HooksConfig,
  type InstallOptions,
} from './hooks-lib.js';
import { parseArgs, type Command } from './cli.js';
import { createLogger } from './log.js';

function skillRoot(): string {
  return path.dirname(path.dirname(__filename));
}

function defaultConfigPath(): string {
  return path.join(skillRoot(), 'hooks.json');
}

function defaultSkillId(): string {
  return path.basename(skillRoot());
}

function resolveOptions(flags: Record<string, string | boolean>): InstallOptions {
  return {
    target: (flags.target as InstallOptions['target']) || 'both',
    scope: (flags.scope as InstallOptions['scope']) || 'global',
    projectRoot: typeof flags.root === 'string' ? path.resolve(flags.root) : process.cwd(),
  };
}

export const installCommand: Command = {
  description: 'Install IDE hooks from this skill into ~/.claude/, ~/.trae/, ~/.trae-cn/, and ~/.codex/',
  run: (args) => {
    const log = createLogger(defaultSkillId());
    const { flags } = parseArgs(args);
    const cfgPath = typeof flags.config === 'string' ? path.resolve(flags.config) : defaultConfigPath();
    if (!fs.existsSync(cfgPath)) {
      log.error(`install: hooks.json not found at ${cfgPath}`);
      console.error(`Error: hooks.json not found at ${cfgPath}`);
      process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(cfgPath, 'utf8')) as HooksConfig;
    const results = installHooks(config, resolveOptions(flags));
    log.info(`install: wrote ${results.length} target file(s)`);
    results.forEach((f) => console.log(`✅ Installed to: ${f}`));
  },
};

export const uninstallCommand: Command = {
  description: 'Remove this skill\'s hook entries from IDE config files',
  run: (args) => {
    const log = createLogger(defaultSkillId());
    const { flags } = parseArgs(args);
    const skillId = typeof flags['skill-id'] === 'string' ? (flags['skill-id'] as string) : defaultSkillId();
    uninstallHooks(skillId, resolveOptions(flags));
    log.info(`uninstall: removed entries matching ${skillId}`);
    console.log(`✅ Uninstalled hooks matching: ${skillId}`);
  },
};
