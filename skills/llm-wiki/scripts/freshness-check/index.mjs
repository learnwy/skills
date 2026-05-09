#!/usr/bin/env node
import { readFile as promises_readFile, readdir as promises_readdir } from "node:fs/promises";
import { join as external_node_path_join } from "node:path";
import { homedir } from "node:os";

;// CONCATENATED MODULE: external "node:fs/promises"

;// CONCATENATED MODULE: external "node:path"

;// CONCATENATED MODULE: external "node:os"

;// CONCATENATED MODULE: ./src/llm-wiki/shared/constants.ts


const WIKI_ROOT = process.env.LLM_WIKI_ROOT || external_node_path_join(homedir(), '.learnwy', 'llm-wiki');
const WIKI_DIR = external_node_path_join(WIKI_ROOT, 'wiki');
const RAW_DIR = external_node_path_join(WIKI_ROOT, 'raw');
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
const RAW_SUBDIRS = (/* unused pure expression or super */ null && ([
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
]));

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


const META_KEYS = (/* unused pure expression or super */ null && ([
    'title',
    'discipline',
    'platform',
    'source',
    'author',
    'year',
    'verified'
]));
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
const CATEGORY_ORDER = (/* unused pure expression or super */ null && ([
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
]));
function categorize(discipline) {
    const d = discipline.toLowerCase();
    for (const { category, match } of CATEGORY_ORDER){
        if (match.some((m)=>d.includes(m.toLowerCase()))) return category;
    }
    return 'Other';
}

;// CONCATENATED MODULE: ./src/llm-wiki/shared/index.ts





;// CONCATENATED MODULE: ./src/llm-wiki/freshness-check/index.ts



const STALE_DAYS = 180;
const TECH_STALE_DAYS = 90;
const FAST_MOVING_DOMAINS = [
    'frontend engineering',
    'ios development',
    'android development',
    'go bff',
    'ai/ml'
];
const freshness_check_META_SCAN_LINES = 25;
function parseDate(str) {
    if (!str) return null;
    const d = new Date(str.trim());
    return isNaN(d.getTime()) ? null : d;
}
async function extractPageMeta(filePath) {
    const empty = {
        title: '',
        discipline: '',
        ingested: '',
        lastVerified: '',
        verified: ''
    };
    try {
        const content = await promises_readFile(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, freshness_check_META_SCAN_LINES);
        const meta = {
            ...empty
        };
        for (const line of lines){
            if (line.startsWith('# ')) meta.title = line.slice(2).trim();
            if (line.startsWith('**Discipline**:')) meta.discipline = line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Platform**:')) meta.discipline = meta.discipline || line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Ingested**:')) meta.ingested = line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Last verified**:')) meta.lastVerified = line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Verified**:')) meta.verified = line.split(':').slice(1).join(':').trim();
        }
        return meta;
    } catch  {
        return empty;
    }
}
const isFastMoving = (discipline)=>{
    const d = discipline.toLowerCase();
    return FAST_MOVING_DOMAINS.some((domain)=>d.includes(domain));
};
async function scanDir(baseDir, subdir) {
    const dir = external_node_path_join(baseDir, subdir);
    const results = [];
    try {
        const entries = await promises_readdir(dir, {
            withFileTypes: true
        });
        for (const entry of entries){
            if (entry.isDirectory()) {
                const subFiles = await promises_readdir(external_node_path_join(dir, entry.name));
                for (const file of subFiles.filter((f)=>f.endsWith('.md'))){
                    const filePath = external_node_path_join(dir, entry.name, file);
                    const meta = await extractPageMeta(filePath);
                    results.push({
                        path: `${subdir}/${entry.name}/${file}`,
                        ...meta
                    });
                }
            } else if (entry.name.endsWith('.md') && entry.name !== 'index.md' && entry.name !== 'overview.md' && entry.name !== 'topics.txt') {
                const filePath = external_node_path_join(dir, entry.name);
                const meta = await extractPageMeta(filePath);
                results.push({
                    path: `${subdir}/${entry.name}`,
                    ...meta
                });
            }
        }
    } catch  {
    /* empty */ }
    return results;
}
async function run() {
    const now = new Date();
    console.log(`Freshness check \u{2014} ${now.toISOString().slice(0, 10)}\n`);
    const stale = [];
    const unverified = [];
    const noDate = [];
    for (const subdir of PAGE_DIRS){
        const pages = await scanDir(WIKI_DIR, subdir);
        for (const page of pages){
            const refDate = parseDate(page.lastVerified) || parseDate(page.ingested);
            if (!refDate) {
                noDate.push(page);
                continue;
            }
            const ageMs = now.getTime() - refDate.getTime();
            const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
            const threshold = isFastMoving(page.discipline) ? TECH_STALE_DAYS : STALE_DAYS;
            if (ageDays > threshold) stale.push({
                ...page,
                ageDays,
                threshold
            });
            if (page.verified === 'no') unverified.push({
                ...page,
                ageDays
            });
        }
    }
    if (stale.length > 0) {
        console.log(`Stale pages (${stale.length}):`);
        console.log(`  (threshold: ${TECH_STALE_DAYS}d for tech, ${STALE_DAYS}d for others)\n`);
        const byAge = stale.sort((a, b)=>b.ageDays - a.ageDays);
        for (const p of byAge.slice(0, 30)){
            const domain = isFastMoving(p.discipline) ? "\u26A1" : '  ';
            console.log(`  ${domain} ${String(p.ageDays).padStart(4)}d  ${p.path}`);
        }
        if (stale.length > 30) console.log(`  ... and ${stale.length - 30} more`);
        console.log('');
    }
    if (unverified.length > 0) {
        console.log(`Unverified pages (${unverified.length}):`);
        for (const p of unverified.slice(0, 20))console.log(`   ${p.path}`);
        if (unverified.length > 20) console.log(`   ... and ${unverified.length - 20} more`);
        console.log('');
    }
    if (noDate.length > 0) {
        console.log(`Pages missing Ingested/Last-verified date (${noDate.length}):`);
        for (const p of noDate.slice(0, 20))console.log(`   ${p.path}`);
        if (noDate.length > 20) console.log(`   ... and ${noDate.length - 20} more`);
        console.log('');
    }
    const total = stale.length + unverified.length + noDate.length;
    if (total === 0) {
        console.log('All pages are fresh!');
    } else {
        console.log(`Summary: ${stale.length} stale, ${unverified.length} unverified, ${noDate.length} missing dates`);
    }
}
run().catch((err)=>{
    console.error('freshness-check failed:', err.message);
    process.exit(1);
});

