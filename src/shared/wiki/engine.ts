import { dispatch } from '../cli.js';
import { installCommand, uninstallCommand } from '../install-entry.js';
import { setSkin, type Skin } from './lib/skin.js';
import { command as init } from './cmd/init.js';
import { command as lint } from './cmd/lint.js';
import { command as generateIndex } from './cmd/generate-index.js';
import { command as generateTopics } from './cmd/generate-topics.js';
import { command as freshnessCheck } from './cmd/freshness-check.js';
import { command as healthCheck } from './cmd/health-check.js';
import { command as stats } from './cmd/stats.js';

// Bind the skin (default root + branding label) and dispatch the shared engine.
// Command bodies resolve their root via the active skin, so --root / --wiki-root
// still override and no command body is duplicated per skin.
export function runWikiCli(skin: Skin): void {
  setSkin(skin);
  dispatch({
    name: skin.name,
    commands: {
      init,
      lint,
      'generate-index': generateIndex,
      'generate-topics': generateTopics,
      'freshness-check': freshnessCheck,
      'health-check': healthCheck,
      stats,
      install: installCommand,
      uninstall: uninstallCommand,
    },
  });
}
