#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { WIKI_DIR, PAGE_DIRS, readMdFiles, readMdFilesDeep } from '../shared/index.mjs'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'that', 'this', 'into',
  'not', 'but', 'are', 'was', 'has', 'had', 'its', 'you', 'your',
  'how', 'why', 'what', 'when', 'who', 'all', 'can', 'will',
  'use', 'get', 'set', 'new', 'old', 'one', 'two', 'via', 'per',
])

const MIN_WORD_LENGTH = 3
const DEEP_SCAN_TYPES = new Set(['concepts'])

async function extractDiscipline(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\n').slice(0, 15)
    for (const line of lines) {
      if (line.startsWith('**Discipline**:')) return line.split(':').slice(1).join(':').trim()
      if (line.startsWith('**Platform**:')) return line.split(':').slice(1).join(':').trim()
    }
  } catch { /* empty */ }
  return ''
}

function slugToWords(slug) {
  return slug
    .split('-')
    .filter(w => w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w.toLowerCase()))
}

async function run() {
  const keywords = new Set()
  const disciplines = new Set()

  for (const dir of PAGE_DIRS) {
    const dirPath = join(WIKI_DIR, dir)
    let entries

    if (DEEP_SCAN_TYPES.has(dir)) {
      entries = (await readMdFilesDeep(dirPath)).map(e => ({
        file: e.file,
        fullPath: join(dirPath, e.subdir ? `${e.subdir}/${e.file}` : e.file)
      }))
    } else {
      const files = await readMdFiles(dirPath)
      entries = files.map(f => ({ file: f, fullPath: join(dirPath, f) }))
    }

    for (const { file, fullPath } of entries) {
      const slug = file.replace('.md', '')
      keywords.add(slug)

      for (const word of slugToWords(slug)) {
        keywords.add(word.toLowerCase())
      }

      const disc = await extractDiscipline(fullPath)
      if (disc) disciplines.add(disc)
    }
  }

  const lines = [
    '# Auto-generated topic keywords for fast auto-query scanning',
    `# Generated: ${new Date().toISOString().slice(0, 10)}`,
    `# Total keywords: ${keywords.size}`,
    '',
  ]

  for (const d of [...disciplines].sort()) {
    lines.push(d.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
  }
  lines.push('')

  for (const k of [...keywords].sort()) {
    lines.push(k)
  }

  const outPath = join(WIKI_DIR, 'topics.txt')
  await writeFile(outPath, lines.join('\n'))
  console.log(`Generated wiki/topics.txt (${keywords.size} keywords from ${disciplines.size} disciplines)`)
}

run().catch(err => {
  console.error('generate-topics failed:', err.message)
  process.exit(1)
})
