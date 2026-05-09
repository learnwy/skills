#!/usr/bin/env node
import { join as external_node_path_join } from "node:path";
import { homedir } from "node:os";
import { readdir } from "node:fs/promises";

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

;// CONCATENATED MODULE: external "node:fs/promises"

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
                const subFiles = await readMdFiles(external_node_path_join(dir, entry.name));
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





;// CONCATENATED MODULE: ./src/llm-wiki/stats/index.ts


const pad = (str, width)=>String(str).padEnd(width);
const num = (val, width)=>String(val).padStart(width);
async function run() {
    const DEEP_TYPES = new Set([
        'concepts'
    ]);
    const wiki = {};
    for (const { type } of PAGE_TYPES){
        wiki[type] = DEEP_TYPES.has(type) ? await countMdFilesDeep(external_node_path_join(WIKI_DIR, type)) : await countMdFiles(external_node_path_join(WIKI_DIR, type));
    }
    const raw = {};
    for (const sub of RAW_SUBDIRS){
        raw[sub] = await countMdFiles(external_node_path_join(RAW_DIR, sub));
    }
    const totalRaw = Object.values(raw).reduce((a, b)=>a + b, 0);
    const totalWiki = Object.values(wiki).reduce((a, b)=>a + b, 0);
    const W = 38;
    const line = (l, content, r)=>`${l}${content.padEnd(W - 2)}${r}`;
    console.log(line("\u2554", "\u2550".repeat(W - 2), "\u2557"));
    console.log(line("\u2551", '        LLM Wiki Dashboard         ', "\u2551"));
    console.log(line("\u2560", "\u2550".repeat(W - 2), "\u2563"));
    console.log(line("\u2551", '  Raw Sources (Layer 1)             ', "\u2551"));
    for (const [key, val] of Object.entries(raw)){
        if (val > 0) console.log(line("\u2551", `    ${pad(key, 20)} ${num(val, 5)}  `, "\u2551"));
    }
    console.log(line("\u2551", `    ${pad('TOTAL', 20)} ${num(totalRaw, 5)}  `, "\u2551"));
    console.log(line("\u2560", "\u2550".repeat(W - 2), "\u2563"));
    console.log(line("\u2551", '  Wiki Pages (Layer 2)              ', "\u2551"));
    for (const [key, val] of Object.entries(wiki)){
        if (val > 0) console.log(line("\u2551", `    ${pad(key, 20)} ${num(val, 5)}  `, "\u2551"));
    }
    console.log(line("\u2551", `    ${pad('TOTAL', 20)} ${num(totalWiki, 5)}  `, "\u2551"));
    console.log(line("\u2560", "\u2550".repeat(W - 2), "\u2563"));
    console.log(line("\u2551", `    ${pad('Grand Total', 20)} ${num(totalRaw + totalWiki, 5)}  `, "\u2551"));
    console.log(line("\u255A", "\u2550".repeat(W - 2), "\u255D"));
}
run().catch((err)=>{
    console.error('stats failed:', err.message);
    process.exit(1);
});

