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

export async function countMdFiles(dir) {
  const files = await readMdFiles(dir)
  return files.length
}

export async function countMdFilesInSubdirs(baseDir, subdirs) {
  let total = 0
  for (const sub of subdirs) {
    total += await countMdFiles(join(baseDir, sub))
  }
  return total
}
