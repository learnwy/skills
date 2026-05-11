#!/usr/bin/env node
import { dispatch } from '../shared/cli.js';
import { command as init } from './cmd/init.js';
import { command as advance } from './cmd/advance.js';
import { command as status } from './cmd/status.js';
import { command as escalate } from './cmd/escalate.js';
import { command as trace } from './cmd/trace.js';
import { command as brief } from './cmd/brief.js';
import { command as hooks } from './cmd/hooks.js';

dispatch({
  name: 'requirement-workflow',
  commands: {
    init,
    advance,
    status,
    escalate,
    trace,
    brief,
    hooks,
  },
});
