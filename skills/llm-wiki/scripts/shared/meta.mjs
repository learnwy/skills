import { readFile } from 'node:fs/promises'
import { basename } from 'node:path'

const META_KEYS = ['title', 'discipline', 'platform', 'source', 'author', 'year', 'verified']
const META_SCAN_LINES = 20

export async function extractMeta(filePath) {
  const empty = Object.fromEntries(META_KEYS.map(k => [k, '']))

  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\n').slice(0, META_SCAN_LINES)
    const meta = { ...empty }

    for (const line of lines) {
      if (line.startsWith('# ')) {
        meta.title = line.slice(2).trim()
        continue
      }
      if (line.startsWith('**Discipline**:')) {
        meta.discipline = line.split(':').slice(1).join(':').trim()
      }
      if (line.startsWith('**Platform**:')) {
        meta.platform = line.split(':').slice(1).join(':').trim()
      }
      if (line.startsWith('**Source**:')) {
        meta.source = line.split(':').slice(1).join(':').trim()
      }
      if (line.startsWith('**Verified**:')) {
        meta.verified = line.split(':').slice(1).join(':').trim()
      }
      if (line.startsWith('**Author**:')) {
        meta.author = line.split('|')[0].replace('**Author**:', '').trim()
        const yearMatch = line.match(/\*\*(Year|Date)\*\*:\s*(.+?)(\s*\||$)/)
        if (yearMatch) meta.year = yearMatch[2].trim()
      }
      if (!meta.year) {
        const yearOnly = line.match(/\*\*(Year|Date)\*\*:\s*(.+?)(\s*\||$)/)
        if (yearOnly) meta.year = yearOnly[2].trim()
      }
    }

    return meta
  } catch {
    return { ...empty, title: basename(filePath, '.md') }
  }
}

export function slugToTitle(slug) {
  return slug
    .replace(/\.md$/, '')
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
