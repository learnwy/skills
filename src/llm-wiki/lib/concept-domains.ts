import { readFile } from 'node:fs/promises';

export interface DomainRule {
  dir: string;
  match: string[];
}

export const DOMAIN_MAP: DomainRule[] = [
  { dir: 'frontend', match: ['frontend engineering', 'react', 'web ', 'css', 'tailwind', 'rsbuild', 'rspack', 'webpack', 'html', 'browser', 'dom ', 'typescript'] },
  { dir: 'ios', match: ['ios development', 'ios ', 'swift', 'swiftui', 'uikit', 'xcode', 'apple'] },
  { dir: 'android', match: ['android development', 'android ', 'kotlin', 'jetpack', 'gradle'] },
  { dir: 'go', match: ['go bff', 'go ', 'golang', 'gin '] },
  { dir: 'system-design', match: ['system design', 'distributed system'] },
  { dir: 'ai-ml', match: ['ai/ml', 'artificial intelligence', 'machine learning', 'deep learning', 'llm', 'transformer'] },
  { dir: 'devops', match: ['devops', 'ci/cd', 'deployment', 'observability', 'monitoring'] },
  { dir: 'architecture', match: ['software engineering / design', 'software engineering / architecture', 'software engineering / production', 'software engineering / api', 'software design', 'design pattern', 'software engineering / process', 'software engineering / reactive'] },
  { dir: 'se-practices', match: ['software engineering', 'software testing', 'testing', 'code review', 'refactoring', 'legacy code', 'technical debt'] },
  { dir: 'cs-fundamentals', match: ['computer science', 'networking', 'algorithm', 'data structure', 'hardware'] },
  { dir: 'philosophy', match: ['philosophy', 'ethics', 'existential', 'taoism', 'stoic'] },
  { dir: 'psychology', match: ['psychology', 'behavior', 'cognitive', 'mindset', 'habit', 'motivation', 'meaning'] },
  { dir: 'social-sciences', match: ['sociology', 'history', 'anthropology', 'education', 'political', 'economics', 'social'] },
  { dir: 'methodology', match: ['methodology', 'strategy', 'contradiction', 'practice', 'protracted', 'decision-making'] },
  { dir: 'natural-sciences', match: ['physics', 'chemistry', 'biology', 'mathematics', 'ecology', 'energy', 'environmental'] },
  { dir: 'health-medicine', match: ['medicine', 'medical', 'public health', 'traditional chinese', 'nursing', 'veterinary', 'anatomy'] },
  { dir: 'design-ux', match: ['design', 'ux', 'ui/ux', 'usability', 'human-computer'] },
  { dir: 'writing-comm', match: ['writing', 'communication', 'literature', 'linguistics'] },
  { dir: 'business', match: ['management', 'leadership', 'career', 'finance', 'investing', 'marketing'] },
  { dir: 'agriculture', match: ['agronomy', 'forestry', 'horticulture', 'aquaculture', 'farming', 'animal husbandry'] },
  { dir: 'cross-platform', match: ['cross-platform'] },
];

export interface FilenameRule {
  dir: string;
  patterns: string[];
}

