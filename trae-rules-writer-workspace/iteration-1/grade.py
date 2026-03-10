import json
from pathlib import Path
base = Path('/Users/wangyang.learnwy/learnwy/learnwy/skills/trae-rules-writer-workspace/iteration-1')
checks = {
    1: [
        ('生成 .trae/rules/code-style.md', lambda t: '.trae/rules/code-style.md' in t),
        ('globs 格式正确（无引号数组）', lambda t: ('globs:' in t) and ('[' not in t or '[' not in t.split('globs:')[1].split('\n')[0]) and ('"' not in t.split('globs:')[1].split('\n')[0])),
        ('alwaysApply: true', lambda t: 'alwaysApply: true' in t),
    ],
    2: [
        ('生成 .trae/rules/security.md', lambda t: '.trae/rules/security.md' in t),
        ('alwaysApply: true', lambda t: 'alwaysApply: true' in t),
        ('路径为相对路径', lambda t: '/Users/' not in t and '/home/' not in t),
    ],
    3: [
        ('使用 globs: *.ts,*.tsx', lambda t: 'globs:' in t and '*.ts' in t and '*.tsx' in t),
        ('不使用绝对路径', lambda t: '/Users/' not in t and '/home/' not in t),
    ],
}
rows = []
for eval_id in [1, 2, 3]:
    for mode in ['with_skill', 'baseline']:
        out = base / f'eval-{eval_id}' / mode / 'outputs'
        md_files = list(out.glob('*.md'))
        text = '\n'.join(p.read_text() for p in md_files) if md_files else ''
        expectations = []
        for name, fn in checks.get(eval_id, []):
            ok = False
            try:
                ok = bool(fn(text))
            except:
                ok = False
            expectations.append({'text': name, 'passed': ok, 'evidence': 'matched' if ok else 'missing signal'})
        grading = {'run_id': f'eval-{eval_id}-{mode}', 'expectations': expectations, 'pass_count': sum(x['passed'] for x in expectations), 'total': len(expectations)}
        (base / f'eval-{eval_id}' / mode / 'grading.json').write_text(json.dumps(grading, ensure_ascii=False, indent=2))
        rows.append(grading)
summary = []
for mode in ['with_skill', 'baseline']:
    m = [r for r in rows if r['run_id'].endswith(mode)]
    passed = sum(r['pass_count'] for r in m)
    total = sum(r['total'] for r in m)
    summary.append({'config': mode, 'passed': passed, 'total': total, 'pass_rate': round(passed / total, 4)})
benchmark = {'skill_name': 'trae-rules-writer', 'iteration': 1, 'metrics': summary, 'runs': rows}
(base / 'benchmark.json').write_text(json.dumps(benchmark, ensure_ascii=False, indent=2))
md = ['# Iteration 1 Benchmark', '']
for s in summary:
    md.append(f"- {s['config']}: {s['passed']}/{s['total']} ({s['pass_rate'] * 100:.1f}%)")
md.append('')
if summary[0]['pass_rate'] >= summary[1]['pass_rate']:
    md.append('- with_skill 在规则格式与路径约束上整体更稳。')
else:
    md.append('- baseline 与 with_skill 接近，需引入更具区分度断言。')
(base / 'benchmark.md').write_text('\n'.join(md))
print('ok')
