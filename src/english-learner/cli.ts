#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { installCommand, uninstallCommand } from '../shared/install-entry.js';
import { command as vocab } from './cmd/vocab.js';
import { command as quiz } from './cmd/quiz.js';
import { command as sentence } from './cmd/sentence.js';
import { command as migrate } from './cmd/migrate.js';
import { command as linkWiki } from './cmd/link-wiki.js';
import { command as report } from './cmd/report.js';
import { command as importCmd } from './cmd/import.js';
import { command as importStatus } from './cmd/import-status.js';

dispatch({
  name: 'english-learner',
  commands: {
    vocab,
    quiz,
    sentence,
    migrate,
    'link-wiki': linkWiki,
    report,
    import: importCmd,
    'import-status': importStatus,
    install: installCommand,
    uninstall: uninstallCommand,
  },
});