export const FILENAME_MAP: FilenameRule[] = [
  { dir: 'frontend', patterns: ['react-', 'css-', 'tailwind-', 'rsbuild-', 'rspack-', 'webpack-', 'web-', 'dom-', 'ts-', 'lcp-', 'cls-', 'inp-', 'virtual-dom', 'streaming-ssr', 'server-component', 'use-transition', 'concurrent-mode', 'suspense-', 'module-federation', 'micro-frontend', 'shared-dependencies'] },
  { dir: 'ios', patterns: ['ios-', 'swift-', 'swiftui-', 'uikit-', 'xcode-', 'navigation-stack', 'hosting-controller', 'uiviewrepresentable', 'scene-lifecycle', 'coordinator-pattern', 'spm-modularization', 'clean-architecture-ios', 'deep-linking-ios', 'dependency-injection-ios', 'actor-isolation', 'sendable-protocol', 'structured-concurrency'] },
  { dir: 'android', patterns: ['android-', 'kotlin-', 'compose-', 'recyclerview-', 'activity-lifecycle', 'stateflow-', 'diffutil-', 'coroutine-', 'proguard-'] },
  { dir: 'go', patterns: ['go-', 'gin-', 'context-propagation-go', 'sentinel-errors-go', 'error-wrapping-go', 'panic-recovery-go', 'vo-vs-dto', 'response-envelope', 'field-mask-', 'protobuf-vs-json', 'api-versioning-go', 'error-code-standard', 'request-id-tracing'] },
  { dir: 'system-design', patterns: ['rate-limiter-', 'url-shortener-', 'notification-system-', 'chat-system-', 'consistent-hashing', 'vector-clocks', 'consensus-', 'cap-theorem', 'eventual-consistency', 'partition-tolerance', 'write-ahead-log', 'data-replication'] },
  { dir: 'ai-ml', patterns: ['transformer-', 'attention-', 'llm-', 'rlhf-', 'prompt-', 'ai-', 'batch-vs-realtime-'] },
  { dir: 'philosophy', patterns: ['eudaimonia', 'golden-mean', 'practical-wisdom', 'dasein', 'being-in-the-world', 'temporality-', 'wu-wei', 'the-tao', 'simplicity-and-naturalness', 'stoic-', 'dichotomy-of-control', 'memento-mori', 'virtu-and-fortuna'] },
  { dir: 'psychology', patterns: ['growth-mindset', 'fixed-mindset', 'flow-state', 'habit-', 'logotherapy', 'will-to-meaning', 'meaning-through-', 'autotelic-', 'challenge-skill-', 'identity-based-', 'two-minute-rule', 'effort-as-path', 'lollapalooza-effect'] },
  { dir: 'methodology', patterns: ['principal-contradiction', 'unity-of-opposites', 'two-point-', 'stage-theory', 'unity-of-knowing', 'yin-yang', 'strategic-', 'guerrilla-', 'mass-line', 'base-area', 'protracted-war', 'self-reliance'] },
  { dir: 'se-practices', patterns: ['code-smell', 'refactoring-', 'test-list', 'walking-skeleton', 'release-slicing', 'assert-first', 'getting-to-green', 'two-hats-rule', 'characterization-test', 'seam-', 'feature-envy', 'legacy-code', 'working-effectively', 'technical-debt', 'on-call-', 'code-review-', 'writing-design-docs', 'trunk-based-', 'feature-flags-', 'canary-deployment'] },
  { dir: 'architecture', patterns: ['bounded-context', 'ubiquitous-language', 'aggregate-design', 'domain-event', 'anti-corruption-layer', 'strangler-fig', 'information-hiding', 'deep-vs-shallow', 'abstraction-barrier', 'circuit-breaker', 'bulkhead-', 'sidecar-', 'ambassador-', 'scatter-gather', 'steady-state-', 'timeout-pattern', 'observer-pattern', 'strategy-pattern', 'decorator-pattern', 'factory-pattern', 'composite-pattern', 'singleton-', 'adapter-', 'command-pattern', 'architecture-quantum', 'architecture-styles', 'architecture-decision', 'architecture-fitness', 'architecture-characteristics'] },
  { dir: 'devops', patterns: ['twelve-factor', 'config-via-environment', 'stateless-processes', 'port-binding', 'three-pillars-observability', 'distributed-tracing', 'structured-logging', 'cicd-'] },
  { dir: 'cs-fundamentals', patterns: ['von-neumann', 'memory-hierarchy', 'instruction-pipeline', 'tcp-ip-', 'http2-http3', 'dns-resolution', 'debounce-throttle', 'tree-traversal'] },
  { dir: 'business', patterns: ['staff-engineer', 'technical-vision', 'being-visible', 'sponsor-network', 'systems-thinking-engineering', 'team-growth', 'migrations-strategy', 'organizational-design', 'contribution-focus', 'circle-of-competence', 'mental-models'] },
  { dir: 'writing-comm', patterns: ['active-verbs', 'unity-in-writing', 'conciseness-'] },
  { dir: 'cross-platform', patterns: ['native-vs-cross-platform', 'shared-business-logic', 'platform-specific-ui', 'cross-platform'] },
  { dir: 'social-sciences', patterns: ['cognitive-revolution', 'agricultural-revolution-trap', 'imagined-orders', 'paradigm-shift', 'normal-science', 'scientific-crisis', 'social-capital', 'civic-engagement', 'bridging-vs-bonding', 'sociological-imagination', 'banking-model-', 'critical-consciousness'] },
  { dir: 'design-ux', patterns: ['norman-door', 'affordance', 'usability-'] },
];

