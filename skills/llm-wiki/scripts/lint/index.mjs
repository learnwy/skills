#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { WIKI_DIR, PAGE_DIRS, readMdFiles, readMdFilesDeep } from '../shared/index.mjs'

const DEEP_SCAN_TYPES = new Set(['concepts'])

async function buildInventory() {
  const inventory = new Set()
  const allFiles = {}

  for (const dir of PAGE_DIRS) {
    const dirPath = join(WIKI_DIR, dir)
    allFiles[dir] = []

    if (DEEP_SCAN_TYPES.has(dir)) {
      const entries = await readMdFilesDeep(dirPath)
      for (const { file, subdir } of entries) {
        const relPath = subdir ? `${subdir}/${file}` : file
        allFiles[dir].push({ file, relPath, subdir })

        // Register both flat and nested paths for backward compatibility
        const slug = file.replace('.md', '')
        inventory.add(`${dir}/${slug}`)
        inventory.add(`${dir}/${file}`)
        if (subdir) {
          inventory.add(`${dir}/${subdir}/${slug}`)
          inventory.add(`${dir}/${subdir}/${file}`)
        }
      }
    } else {
      const files = await readMdFiles(dirPath)
      for (const file of files) {
        allFiles[dir].push({ file, relPath: file, subdir: '' })
        inventory.add(`${dir}/${file.replace('.md', '')}`)
        inventory.add(`${dir}/${file}`)
      }
    }
  }

  inventory.add('index.md')
  inventory.add('overview.md')

  return { inventory, allFiles }
}

function checkWikilinks(content, inventory) {
  const broken = []
  const resolved = []

  for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)) {
    const link = match[1].replace(/\.md$/, '')
    const normalized = link.replace(/^raw\//, '').replace(/^wiki\//, '')
    const isWikiLink = PAGE_DIRS.some(d => normalized.startsWith(`${d}/`))

    if (!isWikiLink) continue

    const withMd = normalized.endsWith('.md') ? normalized : `${normalized}.md`
    const withoutMd = normalized.replace(/\.md$/, '')

    if (!inventory.has(withMd) && !inventory.has(withoutMd)) {
      broken.push(match[1])
    } else {
      resolved.push(withoutMd)
    }
  }

  return { broken, resolved }
}

function checkMetaTags(dir, content) {
  const missing = []

  if (dir === 'snippets') {
    if (!content.includes('**Language**:')) missing.push('**Language**: tag')
    if (!content.includes('**Platform**:')) missing.push('**Platform**: tag')
  }
  if (dir === 'troubleshooting') {
    if (!content.includes('**Platform**:')) missing.push('**Platform**: tag')
    if (!content.includes('**Severity**:')) missing.push('**Severity**: tag')
  }

  return missing
}

async function run() {
  console.log('Linting wiki...\n')

  const { inventory, allFiles } = await buildInventory()
  const errors = []
  const warnings = []
  const incomingLinks = {}
  let totalLinks = 0
  let totalPages = 0

  for (const dir of PAGE_DIRS) {
    for (const { file, relPath, subdir } of (allFiles[dir] || [])) {
      const filePath = subdir
        ? join(WIKI_DIR, dir, subdir, file)
        : join(WIKI_DIR, dir, file)
      const content = await readFile(filePath, 'utf-8')
      const loc = `${dir}/${relPath}`
      totalPages++

      if (!content.split('\n')[0]?.startsWith('# ')) {
        warnings.push(`${loc}: Missing # title on line 1`)
      }

      const { broken, resolved } = checkWikilinks(content, inventory)
      totalLinks += broken.length + resolved.length

      for (const link of broken) {
        errors.push(`${loc}: Broken link -> [[${link}]]`)
      }
      for (const target of resolved) {
        incomingLinks[target] = (incomingLinks[target] || 0) + 1
      }

      const missingTags = checkMetaTags(dir, content)
      for (const tag of missingTags) {
        warnings.push(`${loc}: Missing ${tag}`)
      }
    }
  }

  // Orphan detection (skip entities and comparisons)
  for (const dir of PAGE_DIRS) {
    if (dir === 'entities' || dir === 'comparisons') continue
    for (const { file, subdir } of (allFiles[dir] || [])) {
      const slug = file.replace('.md', '')
      // Check both flat and nested paths
      const flatKey = `${dir}/${slug}`
      const nestedKey = subdir ? `${dir}/${subdir}/${slug}` : flatKey
      if (!incomingLinks[flatKey] && !incomingLinks[nestedKey]) {
        const loc = subdir ? `${dir}/${subdir}/${file}` : `${dir}/${file}`
        warnings.push(`${loc}: Orphan page (no incoming wikilinks)`)
      }
    }
  }

  // Report
  console.log('Statistics:')
  for (const dir of PAGE_DIRS) {
    const count = (allFiles[dir] || []).length
    if (count > 0) console.log(`   ${dir}: ${count}`)
  }
  console.log(`   Total pages: ${totalPages}`)
  console.log(`   Total wikilinks: ${totalLinks}`)
  console.log(`   Broken links: ${errors.length}`)
  console.log('')

  if (errors.length > 0) {
    console.log(`Errors (${errors.length}):`)
    for (const e of errors.slice(0, 50)) console.log(`   ${e}`)
    if (errors.length > 50) console.log(`   ... and ${errors.length - 50} more`)
    console.log('')
  }

  if (warnings.length > 0) {
    console.log(`Warnings (${warnings.length}):`)
    for (const w of warnings.slice(0, 30)) console.log(`   ${w}`)
    if (warnings.length > 30) console.log(`   ... and ${warnings.length - 30} more`)
    console.log('')
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('No issues found!')
  }

  process.exit(errors.length > 0 ? 1 : 0)
}

run().catch(err => {
  console.error('lint failed:', err.message)
  process.exit(1)
})
