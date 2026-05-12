import type { ReportData } from './report-data.js';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const STYLE = `
:root {
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #6b7280;
  --card: #f9fafb;
  --border: #e5e7eb;
  --accent: #2563eb;
  --new: #94a3b8;
  --learning: #f59e0b;
  --mastered: #10b981;
  --heat-0: #ebedf0;
  --heat-1: #c6e48b;
  --heat-2: #7bc96f;
  --heat-3: #239a3b;
  --heat-4: #196127;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0b0b0d;
    --fg: #e5e7eb;
    --muted: #9ca3af;
    --card: #18181b;
    --border: #27272a;
    --accent: #60a5fa;
    --heat-0: #1b1b1e;
    --heat-1: #0e4429;
    --heat-2: #006d32;
    --heat-3: #26a641;
    --heat-4: #39d353;
  }
}
* { box-sizing: border-box; }
html, body { margin: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  background: var(--bg);
  color: var(--fg);
  line-height: 1.5;
  padding-left: 240px;
}
aside.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  padding: 20px 16px;
  border-right: 1px solid var(--border);
  background: var(--card);
  z-index: 20;
}
aside.sidebar h1 { margin: 0 0 4px; font-size: 18px; }
aside.sidebar .meta { font-size: 12px; color: var(--muted); margin-bottom: 12px; }
aside.sidebar nav { display: flex; flex-direction: column; gap: 2px; margin: 12px 0; }
aside.sidebar nav a {
  text-decoration: none;
  color: var(--fg);
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
aside.sidebar nav a:hover { background: var(--border); }
aside.sidebar nav a.active { background: var(--accent); color: white; }
aside.sidebar nav a.active .count { color: rgba(255, 255, 255, 0.85); }
aside.sidebar nav a .count { color: var(--muted); font-size: 11px; }
aside.sidebar .global-search {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  font-size: 13px;
  margin-bottom: 4px;
}
aside.sidebar .legend { margin-top: 16px; font-size: 11px; color: var(--muted); }
aside.sidebar .legend .row { display: flex; align-items: center; gap: 6px; margin: 4px 0; }
aside.sidebar .legend .swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
aside.sidebar .shortcut-hint {
  margin-top: 16px;
  font-size: 11px;
  color: var(--muted);
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
aside.sidebar .shortcut-hint kbd {
  font-family: ui-monospace, monospace;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 4px;
  font-size: 10px;
}
main { padding: 24px 32px; max-width: 1200px; min-width: 0; }
main section { margin-bottom: 32px; scroll-margin-top: 12px; }
main section header { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
main section header .controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
h2 { margin: 0 0 4px; font-size: 18px; }
h2 .badge { color: var(--muted); font-weight: 400; margin-left: 8px; font-size: 13px; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px;
}
.card .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.card .value { font-size: 26px; font-weight: 600; margin-top: 4px; }
.card .delta { font-size: 11px; color: var(--muted); margin-top: 2px; }
.search, select, .csv-btn {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  font-size: 13px;
}
.csv-btn { cursor: pointer; }
.csv-btn:hover { background: var(--card); }
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip {
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--fg);
  font-size: 12px;
  cursor: pointer;
}
.chip.active { background: var(--accent); color: white; border-color: var(--accent); }
.chip:hover:not(.active) { background: var(--card); }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); }
th { cursor: pointer; user-select: none; font-weight: 600; color: var(--muted); }
th.sorted::after { content: " ▾"; color: var(--accent); }
th.sorted.asc::after { content: " ▴"; }
td.mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
.mastery { display: inline-block; width: 60px; height: 8px; border-radius: 4px; background: var(--border); position: relative; vertical-align: middle; }
.mastery > span { display: block; height: 100%; border-radius: 4px; background: var(--accent); }
.mastery[data-bucket="new"] > span { background: var(--new); }
.mastery[data-bucket="learning"] > span { background: var(--learning); }
.mastery[data-bucket="mastered"] > span { background: var(--mastered); }
.due-row { display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--border); }
.due-row:last-child { border-bottom: none; }
.due-row .term { font-weight: 600; }
.due-row .meta-text { font-size: 12px; color: var(--muted); }
.empty {
  background: var(--card);
  border: 1px dashed var(--border);
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  color: var(--muted);
  font-style: italic;
}
.empty code {
  font-style: normal;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
}
.activity { background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 16px; }
.heatmap {
  display: grid;
  grid-template-rows: repeat(7, 14px);
  grid-auto-flow: column;
  grid-auto-columns: 14px;
  gap: 2px;
  margin-top: 8px;
}
.heatmap .cell {
  border-radius: 2px;
  background: var(--heat-0);
}
.heatmap .cell[data-level="1"] { background: var(--heat-1); }
.heatmap .cell[data-level="2"] { background: var(--heat-2); }
.heatmap .cell[data-level="3"] { background: var(--heat-3); }
.heatmap .cell[data-level="4"] { background: var(--heat-4); }
.heatmap .cell.placeholder { background: transparent; }
.heatmap-legend { display: flex; gap: 4px; align-items: center; font-size: 11px; color: var(--muted); margin-top: 12px; justify-content: flex-end; }
.heatmap-legend .swatch { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }
#back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--fg);
  cursor: pointer;
  font-size: 18px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 150ms ease;
  z-index: 50;
}
#back-to-top.visible { opacity: 1; pointer-events: auto; }
#shortcuts-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: none;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
#shortcuts-modal.open { display: flex; }
#shortcuts-modal .panel {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
  min-width: 320px;
  font-size: 13px;
}
#shortcuts-modal kbd {
  font-family: ui-monospace, monospace;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 1px 6px;
  font-size: 11px;
  margin-right: 4px;
}
#shortcuts-modal .row { display: flex; justify-content: space-between; gap: 24px; margin: 6px 0; }

@media (max-width: 768px) {
  body { padding-left: 0; }
  aside.sidebar { position: static; height: auto; width: 100%; border-right: none; border-bottom: 1px solid var(--border); z-index: auto; }
  main { padding: 16px; }
}

@media print {
  body { display: block; color: black; background: white; }
  aside.sidebar, #back-to-top, #shortcuts-modal, .controls, .chips, .global-search { display: none !important; }
  main { padding: 0; max-width: 100%; }
  .card, .activity, .empty { border: 1px solid #ccc; background: white; }
  table { font-size: 11px; }
  th { color: black; }
  details { page-break-inside: avoid; }
}
`;

