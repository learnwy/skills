export type Phase =
  | 'INIT'
  | 'DEFINING'
  | 'PLANNING'
  | 'DESIGNING'
  | 'IMPLEMENTING'
  | 'TESTING'
  | 'DELIVERING'
  | 'DONE';

export type Lifecycle = 'lite' | 'standard' | 'full';

export const LIFECYCLES: Record<Lifecycle, Phase[]> = {
  lite: ['INIT', 'IMPLEMENTING', 'TESTING', 'DONE'],
  standard: ['INIT', 'PLANNING', 'IMPLEMENTING', 'TESTING', 'DONE'],
  full: ['INIT', 'DEFINING', 'PLANNING', 'DESIGNING', 'IMPLEMENTING', 'TESTING', 'DELIVERING', 'DONE'],
};

export type Checkpoint = 'never' | 'always';

export interface PhaseSpec {
  phase: Phase;
  purpose: string;
  inputs: string[];
  outputs: string[];
  defaultAgent: string | null;
  optionalAgents: string[];
  briefSections: string[];
  checkpoint: Checkpoint;
  hint: string;
}

export const PHASES: Record<Phase, PhaseSpec> = {
  INIT: {
    phase: 'INIT',
    purpose: 'Workflow scaffolded; no artifacts yet.',
    inputs: [],
    outputs: ['state.json'],
    defaultAgent: null,
    optionalAgents: [],
    briefSections: [],
    checkpoint: 'never',
    hint: 'Run `cli.cjs advance` to enter the first working phase.',
  },
  DEFINING: {
    phase: 'DEFINING',
    purpose: 'Translate the raw request into a structured spec with EARS acceptance criteria.',
    inputs: [],
    outputs: ['spec.md'],
    defaultAgent: 'problem-definer',
    optionalAgents: ['iron-audit-pm', 'risk-auditor', 'spec-by-example'],
    briefSections: ['user-request', 'similar-past-specs', 'glossary', 'risk-keywords'],
    checkpoint: 'always',
    hint: 'Edit spec.md so it has scope, ≥3 EARS criteria, and explicit out-of-scope.',
  },
  PLANNING: {
    phase: 'PLANNING',
    purpose: 'Decompose spec (or request) into atomic, traceable tasks.',
    inputs: ['spec.md'],
    outputs: ['tasks.md'],
    defaultAgent: 'story-mapper',
    optionalAgents: ['mvp-freeze-architect'],
    briefSections: ['spec-summary', 'code-map', 'capacity-hint'],
    checkpoint: 'never',
    hint: 'Edit tasks.md: every AC maps to ≥1 task; each task touches ≤5 files.',
  },
  DESIGNING: {
    phase: 'DESIGNING',
    purpose: 'Lock cross-cutting decisions (data flow, contracts, NFRs) before code.',
    inputs: ['spec.md', 'tasks.md'],
    outputs: ['design.md'],
    defaultAgent: 'architecture-advisor',
    optionalAgents: ['domain-modeler', 'responsibility-modeler'],
    briefSections: ['spec', 'tasks', 'arch-snapshot', 'nfrs', 'conventions'],
    checkpoint: 'always',
    hint: 'Edit design.md: components, data flow, API contracts, key trade-offs.',
  },
  IMPLEMENTING: {
    phase: 'IMPLEMENTING',
    purpose: 'Execute tasks one by one; each commit traces to a task → AC.',
    inputs: ['tasks.md'],
    outputs: ['code', 'traceability.md'],
    defaultAgent: 'tdd-coach',
    optionalAgents: ['refactoring-guide', 'legacy-surgeon'],
    briefSections: ['current-task', 'touched-files', 'conventions', 'test-fixtures'],
    checkpoint: 'never',
    hint: 'Pick next unchecked task in tasks.md; implement; mark `[x]`; rebuild traceability.',
  },
  TESTING: {
    phase: 'TESTING',
    purpose: 'Validate every AC; checklist.md must be fully checked.',
    inputs: ['tasks.md', 'spec.md'],
    outputs: ['checklist.md'],
    defaultAgent: 'test-strategist',
    optionalAgents: ['test-strategy-advisor', 'code-reviewer', 'error-analyzer'],
    briefSections: ['changed-files', 'ac-list', 'test-patterns'],
    checkpoint: 'always',
    hint: 'Run lint, typecheck, tests; check off checklist.md items as they pass.',
  },
  DELIVERING: {
    phase: 'DELIVERING',
    purpose: 'Final review against the original spec; ready to ship.',
    inputs: ['spec.md', 'tasks.md', 'checklist.md', 'traceability.md'],
    outputs: ['summary.md'],
    defaultAgent: 'tech-design-reviewer',
    optionalAgents: ['code-reviewer'],
    briefSections: ['original-spec', 'change-summary', 'open-issues'],
    checkpoint: 'always',
    hint: 'Generate summary.md; confirm every AC is verified.',
  },
  DONE: {
    phase: 'DONE',
    purpose: 'Workflow complete.',
    inputs: [],
    outputs: [],
    defaultAgent: null,
    optionalAgents: [],
    briefSections: [],
    checkpoint: 'never',
    hint: 'Workflow finished. Archive artifacts or start a new one.',
  },
};

export function nextPhase(lifecycle: Lifecycle, current: Phase): Phase | null {
  const order = LIFECYCLES[lifecycle];
  const idx = order.indexOf(current);
  if (idx === -1 || idx >= order.length - 1) return null;
  return order[idx + 1];
}

export function priorPhase(lifecycle: Lifecycle, current: Phase): Phase | null {
  const order = LIFECYCLES[lifecycle];
  const idx = order.indexOf(current);
  if (idx <= 0) return null;
  return order[idx - 1];
}

export function isValidLifecycle(value: string): value is Lifecycle {
  return value === 'lite' || value === 'standard' || value === 'full';
}

export function isPhaseInLifecycle(lifecycle: Lifecycle, phase: Phase): boolean {
  return LIFECYCLES[lifecycle].includes(phase);
}
