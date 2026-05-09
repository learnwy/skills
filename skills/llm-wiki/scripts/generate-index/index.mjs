#!/usr/bin/env node
import { readFile, readdir, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { homedir } from "node:os";

;// CONCATENATED MODULE: external "node:fs/promises"

;// CONCATENATED MODULE: external "node:path"

;// CONCATENATED MODULE: external "node:os"

;// CONCATENATED MODULE: ./src/llm-wiki/shared/constants.ts


const WIKI_ROOT = process.env.LLM_WIKI_ROOT || join(homedir(), '.learnwy', 'llm-wiki');
const WIKI_DIR = join(WIKI_ROOT, 'wiki');
const RAW_DIR = join(WIKI_ROOT, 'raw');
const PAGE_TYPES = [
    {
        type: 'summaries',
        label: 'Summaries'
    },
    {
        type: 'concepts',
        label: 'Concepts'
    },
    {
        type: 'entities',
        label: 'Entities'
    },
    {
        type: 'comparisons',
        label: 'Comparisons'
    },
    {
        type: 'snippets',
        label: 'Snippets'
    },
    {
        type: 'troubleshooting',
        label: 'Troubleshooting'
    },
    {
        type: 'decisions',
        label: 'Decisions'
    },
    {
        type: 'cheatsheets',
        label: 'Cheatsheets'
    }
];
const PAGE_DIRS = PAGE_TYPES.map((p)=>p.type);
const RAW_SUBDIRS = [
    'books',
    'articles',
    'papers',
    'notes',
    'podcasts',
    'transcripts',
    'snippets',
    'troubleshooting',
    'specs',
    'decisions'
];

;// CONCATENATED MODULE: ./src/llm-wiki/shared/fs-utils.ts


async function readMdFiles(dir) {
    try {
        const entries = await readdir(dir);
        return entries.filter((f)=>f.endsWith('.md')).sort();
    } catch  {
        return [];
    }
}
async function readMdFilesDeep(dir) {
    const results = [];
    try {
        const entries = await readdir(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            if (entry.isDirectory()) {
                const subFiles = await readMdFiles(join(dir, entry.name));
                for (const f of subFiles){
                    results.push({
                        file: f,
                        subdir: entry.name
                    });
                }
            } else if (entry.name.endsWith('.md')) {
                results.push({
                    file: entry.name,
                    subdir: ''
                });
            }
        }
    } catch  {
    /* empty */ }
    return results.sort((a, b)=>a.file.localeCompare(b.file));
}
async function countMdFiles(dir) {
    return (await readMdFiles(dir)).length;
}
async function countMdFilesDeep(dir) {
    return (await readMdFilesDeep(dir)).length;
}
async function countMdFilesInSubdirs(baseDir, subdirs) {
    let total = 0;
    for (const sub of subdirs){
        total += await countMdFiles(join(baseDir, sub));
    }
    return total;
}

;// CONCATENATED MODULE: ./src/llm-wiki/shared/meta.ts


const META_KEYS = [
    'title',
    'discipline',
    'platform',
    'source',
    'author',
    'year',
    'verified'
];
const META_SCAN_LINES = 20;
async function extractMeta(filePath) {
    const empty = Object.fromEntries(META_KEYS.map((k)=>[
            k,
            ''
        ]));
    try {
        const content = await readFile(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, META_SCAN_LINES);
        const meta = {
            ...empty
        };
        for (const line of lines){
            if (line.startsWith('# ')) {
                meta.title = line.slice(2).trim();
                continue;
            }
            if (line.startsWith('**Discipline**:')) {
                meta.discipline = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Platform**:')) {
                meta.platform = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Source**:')) {
                meta.source = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Verified**:')) {
                meta.verified = line.split(':').slice(1).join(':').trim();
            }
            if (line.startsWith('**Author**:')) {
                meta.author = line.split('|')[0].replace('**Author**:', '').trim();
                const yearMatch = line.match(/\*\*(Year|Date)\*\*:\s*(.+?)(\s*\||$)/);
                if (yearMatch) meta.year = yearMatch[2].trim();
            }
            if (!meta.year) {
                const yearOnly = line.match(/\*\*(Year|Date)\*\*:\s*(.+?)(\s*\||$)/);
                if (yearOnly) meta.year = yearOnly[2].trim();
            }
        }
        return meta;
    } catch  {
        return {
            ...empty,
            title: basename(filePath, '.md')
        };
    }
}
function slugToTitle(slug) {
    return slug.replace(/\.md$/, '').split('-').map((w)=>w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

;// CONCATENATED MODULE: ./src/llm-wiki/shared/categories.ts
const CATEGORY_ORDER = [
    {
        category: 'Software Engineering',
        match: [
            'Software Engineering'
        ]
    },
    {
        category: 'Frontend Engineering',
        match: [
            'Frontend Engineering',
            'web'
        ]
    },
    {
        category: 'iOS Development',
        match: [
            'iOS Development',
            'iOS',
            'ios'
        ]
    },
    {
        category: 'Android Development',
        match: [
            'Android Development',
            'Android',
            'android'
        ]
    },
    {
        category: 'Go BFF',
        match: [
            'Go BFF',
            'Go',
            'server'
        ]
    },
    {
        category: 'AI/ML',
        match: [
            'AI/ML',
            'Artificial Intelligence',
            'Machine Learning'
        ]
    },
    {
        category: 'System Design',
        match: [
            'System Design',
            'Software Design'
        ]
    },
    {
        category: 'Thinking & Learning',
        match: [
            'Thinking',
            'Learning',
            'Psychology',
            'Education'
        ]
    },
    {
        category: 'Writing & Literature',
        match: [
            'Writing',
            'Literature'
        ]
    },
    {
        category: 'Humanities & Social Sciences',
        match: [
            'Philosophy',
            'Linguistics',
            'History',
            'Law',
            'Political Science',
            'Sociology',
            'Art'
        ]
    },
    {
        category: 'Economics & Business',
        match: [
            'Economics',
            'Finance',
            'Management',
            'Accounting',
            'Marketing',
            'International Trade'
        ]
    },
    {
        category: 'Natural Sciences',
        match: [
            'Mathematics',
            'Physics',
            'Chemistry',
            'Geography',
            'Astronomy',
            'Ecology'
        ]
    },
    {
        category: 'Life & Medical Sciences',
        match: [
            'Biology',
            'Medicine',
            'Medical',
            'Traditional Chinese',
            'Public Health',
            'Nursing',
            'Veterinary'
        ]
    },
    {
        category: 'Engineering & Technology',
        match: [
            'Computer Science',
            'Electronic',
            'Mechanical',
            'Civil',
            'Architecture',
            'Materials',
            'Energy',
            'Environmental',
            'Urban',
            'Traffic'
        ]
    },
    {
        category: 'Agriculture & Forestry',
        match: [
            'Agronomy',
            'Forestry',
            'Horticulture',
            'Aquaculture',
            'Animal Husbandry'
        ]
    },
    {
        category: 'Interdisciplinary',
        match: [
            'Big Data',
            'Bioinformatics',
            'Food Science',
            'Pharmacy',
            'Kinesiology'
        ]
    },
    {
        category: 'Practical Skills',
        match: [
            'English',
            'Database',
            'Operating System',
            'UI/UX',
            'Software Testing',
            'Programming',
            'Design'
        ]
    },
    {
        category: 'Cross-Platform',
        match: [
            'cross-platform'
        ]
    },
    {
        category: 'Methodology',
        match: [
            'Methodology'
        ]
    }
];
function categorize(discipline) {
    const d = discipline.toLowerCase();
    for (const { category, match } of CATEGORY_ORDER){
        if (match.some((m)=>d.includes(m.toLowerCase()))) return category;
    }
    return 'Other';
}

;// CONCATENATED MODULE: ./src/llm-wiki/shared/index.ts





;// CONCATENATED MODULE: ./src/llm-wiki/generate-index/index.ts



const DEEP_SCAN_TYPES = new Set([
    'concepts'
]);
async function scanPages() {
    const allPages = {};
    let totalPages = 0;
    for (const { type } of PAGE_TYPES){
        const dir = join(WIKI_DIR, type);
        const pages = [];
        if (DEEP_SCAN_TYPES.has(type)) {
            const entries = await readMdFilesDeep(dir);
            for (const { file, subdir } of entries){
                const relPath = subdir ? `${subdir}/${file}` : file;
                const meta = await extractMeta(join(dir, relPath));
                const slug = file.replace('.md', '');
                pages.push({
                    slug,
                    file,
                    relPath,
                    subdir,
                    ...meta,
                    title: meta.title || slugToTitle(slug)
                });
            }
        } else {
            const files = await readMdFiles(dir);
            for (const file of files){
                const meta = await extractMeta(join(dir, file));
                const slug = file.replace('.md', '');
                pages.push({
                    slug,
                    file,
                    relPath: file,
                    subdir: '',
                    ...meta,
                    title: meta.title || slugToTitle(slug)
                });
            }
        }
        allPages[type] = pages;
        totalPages += pages.length;
    }
    return {
        allPages,
        totalPages
    };
}
function groupByDiscipline(allPages) {
    const groups = {};
    for (const [type, pages] of Object.entries(allPages)){
        for (const page of pages){
            const disc = page.discipline || page.platform || 'Uncategorized';
            if (!groups[disc]) groups[disc] = {};
            if (!groups[disc][type]) groups[disc][type] = [];
            groups[disc][type].push(page);
        }
    }
    return groups;
}
function organizeByCategory(disciplineGroups) {
    const organized = {};
    for (const [disc, types] of Object.entries(disciplineGroups)){
        const cat = categorize(disc);
        if (!organized[cat]) organized[cat] = {
            disciplines: {}
        };
        if (!organized[cat].disciplines[disc]) organized[cat].disciplines[disc] = {};
        for (const [type, pages] of Object.entries(types)){
            if (!organized[cat].disciplines[disc][type]) organized[cat].disciplines[disc][type] = [];
            organized[cat].disciplines[disc][type].push(...pages);
        }
    }
    return organized;
}
function renderSection(types) {
    const lines = [];
    const summaries = types.summaries || [];
    const concepts = types.concepts || [];
    const snippets = types.snippets || [];
    const troubles = types.troubleshooting || [];
    const comparisons = types.comparisons || [];
    for (const s of summaries){
        const yearStr = s.year ? ` (${s.year})` : '';
        lines.push(`- [${s.title}](summaries/${s.relPath})${yearStr}`);
    }
    for (const c of concepts){
        const tag = c.verified === 'no' ? " \u26A0\uFE0F" : '';
        lines.push(`  - [${c.title}](concepts/${c.relPath})${tag}`);
    }
    if (snippets.length > 0) {
        lines.push('  - **Snippets**:');
        for (const sn of snippets)lines.push(`    - [${sn.title}](snippets/${sn.relPath})`);
    }
    if (troubles.length > 0) {
        lines.push('  - **Troubleshooting**:');
        for (const t of troubles)lines.push(`    - [${t.title}](troubleshooting/${t.relPath})`);
    }
    for (const comp of comparisons){
        lines.push(`  - [${comp.title}](comparisons/${comp.relPath})`);
    }
    return lines;
}
function renderIndex({ allPages, totalPages, rawCount, organized }) {
    const lines = [];
    const now = new Date().toISOString().slice(0, 10);
    const statsLine = Object.entries(allPages).filter(([, p])=>p.length > 0).map(([type, p])=>`${p.length} ${type}`).join(', ');
    lines.push('# Knowledge Base Index');
    lines.push('');
    lines.push('**Created**: 2026-04-26');
    lines.push(`**Last updated**: ${now}`);
    lines.push(`**Total sources**: ${rawCount}`);
    lines.push(`**Total wiki pages**: ${totalPages} (${statsLine})`);
    lines.push('');
    lines.push('> This file is auto-generated by `scripts/generate-index`. Do not edit manually.');
    lines.push('');
    lines.push('---');
    lines.push('');
    lines.push('## By Category');
    lines.push('');
    for (const { category } of CATEGORY_ORDER){
        const catData = organized[category];
        if (!catData) continue;
        let catSummaries = 0;
        let catConcepts = 0;
        let catSnippets = 0;
        let catTrouble = 0;
        let catComps = 0;
        for (const types of Object.values(catData.disciplines)){
            catSummaries += (types.summaries || []).length;
            catConcepts += (types.concepts || []).length;
            catSnippets += (types.snippets || []).length;
            catTrouble += (types.troubleshooting || []).length;
            catComps += (types.comparisons || []).length;
        }
        const parts = [];
        if (catSummaries) parts.push(`${catSummaries} books/articles`);
        if (catConcepts) parts.push(`${catConcepts} concepts`);
        if (catSnippets) parts.push(`${catSnippets} snippets`);
        if (catTrouble) parts.push(`${catTrouble} troubleshooting`);
        if (catComps) parts.push(`${catComps} comparisons`);
        lines.push(`### ${category} (${parts.join(', ')})`);
        lines.push('');
        for (const types of Object.values(catData.disciplines)){
            lines.push(...renderSection(types));
        }
        lines.push('');
    }
    if (organized['Other']) {
        lines.push('### Other');
        lines.push('');
        for (const types of Object.values(organized['Other'].disciplines)){
            lines.push(...renderSection(types));
        }
        lines.push('');
    }
    lines.push('## Entities');
    lines.push('');
    for (const e of allPages.entities || []){
        lines.push(`- [${e.title}](entities/${e.relPath})`);
    }
    lines.push('');
    return lines.join('\n');
}
async function run() {
    console.log('Scanning wiki directory...');
    const { allPages, totalPages } = await scanPages();
    for (const { type, label } of PAGE_TYPES){
        console.log(`  ${label}: ${allPages[type].length}`);
    }
    const rawCount = await countMdFilesInSubdirs(RAW_DIR, RAW_SUBDIRS);
    console.log(`  Raw sources: ${rawCount}`);
    const disciplineGroups = groupByDiscipline(allPages);
    const organized = organizeByCategory(disciplineGroups);
    const output = renderIndex({
        allPages,
        totalPages,
        rawCount,
        organized
    });
    const outPath = join(WIKI_DIR, 'index.md');
    await writeFile(outPath, output);
    console.log(`\nGenerated wiki/index.md (${totalPages} pages indexed)`);
}
run().catch((err)=>{
    console.error('generate-index failed:', err.message);
    process.exit(1);
});

