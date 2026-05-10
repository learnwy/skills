import { defineConfig } from '@rstest/core';
import { withRslibConfig } from '@rstest/adapter-rslib';

export default defineConfig({
  extends: withRslibConfig(),
  testEnvironment: 'node',
  include: ['tests/**/*.test.ts'],
});
