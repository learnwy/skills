import * as fs from 'node:fs';
import * as path from 'node:path';

export type Target = 'trae' | 'claude' | 'both';

export interface HooksConfig {
  version: number;
  hooks: Record<string, unknown[]>;
}

const SESSION_INIT = `bash -c '
ROOT="\${TRAE_PROJECT_DIR:-\${CLAUDE_PROJECT_DIR:-$PWD}}"
ACTIVE="$ROOT/.agents/active_workflow"
[ -f "$ACTIVE" ] || ACTIVE="$ROOT/.trae/active_workflow"
[ -f "$ACTIVE" ] || exit 0
WF=$(cat "$ACTIVE")
STATE="$WF/state.json"
[ -f "$STATE" ] || exit 0
echo "## Active requirement workflow"
echo ""
PHASE=$(grep -o "\\"phase\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
LIFE=$(grep -o "\\"lifecycle\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
NAME=$(grep -o "\\"name\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
echo "- Workflow: $NAME"
echo "- Phase:    $PHASE  (lifecycle: $LIFE)"
BRIEF="$WF/briefs/$PHASE.md"
[ -f "$BRIEF" ] && echo "- Brief:    $BRIEF (read this before working on the phase)"
echo ""
echo "Run \\\`node scripts/cli.cjs status -r .\\\` for full status."
'`;

const QUALITY_GATE = `bash -c '
ROOT="\${TRAE_PROJECT_DIR:-\${CLAUDE_PROJECT_DIR:-$PWD}}"
ACTIVE="$ROOT/.agents/active_workflow"
[ -f "$ACTIVE" ] || ACTIVE="$ROOT/.trae/active_workflow"
[ -f "$ACTIVE" ] || exit 0
WF=$(cat "$ACTIVE")
STATE="$WF/state.json"
[ -f "$STATE" ] || exit 0
PHASE=$(grep -o "\\"phase\\":\\"[^\\"]*\\"" "$STATE" | head -1 | cut -d\\" -f4)
case "$PHASE" in
  IMPLEMENTING)
    if [ ! -s "$WF/tasks.md" ]; then
      printf "{\\"decision\\":\\"block\\",\\"reason\\":\\"tasks.md is empty. Plan tasks before stopping.\\"}"
    fi
    ;;
  TESTING)
    printf "{\\"decision\\":\\"block\\",\\"reason\\":\\"In TESTING phase — run gate (cli.cjs advance) or confirm checklist.md is complete before stopping.\\"}"
    ;;
esac
exit 0
'`;

export function generateHooksJson(_projectRoot: string): HooksConfig {
  return {
    version: 1,
    hooks: {
      SessionStart: [
        { hooks: [{ type: 'command', command: SESSION_INIT, timeout: 5 }] },
      ],
      Stop: [
        { loop_limit: 3, hooks: [{ type: 'command', command: QUALITY_GATE, timeout: 10 }] },
      ],
    },
  };
}

export function installIdeHooks(projectRoot: string, target: Target): void {
  const hooksConfig = generateHooksJson(projectRoot);

  if (target === 'trae' || target === 'both') {
    const traeDir = path.join(projectRoot, '.trae');
    if (!fs.existsSync(traeDir)) fs.mkdirSync(traeDir, { recursive: true });
    const traeFile = path.join(traeDir, 'hooks.json');
    fs.writeFileSync(traeFile, JSON.stringify(hooksConfig, null, 2) + '\n');
    console.log(`✅ Installed: ${path.relative(projectRoot, traeFile)}`);
  }

  if (target === 'claude' || target === 'both') {
    const claudeDir = path.join(projectRoot, '.claude');
    if (!fs.existsSync(claudeDir)) fs.mkdirSync(claudeDir, { recursive: true });
    const claudeFile = path.join(claudeDir, 'settings.json');

    let claudeSettings: Record<string, unknown> = {};
    if (fs.existsSync(claudeFile)) {
      try {
        claudeSettings = JSON.parse(fs.readFileSync(claudeFile, 'utf8'));
      } catch {
        claudeSettings = {};
      }
    }
    claudeSettings.hooks = hooksConfig.hooks;
    fs.writeFileSync(claudeFile, JSON.stringify(claudeSettings, null, 2) + '\n');
    console.log(`✅ Installed: ${path.relative(projectRoot, claudeFile)}`);
  }
}
