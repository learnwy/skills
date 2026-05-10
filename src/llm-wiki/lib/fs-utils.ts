import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function readMdFiles(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries.filter((f) => f.endsWith('.md')).sort();
  } catch {
    return [];
  }
}

export interface DeepEntry {
  file: string;
  subdir: string;
}

export async function readMdFilesDeep(dir: string): Promise<DeepEntry[]> {
  const results: DeepEntry[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subFiles = await readMdFiles(join(dir, entry.name));
        for (const f of subFiles) {
          results.push({ file: f, subdir: entry.name });
        }
      } else if (entry.name.endsWith('.md')) {
        results.push({ file: entry.name, subdir: '' });
      }
    }
  } catch {
    /* empty */
  }
  return results.sort((a, b) => a.file.localeCompare(b.file));
}

export async function countMdFiles(dir: string): Promise<number> {
  return (await readMdFiles(dir)).length;
}

export async function countMdFilesDeep(dir: string): Promise<number> {
  return (await readMdFilesDeep(dir)).length;
}

export async function countMdFilesInSubdirs(baseDir: string, subdirs: string[]): Promise<number> {
  let total = 0;
  for (const sub of subdirs) {
    total += await countMdFiles(join(baseDir, sub));
  }
  return total;
}
