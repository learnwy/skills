import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function readMdFiles(dir) {
  try {
    const entries = await readdir(dir)
    return entries.filter(f => f.endsWith('.md')).sort()
  } catch {
    return []
  }
}

// Read .md files recursively (one level of subdirs)
// Returns array of { file, subdir } where subdir is '' for root-level files
export async function readMdFilesDeep(dir) {
  const results = []
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subFiles = await readMdFiles(join(dir, entry.name))
        for (const f of subFiles) {
          results.push({ file: f, subdir: entry.name })
        }
      } else if (entry.name.endsWith('.md')) {
        results.push({ file: entry.name, subdir: '' })
      }
    }
  } catch { /* empty */ }
  return results.sort((a, b) => a.file.localeCompare(b.file))
}

export async function countMdFiles(dir) {
  const files = await readMdFiles(dir)
  return files.length
}

export async function countMdFilesDeep(dir) {
  const files = await readMdFilesDeep(dir)
  return files.length
}

export async function countMdFilesInSubdirs(baseDir, subdirs) {
  let total = 0
  for (const sub of subdirs) {
    total += await countMdFiles(join(baseDir, sub))
  }
  return total
}
