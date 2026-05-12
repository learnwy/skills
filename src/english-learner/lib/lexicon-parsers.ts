export interface ParsedEntry {
  word: string;
  phonetic: string;
  pos: string;
  meaning_en: string;
  meaning_zh: string;
  examples: string[];
  synonyms: string;
  raw_entry: string;
}

// Format A — Fallback 编号列表
const ENTRY_RE = /^\d+\.\s+\*\*(.+?)\*\*\s*\[(.+?)\]\s*\((.+?)\)\s*-\s*(.+)$/;
const SCENARIO_RE = /^\s+-\s+\*\*Scenario\s+\d+.*?\*\*:\s*(.+)$/;

export function parseFormatA(content: string): ParsedEntry[] {
  const lines = content.split('\n');
  const entries: ParsedEntry[] = [];
  let current: ParsedEntry | null = null;

  for (const line of lines) {
    const entryMatch = line.match(ENTRY_RE);
    if (entryMatch) {
      if (current) entries.push(current);
      current = {
        word: entryMatch[1].trim(),
        phonetic: entryMatch[2].trim(),
        pos: entryMatch[3].trim(),
        meaning_en: '',
        meaning_zh: entryMatch[4].trim(),
        examples: [],
        synonyms: '',
        raw_entry: line,
      };
      continue;
    }
    if (current) {
      const scenarioMatch = line.match(SCENARIO_RE);
      if (scenarioMatch) {
        const text = scenarioMatch[1];
        const enPart = text.replace(/\s*\(.*?\)\s*$/, '').trim();
        current.examples.push(enPart);
        current.raw_entry += '\n' + line;
      }
    }
  }
  if (current) entries.push(current);
  return entries;
}

// Format B — Daily 标题+列表
export function parseFormatB(content: string): ParsedEntry[] {
  const blocks = content.split(/^### Study \d+\.\s*/m).filter(Boolean);
  const entries: ParsedEntry[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    const word = lines[0]?.trim() || '';
    if (!word) continue;

    let phonetic = '';
    let pos = '';
    let meaning_en = '';
    let meaning_zh = '';
    const examples: string[] = [];
    let inExamples = false;

    for (const line of lines.slice(1)) {
      const trimmed = line.trim();
      if (trimmed.startsWith('* **IPA**:')) {
        phonetic = trimmed.replace('* **IPA**:', '').replace(/[\[\]]/g, '').trim();
      } else if (trimmed.startsWith('* **Part of speech**:')) {
        pos = trimmed.replace('* **Part of speech**:', '').trim();
      } else if (trimmed.startsWith('* **Meaning**:')) {
        meaning_en = trimmed.replace('* **Meaning**:', '').trim();
      } else if (trimmed.startsWith('* **中文**:')) {
        meaning_zh = trimmed.replace('* **中文**:', '').trim();
      } else if (trimmed.startsWith('* **Example sentences**:')) {
        inExamples = true;
      } else if (inExamples && trimmed.startsWith('*')) {
        examples.push(trimmed.replace(/^\*\s*/, '').replace(/\*\*/g, '').trim());
      } else if (!trimmed.startsWith('*')) {
        inExamples = false;
      }
    }

    entries.push({
      word,
      phonetic,
      pos,
      meaning_en,
      meaning_zh,
      examples,
      synonyms: '',
      raw_entry: `### Study. ${word}\n${block}`,
    });
  }
  return entries;
}

// Format C — Weeks 表格（技术词汇）
// | Word | IPA | POS | Chinese | English Definition | Example Sentence | Derived/Synonyms |
export function parseFormatC(content: string): ParsedEntry[] {
  const lines = content.split('\n');
  const entries: ParsedEntry[] = [];

  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|\s*-+/.test(line) || /^\|\s*:?-+/.test(line)) continue;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 6) continue;
    if (cells[0].toLowerCase() === 'word') continue; // header

    entries.push({
      word: cells[0].replace(/\*\*/g, '').trim(),
      phonetic: cells[1].replace(/^\/|\/$/g, '').trim(),
      pos: cells[2].trim(),
      meaning_en: cells[4]?.trim() || '',
      meaning_zh: cells[3]?.trim() || '',
      examples: cells[5] ? [cells[5].trim()] : [],
      synonyms: cells[6]?.trim() || '',
      raw_entry: line,
    });
  }
  return entries;
}

// Format D — Weekly 表格（课程词汇）
// | Term | Part of Speech | Meaning | Example |
export function parseFormatD(content: string): ParsedEntry[] {
  const lines = content.split('\n');
  const entries: ParsedEntry[] = [];

  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|\s*-+/.test(line) || /^\|\s*:?-+/.test(line)) continue;
    const cells = line.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.length < 4) continue;
    if (cells[0].toLowerCase() === 'term') continue; // header

    const meaningRaw = cells[2] || '';
    let meaning_en = meaningRaw;
    let meaning_zh = '';
    const semicolonIdx = meaningRaw.indexOf(';');
    if (semicolonIdx > 0) {
      meaning_en = meaningRaw.slice(0, semicolonIdx).trim();
      meaning_zh = meaningRaw.slice(semicolonIdx + 1).trim();
    }

    entries.push({
      word: cells[0].replace(/\*\*/g, '').trim(),
      phonetic: '',
      pos: cells[1]?.trim() || '',
      meaning_en,
      meaning_zh,
      examples: cells[3] ? [cells[3].trim()] : [],
      synonyms: '',
      raw_entry: line,
    });
  }
  return entries;
}

