#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { WIKI_DIR, PAGE_DIRS } from '../shared/index.mjs'

const STALE_DAYS = 180  // 6 months
const TECH_STALE_DAYS = 90  // 3 months for fast-moving tech
const FAST_MOVING_DOMAINS = ['frontend engineering', 'ios development', 'android development', 'go bff', 'ai/ml']
const META_SCAN_LINES = 25

function parseDate(str) {
  if (!str) return null
  const d = new Date(str.trim())
  return isNaN(d.getTime()) ? null : d
}

async function extractPageMeta(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8')
    const lines = content.split('\n').slice(0, META_SCAN_LINES)
    const meta = { title: '', discipline: '', ingested: '', lastVerified: '', verified: '' }

    for (const line of lines) {
      if (line.startsWith('# ')) meta.title = line.slice(2).trim()
      if (line.startsWith('**Discipline**:')) meta.discipline = line.split(':').slice(1).join(':').trim()
      if (line.startsWith('**Platform**:')) meta.discipline = meta.discipline || line.split(':').slice(1).join(':').trim()
      if (line.startsWith('**Ingested**:')) meta.ingested = line.split(':').slice(1).join(':').trim()
      if (line.startsWith('**Last verified**:')) meta.lastVerified = line.split(':').slice(1).join(':').trim()
      if (line.startsWith('**Verified**:')) meta.verified = line.split(':').slice(1).join(':').trim()
    }

    return meta
  } catch {
    return { title: '', discipline: '', ingested: '', lastVerified: '', verified: '' }
  }
}

function isFastMoving(discipline) {
  const d = discipline.toLowerCase()
  return FAST_MOVING_DOMAINS.some(domain => d.includes(domain))
}

async function scanDir(baseDir, subdir) {
  const dir = join(baseDir, subdir)
  const results = []

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Handle concept subdirectories
        const subFiles = await readdir(join(dir, entry.name))
        for (const file of subFiles.filter(f => f.endsWith('.md'))) {
          const filePath = join(dir, entry.name, file)
          const meta = await extractPageMeta(filePath)
          results.push({ path: `${subdir}/${entry.name}/${file}`, ...meta })
        }
      } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'overview.md' && entry.name !== 'topics.txt') {
        const filePath = join(dir, entry.name)
        const meta = await extractPageMeta(filePath)
        results.push({ path: `${subdir}/${entry.name}`, ...meta })
      }
    }
  } catch { /* directory doesn't exist */ }

  return results
}

async function run() {
  const now = new Date()
  console.log(`Freshness check — ${now.toISOString().slice(0, 10)}\n`)

  const stale = []
  const unverified = []
  const noDate = []

  for (const subdir of PAGE_DIRS) {
    const pages = await scanDir(WIKI_DIR, subdir)

    for (const page of pages) {
      const refDate = parseDate(page.lastVerified) || parseDate(page.ingested)

      if (!refDate) {
        noDate.push(page)
        continue
      }

      const ageMs = now.getTime() - refDate.getTime()
      const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24))
      const threshold = isFastMoving(page.discipline) ? TECH_STALE_DAYS : STALE_DAYS

      if (ageDays > threshold) {
        stale.push({ ...page, ageDays, threshold })
      }

      if (page.verified === 'no') {
        unverified.push({ ...page, ageDays })
      }
    }
  }

  // Report
  if (stale.length > 0) {
    console.log(`Stale pages (${stale.length}):`)
    console.log(`  (threshold: ${TECH_STALE_DAYS}d for tech, ${STALE_DAYS}d for others)\n`)
    const byAge = stale.sort((a, b) => b.ageDays - a.ageDays)
    for (const p of byAge.slice(0, 30)) {
      const domain = isFastMoving(p.discipline) ? '⚡' : '  '
      console.log(`  ${domain} ${String(p.ageDays).padStart(4)}d  ${p.path}`)
    }
    if (stale.length > 30) console.log(`  ... and ${stale.length - 30} more`)
    console.log('')
  }

  if (unverified.length > 0) {
    console.log(`Unverified pages (${unverified.length}):`)
    for (const p of unverified.slice(0, 20)) {
      console.log(`   ${p.path}`)
    }
    if (unverified.length > 20) console.log(`   ... and ${unverified.length - 20} more`)
    console.log('')
  }

  if (noDate.length > 0) {
    console.log(`Pages missing Ingested/Last-verified date (${noDate.length}):`)
    for (const p of noDate.slice(0, 20)) {
      console.log(`   ${p.path}`)
    }
    if (noDate.length > 20) console.log(`   ... and ${noDate.length - 20} more`)
    console.log('')
  }

  const total = stale.length + unverified.length + noDate.length
  if (total === 0) {
    console.log('All pages are fresh!')
  } else {
    console.log(`Summary: ${stale.length} stale, ${unverified.length} unverified, ${noDate.length} missing dates`)
  }
}

run().catch(err => {
  console.error('freshness-check failed:', err.message)
  process.exit(1)
})