const SCRIPT = `
(() => {
  const data = JSON.parse(document.getElementById('report-data').textContent);
  const bucketFor = (m) => m >= 70 ? 'mastered' : m >= 30 ? 'learning' : 'new';
  const heatLevel = (n) => n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : n <= 10 ? 3 : 4;

  function makeCell(text, opts = {}) {
    const td = document.createElement('td');
    td.textContent = String(text == null ? '' : text);
    if (opts.mono) td.className = 'mono';
    return td;
  }
  function masteryCell(value) {
    const td = document.createElement('td');
    const wrap = document.createElement('span');
    wrap.className = 'mastery';
    wrap.dataset.bucket = bucketFor(value);
    const fill = document.createElement('span');
    fill.style.width = Math.max(0, Math.min(100, value)) + '%';
    wrap.appendChild(fill);
    td.appendChild(wrap);
    const num = document.createElement('span');
    num.style.marginLeft = '8px';
    num.style.fontSize = '12px';
    num.style.color = 'var(--muted)';
    num.textContent = value;
    td.appendChild(num);
    return td;
  }

  function defOf(w) {
    const d = (w.definitions || [])[0];
    return d ? (d.pos ? '(' + d.pos + ') ' : '') + d.meaning : '';
  }

  function csvEscape(v) {
    const s = String(v == null ? '' : v);
    if (/[",\\n\\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function downloadCsv(name, headers, rows) {
    const lines = [headers.join(',')];
    for (const r of rows) lines.push(r.map(csvEscape).join(','));
    const blob = new Blob([lines.join('\\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const tables = {};

  function attachTable(sectionId, allRows, cols, csv) {
    const root = document.getElementById(sectionId);
    if (!root) return;
    const tbody = root.querySelector('tbody');
    const localSearch = root.querySelector('input.search');
    const limitSel = root.querySelector('select.row-limit');
    const csvBtn = root.querySelector('button.csv-btn');
    const ths = root.querySelectorAll('th[data-key]');

    let sortKey = ths[0] && ths[0].dataset.key;
    let sortDir = 'desc';
    let limit = limitSel ? (limitSel.value === 'all' ? Infinity : parseInt(limitSel.value, 10)) : Infinity;
    let bucketFilter = null;
    let localQuery = '';
    let globalQuery = '';

    function compute() {
      let rows = allRows.slice();
      if (bucketFilter) rows = rows.filter((r) => bucketFor(r.mastery) === bucketFilter);
      const q = (globalQuery || localQuery || '').toLowerCase();
      if (q) rows = rows.filter((r) => cols.some((c) => c.search && String(c.search(r)).toLowerCase().includes(q)));
      rows.sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
        return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
      const sliced = rows.slice(0, limit);
      tbody.innerHTML = '';
      for (const r of sliced) {
        const tr = document.createElement('tr');
        for (const c of cols) tr.appendChild(c.cell(r));
        tbody.appendChild(tr);
      }
      const badge = root.querySelector('h2 .badge');
      if (badge) badge.textContent = '(' + sliced.length + (rows.length > sliced.length ? ' of ' + rows.length : '') + ')';
      const emptyEl = root.querySelector('.empty-runtime');
      if (emptyEl) emptyEl.style.display = sliced.length === 0 ? 'block' : 'none';
    }
    function updateThStyles() {
      ths.forEach((th) => {
        th.classList.remove('sorted', 'asc');
        if (th.dataset.key === sortKey) {
          th.classList.add('sorted');
          if (sortDir === 'asc') th.classList.add('asc');
        }
      });
    }
    ths.forEach((th) => th.addEventListener('click', () => {
      const key = th.dataset.key;
      if (key === sortKey) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      else { sortKey = key; sortDir = 'desc'; }
      updateThStyles(); compute();
    }));
    if (localSearch) localSearch.addEventListener('input', (e) => { localQuery = e.target.value; compute(); });
    if (limitSel) limitSel.addEventListener('change', (e) => { limit = e.target.value === 'all' ? Infinity : parseInt(e.target.value, 10); compute(); });
    if (csvBtn) csvBtn.addEventListener('click', () => downloadCsv(csv.filename, csv.headers, allRows.map(csv.row)));

    updateThStyles();
    compute();
    return {
      setGlobalQuery: (q) => { globalQuery = q; compute(); },
      setBucket: (b) => { bucketFilter = b; compute(); },
    };
  }

  tables.words = attachTable('words', data.all_words, [
    { cell: (r) => makeCell(r.word, { mono: true }), search: (r) => r.word, key: 'word' },
    { cell: (r) => makeCell(r.phonetic || ''), search: (r) => r.phonetic, key: 'phonetic' },
    { cell: (r) => makeCell(defOf(r)), search: (r) => defOf(r), key: 'definition' },
    { cell: (r) => masteryCell(r.mastery), key: 'mastery' },
    { cell: (r) => makeCell(r.lookup_count), key: 'lookup_count' },
    { cell: (r) => makeCell((r.last_lookup || '').slice(0, 10)), key: 'last_lookup' },
  ], {
    filename: 'english-learner-words.csv',
    headers: ['word', 'phonetic', 'definition', 'mastery', 'lookup_count', 'last_lookup'],
    row: (r) => [r.word, r.phonetic || '', defOf(r), r.mastery, r.lookup_count, r.last_lookup || ''],
  });

  tables.phrases = attachTable('phrases', data.all_phrases, [
    { cell: (r) => makeCell(r.phrase, { mono: true }), search: (r) => r.phrase },
    { cell: (r) => makeCell(r.definition || ''), search: (r) => r.definition },
    { cell: (r) => masteryCell(r.mastery) },
    { cell: (r) => makeCell(r.lookup_count) },
    { cell: (r) => makeCell((r.last_lookup || '').slice(0, 10)) },
  ], {
    filename: 'english-learner-phrases.csv',
    headers: ['phrase', 'definition', 'mastery', 'lookup_count', 'last_lookup'],
    row: (r) => [r.phrase, r.definition || '', r.mastery, r.lookup_count, r.last_lookup || ''],
  });

  tables.corrections = attachTable('corrections', data.top_corrections, [
    { cell: (r) => makeCell(r.original), search: (r) => r.original },
    { cell: (r) => makeCell(r.corrected), search: (r) => r.corrected },
    { cell: (r) => makeCell(r.reason || ''), search: (r) => r.reason },
    { cell: (r) => makeCell(r.count) },
    { cell: (r) => makeCell((r.last_seen || '').slice(0, 10)) },
  ], {
    filename: 'english-learner-corrections.csv',
    headers: ['original', 'corrected', 'reason', 'count', 'last_seen'],
    row: (r) => [r.original, r.corrected, r.reason || '', r.count, r.last_seen || ''],
  });

  // Mastery chips on the words section
  const chips = document.querySelectorAll('.chip[data-bucket]');
  chips.forEach((chip) => chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    const b = chip.dataset.bucket;
    tables.words.setBucket(b === 'all' ? null : b);
  }));

  // Global search across all three tables
  const gs = document.getElementById('global-search');
  if (gs) gs.addEventListener('input', (e) => {
    const q = e.target.value;
    Object.values(tables).forEach((t) => t && t.setGlobalQuery(q));
  });

  // Due list
  const due = document.getElementById('due-list');
  if (due) {
    const items = [
      ...data.due_words.map((w) => ({ term: w.word, kind: 'word', mastery: w.mastery, def: defOf(w) })),
      ...data.due_phrases.map((p) => ({ term: p.phrase, kind: 'phrase', mastery: p.mastery, def: p.definition })),
    ];
    if (items.length === 0) {
      const e = document.createElement('div');
      e.className = 'empty';
      e.innerHTML = 'Nothing due — you are caught up. <br><small>Spaced-repetition queue rebuilds as you review words.</small>';
      due.appendChild(e);
    } else {
      for (const it of items) {
        const row = document.createElement('div');
        row.className = 'due-row';
        const left = document.createElement('div');
        const term = document.createElement('div');
        term.className = 'term';
        term.textContent = it.term;
        const def = document.createElement('div');
        def.className = 'meta-text';
        def.textContent = (it.kind === 'phrase' ? '[phrase] ' : '') + (it.def || '');
        left.appendChild(term);
        left.appendChild(def);
        const right = document.createElement('div');
        right.className = 'meta-text';
        right.textContent = 'mastery ' + it.mastery;
        row.appendChild(left);
        row.appendChild(right);
        due.appendChild(row);
      }
    }
  }

  // Heatmap (GitHub-style)
  const hm = document.getElementById('heatmap');
  if (hm && data.activity && data.activity.length) {
    const firstDate = new Date(data.activity[0].day + 'T00:00:00Z');
    const firstDow = firstDate.getUTCDay(); // 0=Sun
    // pad with placeholders so column 1 starts at Sunday
    for (let i = 0; i < firstDow; i++) {
      const ph = document.createElement('div');
      ph.className = 'cell placeholder';
      ph.style.gridRow = String(i + 1);
      ph.style.gridColumn = '1';
      hm.appendChild(ph);
    }
    data.activity.forEach((b, i) => {
      const dayIdx = (firstDow + i) % 7;
      const colIdx = Math.floor((firstDow + i) / 7) + 1;
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.level = String(heatLevel(b.total));
      cell.style.gridRow = String(dayIdx + 1);
      cell.style.gridColumn = String(colIdx);
      cell.title = b.day + ': ' + b.total + ' event' + (b.total === 1 ? '' : 's');
      hm.appendChild(cell);
    });
  }

  // Active section highlight in sidebar nav
  const navLinks = Array.from(document.querySelectorAll('aside.sidebar nav a[href^="#"]'));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
        }
      }
    }, { rootMargin: '-30% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s));
  }

  // Back-to-top
  const btn = document.getElementById('back-to-top');
  if (btn) {
    const onScroll = () => {
      if (window.scrollY > 600) btn.classList.add('visible');
      else btn.classList.remove('visible');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    onScroll();
  }

  // Keyboard shortcuts
  const help = document.getElementById('shortcuts-modal');
  let waitingForGNext = false;
  let waitingTimer = null;
  function clearG() { waitingForGNext = false; if (waitingTimer) clearTimeout(waitingTimer); }
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && (t.matches('input, textarea, select') || t.isContentEditable)) {
      if (e.key === 'Escape' && t.matches('input.search, input#global-search')) t.blur();
      return;
    }
    if (waitingForGNext) {
      if (e.key === 'w') { location.hash = '#words'; e.preventDefault(); }
      else if (e.key === 'p') { location.hash = '#phrases'; e.preventDefault(); }
      else if (e.key === 'c') { location.hash = '#corrections'; e.preventDefault(); }
      else if (e.key === 'g') { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); e.preventDefault(); }
      clearG();
      return;
    }
    if (e.key === '/') { e.preventDefault(); if (gs) gs.focus(); }
    else if (e.key === 'g') { waitingForGNext = true; waitingTimer = setTimeout(clearG, 1000); }
    else if (e.key === 't') { window.scrollTo({ top: 0, behavior: 'smooth' }); }
    else if (e.key === '?') { if (help) help.classList.toggle('open'); }
    else if (e.key === 'Escape' && help && help.classList.contains('open')) { help.classList.remove('open'); }
  });
  if (help) help.addEventListener('click', (e) => { if (e.target === help) help.classList.remove('open'); });
})();
`;

