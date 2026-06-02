#!/usr/bin/env node
import { sessionContext } from '../../shared/wiki/hooks/session-context.js';
import { setSkin } from '../../shared/wiki/lib/skin.js';
import { DEFAULT_SELF_ROOT } from '../../shared/wiki/lib/skin.js';

setSkin({ name: 'self', label: 'self', defaultRoot: DEFAULT_SELF_ROOT });
sessionContext(DEFAULT_SELF_ROOT).catch(() => process.exit(0));
