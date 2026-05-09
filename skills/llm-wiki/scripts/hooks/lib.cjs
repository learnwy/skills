#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
    process.stdin.on('error', reject);
  });
}

function getProjectDir() {
  return process.env.TRAE_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

function respond(output) {
  process.stdout.write(JSON.stringify(output));
}

function injectContext(text) {
  process.stdout.write(text);
}

function block(reason) {
  respond({ decision: 'block', reason });
}

function deny(reason) {
  respond({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  });
}

function allowWithContext(context) {
  respond({
    hookSpecificOutput: {
      hookEventName: process.env._HOOK_EVENT || 'PostToolUse',
      additionalContext: context
    }
  });
}

function buildHooksConfig(hooks) {
  return { version: 1, hooks };
}

function installHooks(config, options = {}) {
  const { target = 'both', scope = 'global', projectRoot } = options;
  const results = [];

  if (scope === 'global') {
    const homeDir = process.env.HOME || process.env.USERPROFILE;

    if (target === 'trae' || target === 'both') {
      const traeFile = path.join(homeDir, '.trae', 'hooks.json');
      mergeAndWrite(traeFile, config, 'standalone');
      results.push(traeFile);
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

function mergeAndWrite(filePath, config, mode) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (mode === 'standalone') {
    let existing = {};
    if (fs.existsSync(filePath)) {
      try { existing = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) {}
    }
    existing.version = config.version || 1;
    existing.hooks = existing.hooks || {};
    for (const [event, groups] of Object.entries(config.hooks || {})) {
      existing.hooks[event] = existing.hooks[event] || [];
      for (const group of groups) {
        const isDup = existing.hooks[event].some(g => 
          JSON.stringify(g) === JSON.stringify(group)
        );
        if (!isDup) existing.hooks[event].push(group);
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
  } else {
    let settings = {};
    if (fs.existsSync(filePath)) {
      try { settings = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) {}
    }
    settings.hooks = settings.hooks || {};
    for (const [event, groups] of Object.entries(config.hooks || {})) {
      settings.hooks[event] = settings.hooks[event] || [];
      for (const group of groups) {
        const isDup = settings.hooks[event].some(g =>
          JSON.stringify(g) === JSON.stringify(group)
        );
        if (!isDup) settings.hooks[event].push(group);
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2) + '\n');
  }
}

function uninstallHooks(skillId, options = {}) {
  const { target = 'both', scope = 'global', projectRoot } = options;
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  const root = projectRoot || getProjectDir();

  const files = [];
  if (scope === 'global') {
    if (target === 'trae' || target === 'both') files.push(path.join(homeDir, '.trae', 'hooks.json'));
    if (target === 'claude' || target === 'both') files.push(path.join(homeDir, '.claude', 'settings.json'));
  } else {
    if (target === 'trae' || target === 'both') files.push(path.join(root, '.trae', 'hooks.json'));
    if (target === 'claude' || target === 'both') files.push(path.join(root, '.claude', 'settings.json'));
  }

  for (const filePath of files) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const hooks = filePath.endsWith('settings.json') ? content.hooks : content.hooks;
      if (!hooks) continue;

      for (const [event, groups] of Object.entries(hooks)) {
        hooks[event] = groups.filter(g => {
          const cmds = (g.hooks || []).map(h => h.command || '');
          return !cmds.some(cmd => cmd.includes(skillId));
        });
        if (hooks[event].length === 0) delete hooks[event];
      }

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    } catch (e) {}
  }
}

module.exports = {
  readStdin,
  getProjectDir,
  respond,
  injectContext,
  block,
  deny,
  allowWithContext,
  buildHooksConfig,
  installHooks,
  mergeAndWrite,
  uninstallHooks
};