function emptyState(message: string, hint: string): string {
  return `<div class="empty">${escapeHtml(message)}<br><small>${escapeHtml(hint)}</small></div>`;
}

export function renderReport(data: ReportData): string {
  const title = `English-Learner Report — ${escapeHtml(data.generated_at.slice(0, 16).replace('T', ' '))} UTC`;
  const totalActivity = data.activity.reduce((sum, b) => sum + b.total, 0);
  const dueCount = data.due_words.length + data.due_phrases.length;

  const limitOpts = `
    <select class="row-limit">
      <option value="50">50</option>
      <option value="200" selected>200</option>
      <option value="1000">1000</option>
      <option value="all">all</option>
    </select>`;

  const emptyWords = data.all_words.length === 0
    ? emptyState('No words yet.', 'Run `node scripts/cli.cjs vocab batch_get \'["hello"]\'` to start, or just type any English word in chat.')
    : '';
  const emptyPhrases = data.all_phrases.length === 0
    ? emptyState('No phrases yet.', 'Look up an idiom like "break the ice" in chat — it will be persisted here.')
    : '';
  const emptyCorrections = data.top_corrections.length === 0
    ? emptyState('No corrections yet.', 'Write in English and grammar fixes will accumulate automatically.')
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${STYLE}</style>
</head>
<body>
<aside class="sidebar">
  <h1>English-Learner</h1>
  <div class="meta">${escapeHtml(data.generated_at.slice(0, 16).replace('T', ' '))} UTC</div>
  <input type="search" id="global-search" class="global-search" placeholder="Search everything…">
  <nav>
    <a href="#stats">Overview <span class="count">${data.stats.total_words}</span></a>
    <a href="#due">Due now <span class="count">${dueCount}</span></a>
    <a href="#activity">Activity <span class="count">${totalActivity}</span></a>
    <a href="#words">Words <span class="count">${data.all_words.length}</span></a>
    <a href="#phrases">Phrases <span class="count">${data.all_phrases.length}</span></a>
    <a href="#corrections">Corrections <span class="count">${data.top_corrections.length}</span></a>${data.materials ? `
    <a href="#materials">Materials <span class="count">${data.materials.total_materials}</span></a>` : ''}
  </nav>
  <div class="legend">
    Mastery
    <div class="row"><span class="swatch" style="background: var(--new)"></span> &lt; 30 (new)</div>
    <div class="row"><span class="swatch" style="background: var(--learning)"></span> 30–70 (learning)</div>
    <div class="row"><span class="swatch" style="background: var(--mastered)"></span> ≥ 70 (mastered)</div>
  </div>
  <div class="shortcut-hint">
    <kbd>/</kbd> search · <kbd>g</kbd> <kbd>w</kbd>/<kbd>p</kbd>/<kbd>c</kbd> jump · <kbd>t</kbd> top · <kbd>?</kbd> help
  </div>
</aside>
<main>
  <section id="stats">
    <h2>Overview</h2>
    <div class="cards">
      <div class="card"><div class="label">Total words</div><div class="value">${data.stats.total_words}</div></div>
      <div class="card"><div class="label">Mastered</div><div class="value" style="color: var(--mastered)">${data.stats.mastered_words}</div><div class="delta">≥ 70 mastery</div></div>
      <div class="card"><div class="label">Learning</div><div class="value" style="color: var(--learning)">${data.stats.learning_words}</div><div class="delta">30–70 mastery</div></div>
      <div class="card"><div class="label">New</div><div class="value">${data.stats.new_words}</div><div class="delta">&lt; 30 mastery</div></div>
      <div class="card"><div class="label">Total lookups</div><div class="value">${data.stats.total_lookups}</div></div>
      <div class="card"><div class="label">Corrections</div><div class="value">${data.correction_stats.total}</div><div class="delta">${data.correction_stats.unique_pairs} unique pairs</div></div>
    </div>
  </section>

  <section id="due">
    <header><h2>Due now <span class="badge">(${dueCount})</span></h2></header>
    <div id="due-list" class="card"></div>
  </section>

  <section id="activity">
    <header>
      <h2>Activity <span class="badge">(last ${data.activity.length} days, ${totalActivity} events)</span></h2>
    </header>
    <div class="activity">
      <div id="heatmap" class="heatmap"></div>
      <div class="heatmap-legend">
        less
        <span class="swatch" style="background: var(--heat-0)"></span>
        <span class="swatch" style="background: var(--heat-1)"></span>
        <span class="swatch" style="background: var(--heat-2)"></span>
        <span class="swatch" style="background: var(--heat-3)"></span>
        <span class="swatch" style="background: var(--heat-4)"></span>
        more
      </div>
    </div>
  </section>

  <section id="words">
    <header>
      <h2>Words <span class="badge"></span></h2>
      <div class="controls">
        <input type="search" class="search" placeholder="filter words…">
        ${limitOpts}
        <button class="csv-btn" type="button">⬇ CSV</button>
      </div>
    </header>
    <div class="chips" style="margin-bottom: 12px">
      <button class="chip active" data-bucket="all">All <span class="count" style="opacity:0.7">(${data.all_words.length})</span></button>
      <button class="chip" data-bucket="mastered">Mastered <span class="count" style="opacity:0.7">(${data.stats.mastered_words})</span></button>
      <button class="chip" data-bucket="learning">Learning <span class="count" style="opacity:0.7">(${data.stats.learning_words})</span></button>
      <button class="chip" data-bucket="new">New <span class="count" style="opacity:0.7">(${data.stats.new_words})</span></button>
    </div>
    <table>
      <thead><tr>
        <th data-key="word">word</th>
        <th data-key="phonetic">phonetic</th>
        <th data-key="definition">definition</th>
        <th data-key="mastery">mastery</th>
        <th data-key="lookup_count">lookups</th>
        <th data-key="last_lookup">last seen</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    ${emptyWords ? `<div class="empty-runtime" style="display:none">${emptyState('No matches.', 'Try a different filter or clear search.')}</div>${emptyWords}` : '<div class="empty-runtime" style="display:none">' + emptyState('No matches.', 'Try a different filter or clear search.') + '</div>'}
    ${data.words_truncated ? `<div class="meta" style="margin-top: 8px; font-size: 12px; color: var(--muted);">Showing top ${data.all_words.length} by mastery+lookups; ${data.stats.total_words - data.all_words.length} more not shown.</div>` : ''}
  </section>

  <section id="phrases">
    <header>
      <h2>Phrases <span class="badge"></span></h2>
      <div class="controls">
        <input type="search" class="search" placeholder="filter phrases…">
        ${limitOpts}
        <button class="csv-btn" type="button">⬇ CSV</button>
      </div>
    </header>
    <table>
      <thead><tr>
        <th data-key="phrase">phrase</th>
        <th data-key="definition">definition</th>
        <th data-key="mastery">mastery</th>
        <th data-key="lookup_count">lookups</th>
        <th data-key="last_lookup">last seen</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    ${emptyPhrases ? `<div class="empty-runtime" style="display:none">${emptyState('No matches.', 'Clear filters to see all phrases.')}</div>${emptyPhrases}` : '<div class="empty-runtime" style="display:none">' + emptyState('No matches.', 'Clear filters to see all phrases.') + '</div>'}
  </section>

  <section id="corrections">
    <header>
      <h2>Top corrections <span class="badge"></span></h2>
      <div class="controls">
        <input type="search" class="search" placeholder="filter corrections…">
        ${limitOpts}
        <button class="csv-btn" type="button">⬇ CSV</button>
      </div>
    </header>
    <table>
      <thead><tr>
        <th data-key="count">original</th>
        <th data-key="corrected">corrected</th>
        <th data-key="reason">reason</th>
        <th data-key="count">count</th>
        <th data-key="last_seen">last seen</th>
      </tr></thead>
      <tbody></tbody>
    </table>
    ${emptyCorrections ? `<div class="empty-runtime" style="display:none">${emptyState('No matches.', 'Clear filters to see all corrections.')}</div>${emptyCorrections}` : '<div class="empty-runtime" style="display:none">' + emptyState('No matches.', 'Clear filters to see all corrections.') + '</div>'}
  </section>
${data.materials ? `
  <section id="materials">
    <header><h2>Materials <span class="badge">(${data.materials.total_materials})</span></h2></header>
    <div class="cards">
      <div class="card"><div class="label">Total materials</div><div class="value">${data.materials.total_materials}</div></div>
      ${data.materials.date_range ? `<div class="card"><div class="label">Date range</div><div class="value" style="font-size:16px">${escapeHtml(data.materials.date_range.from)}</div><div class="delta">→ ${escapeHtml(data.materials.date_range.to)}</div></div>` : ''}
      ${Object.entries(data.materials.by_type).map(([t, c]) => `<div class="card"><div class="label">${escapeHtml(t)}</div><div class="value">${c}</div></div>`).join('')}
    </div>
    ${data.materials.words_per_source.length > 0 ? `
    <h3 style="margin: 20px 0 8px; font-size: 14px; color: var(--muted);">Words per source type</h3>
    <table>
      <thead><tr><th>Source type</th><th>Unique words</th></tr></thead>
      <tbody>${data.materials.words_per_source.map(s => `<tr><td>${escapeHtml(s.source_type)}</td><td>${s.unique_words}</td></tr>`).join('')}</tbody>
    </table>` : ''}
    ${data.materials.recent_materials.length > 0 ? `
    <h3 style="margin: 20px 0 8px; font-size: 14px; color: var(--muted);">Recent imports</h3>
    <table>
      <thead><tr><th>Date</th><th>Type</th><th>Words</th></tr></thead>
      <tbody>${data.materials.recent_materials.map(m => `<tr><td>${escapeHtml(m.date)}</td><td>${escapeHtml(m.source_type)}</td><td>${m.word_count}</td></tr>`).join('')}</tbody>
    </table>` : ''}
  </section>
` : ''}
</main>

<button id="back-to-top" type="button" title="Back to top">↑</button>

<div id="shortcuts-modal" role="dialog" aria-label="Keyboard shortcuts">
  <div class="panel">
    <h2 style="margin-top: 0">Keyboard shortcuts</h2>
    <div class="row"><span><kbd>/</kbd> Focus global search</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>w</kbd> Jump to Words</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>p</kbd> Jump to Phrases</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>c</kbd> Jump to Corrections</span></div>
    <div class="row"><span><kbd>g</kbd> <kbd>g</kbd> Scroll to bottom</span></div>
    <div class="row"><span><kbd>t</kbd> Scroll to top</span></div>
    <div class="row"><span><kbd>?</kbd> Toggle this help</span></div>
    <div class="row"><span><kbd>Esc</kbd> Close / blur search</span></div>
    <div style="margin-top: 12px; color: var(--muted); font-size: 11px;">Click outside or press <kbd>Esc</kbd> to close.</div>
  </div>
</div>

<noscript><p style="padding: 24px;">This report requires JavaScript to render tables and charts. Pass <code>--json</code> to dump the raw data.</p></noscript>
<script id="report-data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script>${SCRIPT}</script>
</body>
</html>
`;
}
