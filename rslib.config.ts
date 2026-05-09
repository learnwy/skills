import { defineConfig } from '@rslib/core';

const skillEntries: Record<string, string[]> = {
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

const SHARED_INSTALL_SOURCE = './src/shared/install-entry.ts';

const entry: Record<string, string> = {};
for (const [skill, files] of Object.entries(skillEntries)) {
  for (const file of files) {
    entry[`${skill}/scripts/${file}`] = `./src/${skill}/${file}.ts`;
  }
  entry[`${skill}/scripts/hooks/install`] = SHARED_INSTALL_SOURCE;
}

export default defineConfig({
  source: { entry },
  lib: [
    {
      format: 'cjs',
      syntax: 'es2022',
      bundle: true,
      shims: { cjs: { 'import.meta.url': true } },
      output: {
        target: 'node',
        distPath: { root: './skills' },
        filename: { js: '[name].cjs' },
        cleanDistPath: false,
        minify: false,
      },
    },
  ],
  output: {
    externals: ['node:sqlite', 'node:fs', 'node:path', 'node:os'],
  },
});