export const BOOK_DOMAIN_MAP: Record<string, string> = {
  'clean-code': 'se-practices', refactoring: 'se-practices', 'the-pragmatic-programmer': 'se-practices',
  'working-effectively-with-legacy-code': 'se-practices', 'test-driven-development': 'se-practices',
  'lessons-learned-in-software-testing': 'se-practices', 'the-missing-readme': 'se-practices',
  'domain-driven-design': 'architecture', 'a-philosophy-of-software-design': 'architecture',
  'fundamentals-of-software-architecture': 'architecture', 'head-first-design-patterns': 'architecture',
  'designing-distributed-systems': 'architecture', 'release-it': 'architecture',
  'designing-data-intensive-applications': 'system-design', 'system-design-interview': 'system-design',
  'user-story-mapping': 'se-practices', 'are-your-lights-on': 'se-practices',
  'on-writing-well': 'writing-comm', 'the-elements-of-style': 'writing-comm',
  'poor-charlies-almanack': 'business', 'the-effective-executive': 'business',
  'staff-engineer': 'business', 'an-elegant-puzzle': 'business',
  'on-contradiction': 'methodology', 'on-practice': 'methodology', 'on-protracted-war': 'methodology',
  'thinking-fast-and-slow': 'psychology', influence: 'psychology',
  meditations: 'philosophy', 'the-prince': 'philosophy',
};

const META_SCAN_LINES = 15;

export async function extractDiscipline(filePath: string): Promise<string> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n').slice(0, META_SCAN_LINES);
    for (const line of lines) {
      if (line.startsWith('**Discipline**:')) return line.split(':').slice(1).join(':').trim();
      if (line.startsWith('**Platform**:')) return line.split(':').slice(1).join(':').trim();
    }
  } catch {
    /* empty */
  }
  return '';
}

export function classifyByDiscipline(discipline: string): string {
  const d = discipline.toLowerCase();
  for (const { dir, match } of DOMAIN_MAP) {
    if (match.some((m) => d.includes(m))) return dir;
  }
  return '_general';
}

export function classifyByFilename(filename: string): string | null {
  const slug = filename.replace('.md', '').toLowerCase();
  for (const { dir, patterns } of FILENAME_MAP) {
    if (patterns.some((p) => slug.startsWith(p) || slug === p || slug.includes(p))) return dir;
  }
  return null;
}

export async function classifyBySourceLinks(filePath: string): Promise<string | null> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const summaryLinks = [...content.matchAll(/\[\[summaries\/([^\]]+)\]\]/g)].map((m) => m[1]);
    if (summaryLinks.length === 0) return null;
    for (const link of summaryLinks) {
      const slug = link.replace('.md', '');
      if (BOOK_DOMAIN_MAP[slug]) return BOOK_DOMAIN_MAP[slug];
    }
  } catch {
    /* empty */
  }
  return null;
}

export async function classifyConcept(filePath: string, filename: string): Promise<string> {
  const discipline = await extractDiscipline(filePath);
  let domain: string | null = discipline ? classifyByDiscipline(discipline) : null;

  if (!domain || domain === '_general') {
    const byName = classifyByFilename(filename);
    if (byName) domain = byName;
  }

  if (!domain || domain === '_general') {
    const bySource = await classifyBySourceLinks(filePath);
    if (bySource) domain = bySource;
    else domain = domain || '_general';
  }

  return domain;
}
