#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');
const force = args.includes('--force');

function run(label, cmd, cmdArgs) {
  const display = `${cmd} ${cmdArgs.join(' ')}`;
  if (dryRun) {
    console.log(`▶ ${label}`);
    console.log(`    (dry-run) would run: ${display}`);
    return { status: 0 };
  }
  console.log(`▶ ${label}`);
  console.log(`    $ ${display}`);
  const r = spawnSync(cmd, cmdArgs, { stdio: 'inherit' });
  if (r.status !== 0) console.log(`    ✗ exit ${r.status}`);
  else console.log('    ✓ done');
  return r;
}

function capture(cmd, cmdArgs) {
  const r = spawnSync(cmd, cmdArgs, { encoding: 'utf8' });
  return { stdout: r.stdout || '', stderr: r.stderr || '', status: r.status };
}

function preflight() {
  const dirty = capture('git', ['status', '--porcelain']).stdout.trim();
  if (dirty && !force) {
    console.error('✗ working tree has uncommitted changes:');
    console.error(dirty.split('\n').map((l) => `    ${l}`).join('\n'));
    console.error('  Commit or stash first, or pass --force.');
    process.exit(1);
  }

  const branchOut = capture('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  if (branchOut !== 'main' && !force) {
    console.error(`✗ current branch is "${branchOut}", expected "main".`);
    console.error('  Switch to main, or pass --force.');
    process.exit(1);
  }

  const ahead = capture('git', ['log', 'origin/main..HEAD', '--oneline']).stdout.trim();
  if (!ahead) {
    console.log('Nothing to push (HEAD == origin/main).');
    if (!force) {
      console.log('Skipping git push; will still re-install skills + hooks.');
    }
  } else {
    const lines = ahead.split('\n');
    console.log(`Will push ${lines.length} commit(s):`);
    for (const l of lines) console.log(`    ${l}`);
  }
  console.log('');
  return { ahead: !!ahead, branch: branchOut };
}

function main() {
  const r0 = run('Step 1/4: sync shared docs into skills/*/references/', 'node', [
    'scripts/sync-shared-docs.mjs',
  ]);
  if (r0.status !== 0) {
    console.error('✗ sync-shared-docs failed; aborting before preflight.');
    process.exit(1);
  }
  console.log('');

  const { ahead } = preflight();
  if (dryRun) console.log('=== DRY RUN — no commands will execute ===\n');

  const failures = [];

  if (ahead) {
    const r = run('Step 2/4: git push origin main', 'git', ['push', 'origin', 'main']);
    if (r.status !== 0) failures.push('git push');
  } else {
    console.log('▶ Step 2/4: git push origin main');
    console.log('    (skipped — already in sync)');
  }
  console.log('');

  const r2 = run(
    'Step 3/4: pull latest skills into ~/.agents/',
    'pnpm',
    ['dlx', 'skills@1.4.5-rc.18', 'install', '-g', '-y', 'learnwy/skills'],
  );
  if (r2.status !== 0) failures.push('skills install');
  console.log('');

  const r3 = run(
    'Step 4/4: register hooks (idempotent uninstall+install sweep)',
    'pnpm',
    ['run', 'install:hooks'],
  );
  if (r3.status !== 0) failures.push('install:hooks');
  console.log('');

  if (failures.length === 0) {
    console.log(dryRun ? '✓ dry-run complete — would have succeeded.' : '✓ release complete.');
    process.exit(0);
  } else {
    console.error(`✗ release finished with failures: ${failures.join(', ')}`);
    process.exit(1);
  }
}

main();
