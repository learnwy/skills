#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Read JSON input from stdin (hook payload).
 * @returns {Promise<object>} Parsed JSON from stdin
 */
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

/**
 * Get the project root from env vars (works in both Trae and Claude Code).
 * @returns {string} Project root path
 */
function getProjectDir() {
  return process.env.TRAE_PROJECT_DIR || process.env.CLAUDE_PROJECT_DIR || process.cwd();
}

/**
 * Output a structured JSON response to stdout.
 * @param {object} output - The hook output object
 */
function respond(output) {
  process.stdout.write(JSON.stringify(output));
}

/**
 * Output plain text to stdout (for SessionStart/UserPromptSubmit context injection).
 * @param {string} text - Context text to inject
 */
function injectContext(text) {
  process.stdout.write(text);
}

/**
 * Block the action with a reason (exit code 0 + JSON decision).
 * @param {string} reason - Why the action is blocked
 */
function block(reason) {
  respond({ decision: 'block', reason });
}

/**
 * Deny a PreToolUse with a reason.
 * @param {string} reason - Why the tool call is denied
 */
function deny(reason) {
  respond({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason
    }
  });
}

/**
 * Allow with additional context.
 * @param {string} context - Additional context for the model
 */
function allowWithContext(context) {
  respond({
    hookSpecificOutput: {
      hookEventName: process.env._HOOK_EVENT || 'PostToolUse',
      additionalContext: context
    }
  });
}

/**
 * Generate a hooks.json config object.
 * @param {object} hooks - Map of event names to hook group arrays
 * @returns {object} Standard hooks.json structure
 */
function buildHooksConfig(hooks) {
  return { version: 1, hooks };
}

/**
 * Install hooks config to the appropriate location.
 * @param {object} config - The hooks config object
 * @param {object} options - { target: 'trae'|'claude'|'both', scope: 'global'|'project', projectRoot?: string }
 */
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

/**
 * Merge hooks config into an existing file (or create it).
 * @param {string} filePath - Target file path
 * @param {object} config - Hooks config to merge
 * @param {string} mode - 'standalone' (write as-is) or 'nested' (merge into settings.hooks)
 */
function mergeAndWrite(filePath, config, mode) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (mode === 'standalone') {
    let existing = {};
    if (fs.existsSync(filePath)) {
      try { existing = JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (e) {}
    }
    // Merge hook events (don't overwrite other events)
    existing.version = config.version || 1;
    existing.hooks = existing.hooks || {};
    for (const [event, groups] of Object.entries(config.hooks || {})) {
      existing.hooks[event] = existing.hooks[event] || [];
      // Avoid duplicates by checking command strings
      for (const group of groups) {
        const isDup = existing.hooks[event].some(g => 
          JSON.stringify(g) === JSON.stringify(group)
        );
        if (!isDup) existing.hooks[event].push(group);
      }
    }
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2) + '\n');
  } else {
    // nested mode: merge into settings.json { hooks: {...} }
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

/**
 * Uninstall hooks that match a given skill identifier.
 * @param {string} skillId - Command substring to match for removal
 * @param {object} options - { target, scope, projectRoot }
 */
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
