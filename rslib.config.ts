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

const cjsEntry: Record<string, string> = {};
for (const [skill, files] of Object.entries(cjsSkillEntries)) {
  for (const file of files) {
    cjsEntry[`${skill}/scripts/${file}`] = `./src/${skill}/${file}.ts`;
  }
  cjsEntry[`${skill}/scripts/hooks/install`] = SHARED_INSTALL_SOURCE;
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
