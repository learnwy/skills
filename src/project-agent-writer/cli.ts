#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { command as init } from './cmd/init.js';

dispatch({
  name: 'project-agent-writer',
  commands: { init },
});