// Format E — Weeks 扩展表格 + Collocations + Idioms
// Vocabulary Matrix: | Word | IPA | Meaning | Example | Analysis/Root | Synonyms | Antonyms |
// Collocations: numbered list with **collocation**: definition
// Idioms: numbered list with **idiom**: definition + Example
export function parseFormatE(content: string): ParsedEntry[] {
  const entries: ParsedEntry[] = [];

  // Split by sections
  const vocabSection = extractSection(content, 'Vocabulary Matrix');
  const collocSection = extractSection(content, 'Collocations');
  const idiomSection = extractSection(content, 'Idioms');

  // Parse vocabulary matrix table
  if (vocabSection) {
    for (const line of vocabSection.split('\n')) {
      if (!line.trim().startsWith('|')) continue;
      if (/^\|\s*:?-/.test(line)) continue;
      const cells = line.split('|').map(c => c.trim()).filter(Boolean);
      if (cells.length < 5) continue;
      if (cells[0].toLowerCase() === 'word' || cells[0].toLowerCase() === ':---') continue;

      const meaningRaw = cells[2] || '';
      let meaning_zh = meaningRaw;
      let meaning_en = '';
      const parenMatch = meaningRaw.match(/^(.+?)\s*\((.+)\)$/);
      if (parenMatch) {
        meaning_zh = parenMatch[1].trim();
        meaning_en = parenMatch[2].trim();
      }

      const synonymsRaw = cells[5] || '';
      const antonymsRaw = cells[6] || '';
      const allSyns = [synonymsRaw, antonymsRaw].filter(Boolean).join('; ');

      entries.push({
        word: cells[0].replace(/\*\*/g, '').trim(),
        phonetic: cells[1].replace(/^\/|\/$/g, '').trim(),
        pos: '',
        meaning_en,
        meaning_zh,
        examples: cells[3] ? [cells[3].replace(/\*\*/g, '').trim()] : [],
        synonyms: allSyns,
        raw_entry: line,
      });
    }
  }

  // Parse collocations
  if (collocSection) {
    const collocRE = /^\d+\.\s+\*\*(.+?)\*\*:\s*(.+)/;
    for (const line of collocSection.split('\n')) {
      const m = line.match(collocRE);
      if (m) {
        entries.push({
          word: m[1].trim(),
          phonetic: '',
          pos: 'collocation',
          meaning_en: m[2].trim(),
          meaning_zh: '',
          examples: [],
          synonyms: '',
          raw_entry: line,
        });
      }
    }
  }

  // Parse idioms
  if (idiomSection) {
    const idiomRE = /^\d+\.\s+\*\*(.+?)\*\*:\s*(.+)/;
    const exampleRE = /^\s+\*\s+\*(.+?)\*/;
    let current: ParsedEntry | null = null;

    for (const line of idiomSection.split('\n')) {
      const m = line.match(idiomRE);
      if (m) {
        if (current) entries.push(current);
        current = {
          word: m[1].trim(),
          phonetic: '',
          pos: 'idiom',
          meaning_en: m[2].trim(),
          meaning_zh: '',
          examples: [],
          synonyms: '',
          raw_entry: line,
        };
      } else if (current) {
        const ex = line.match(exampleRE);
        if (ex) {
          current.examples.push(ex[1].replace(/^\s*Example:\s*/, '').trim());
          current.raw_entry += '\n' + line;
        }
      }
    }
    if (current) entries.push(current);
  }

  return entries;
}

function extractSection(content: string, heading: string): string | null {
  const re = new RegExp(`^##\\s+.*${heading}.*$`, 'mi');
  const match = content.match(re);
  if (!match || match.index === undefined) return null;
  const start = match.index + match[0].length;
  const nextSection = content.slice(start).match(/^##\s+/m);
  const end = nextSection?.index !== undefined ? start + nextSection.index : content.length;
  return content.slice(start, end);
}

export type SourceType = 'fallback' | 'daily' | 'weekly' | 'weeks' | 'oral';

export function detectFormat(content: string, sourceType: SourceType): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (sourceType === 'fallback') return 'A';
  if (sourceType === 'daily') return 'B';
  if (sourceType === 'weekly') return 'D';
  // weeks can be C or E
  if (/## Vocabulary Matrix/i.test(content) || /## Collocations/i.test(content)) return 'E';
  if (/\|\s*Word\s*\|\s*IPA\s*\|\s*POS\s*\|/i.test(content)) return 'C';
  if (/\|\s*Word\s*\|\s*IPA\s*\|\s*Meaning\s*\|/i.test(content)) return 'E';
  return 'C';
}

export function parseContent(content: string, sourceType: SourceType): ParsedEntry[] {
  const format = detectFormat(content, sourceType);
  switch (format) {
    case 'A': return parseFormatA(content);
    case 'B': return parseFormatB(content);
    case 'C': return parseFormatC(content);
    case 'D': return parseFormatD(content);
    case 'E': return parseFormatE(content);
  }
}
