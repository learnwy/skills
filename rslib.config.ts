import { defineConfig } from '@rslib/core';

const cjsSkillEntries: Record<string, string[]> = {
  'english-learner': [
    'db',
    'vocab-manager',
    'quiz-manager',
    'sentence-parser',
    'migrate-from-json',
    'hooks/user-prompt-scan',
    'hooks/stop-response-scan',
  ],
  'llm-wiki': [
    'hooks/session-context',
    'hooks/auto-query',
  ],
  'prompt-optimizer': [
    'hooks/user-prompt-scan',
  ],
  'requirement-workflow': [
    'lib/common',
    'init',
    'advance',
    'status',
    'hooks',
  ],
  'knowledge-consolidation': [
    'get-knowledge-path',
  ],
  'project-agent-writer': [
    'init-agent',
  ],
  'project-skill-writer': [
    'init-skill',
  ],
  'trae-rules-writer': [
    'init-rule',
  ],
};

const cjsFilenameOverrides: Record<string, string> = {
  'project-agent-writer/scripts/init-agent': 'project-agent-writer/scripts/init_agent',
  'project-skill-writer/scripts/init-skill': 'project-skill-writer/scripts/init_skill',
  'trae-rules-writer/scripts/init-rule': 'trae-rules-writer/scripts/init_rule',
};

const esmSkillEntries: Record<string, string[]> = {
  'llm-wiki': [
    'lint/index',
    'generate-index/index',
    'generate-topics/index',
    'reorganize/index',
    'freshness-check/index',
    'stats/index',
  ],
};

const SHARED_INSTALL_SOURCE = './src/shared/install-entry.ts';

const SKILLS_WITH_HOOKS = new Set(['english-learner', 'llm-wiki', 'prompt-optimizer']);

const cjsEntry: Record<string, string> = {};
for (const [skill, files] of Object.entries(cjsSkillEntries)) {
  for (const file of files) {
    const entryKey = cjsFilenameOverrides[`${skill}/scripts/${file}`] || `${skill}/scripts/${file}`;
    cjsEntry[entryKey] = `./src/${skill}/${file}.ts`;
  }
  if (SKILLS_WITH_HOOKS.has(skill)) {
    cjsEntry[`${skill}/scripts/hooks/install`] = SHARED_INSTALL_SOURCE;
  }
}

const esmEntry: Record<string, string> = {};
for (const [skill, files] of Object.entries(esmSkillEntries)) {
  for (const file of files) {
    esmEntry[`${skill}/scripts/${file}`] = `./src/${skill}/${file}.ts`;
  }
}

const sharedNodeExternals = [
  'node:sqlite',
  'node:fs',
  'node:fs/promises',
  'node:path',
  'node:os',
];

export default defineConfig({
  lib: [
    {
      format: 'cjs',
      syntax: 'es2022',
      bundle: true,
      shims: { cjs: { 'import.meta.url': true } },
      source: { entry: cjsEntry },
      output: {
        target: 'node',
        distPath: { root: './skills' },
        filename: { js: '[name].cjs' },
        cleanDistPath: false,
        minify: false,
        externals: sharedNodeExternals,
      },
    },
    {
      format: 'esm',
      syntax: 'es2022',
      bundle: true,
      source: { entry: esmEntry },
      output: {
        target: 'node',
        distPath: { root: './skills' },
        filename: { js: '[name].mjs' },
        cleanDistPath: false,
        minify: false,
        externals: sharedNodeExternals,
      },
    },
  ],
});
