#!/usr/bin/env node
import { readFile as promises_readFile, readdir, writeFile } from "node:fs/promises";
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





;// CONCATENATED MODULE: ./src/llm-wiki/generate-topics/index.ts



const STOP_WORDS = new Set([
    'the',
    'and',
    'for',
    'with',
    'from',
    'that',
    'this',
    'into',
    'not',
    'but',
    'are',
    'was',
    'has',
    'had',
    'its',
    'you',
    'your',
    'how',
    'why',
    'what',
    'when',
    'who',
    'all',
    'can',
    'will',
    'use',
    'get',
    'set',
    'new',
    'old',
    'one',
    'two',
    'via',
    'per'
]);
const MIN_WORD_LENGTH = 3;
const DEEP_SCAN_TYPES = new Set([
    'concepts'
]);
async function extractDiscipline(filePath) {
    try {
        const content = await promises_readFile(filePath, 'utf-8');
        const lines = content.split('\n').slice(0, 15);
        for (const line of lines){
            if (line.startsWith('**Discipline**:')) return line.split(':').slice(1).join(':').trim();
            if (line.startsWith('**Platform**:')) return line.split(':').slice(1).join(':').trim();
        }
    } catch  {
    /* empty */ }
    return '';
}
function slugToWords(slug) {
    return slug.split('-').filter((w)=>w.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(w.toLowerCase()));
}
async function run() {
    const keywords = new Set();
    const disciplines = new Set();
    for (const dir of PAGE_DIRS){
        const dirPath = external_node_path_join(WIKI_DIR, dir);
        let entries;
        if (DEEP_SCAN_TYPES.has(dir)) {
            entries = (await readMdFilesDeep(dirPath)).map((e)=>({
                    file: e.file,
                    fullPath: external_node_path_join(dirPath, e.subdir ? `${e.subdir}/${e.file}` : e.file)
                }));
        } else {
            const files = await readMdFiles(dirPath);
            entries = files.map((f)=>({
                    file: f,
                    fullPath: external_node_path_join(dirPath, f)
                }));
        }
        for (const { file, fullPath } of entries){
            const slug = file.replace('.md', '');
            keywords.add(slug);
            for (const word of slugToWords(slug))keywords.add(word.toLowerCase());
            const disc = await extractDiscipline(fullPath);
            if (disc) disciplines.add(disc);
        }
    }
    const lines = [
        '# Auto-generated topic keywords for fast auto-query scanning',
        `# Generated: ${new Date().toISOString().slice(0, 10)}`,
        `# Total keywords: ${keywords.size}`,
        ''
    ];
    for (const d of [
        ...disciplines
    ].sort()){
        lines.push(d.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    }
    lines.push('');
    for (const k of [
        ...keywords
    ].sort()){
        lines.push(k);
    }
    const outPath = external_node_path_join(WIKI_DIR, 'topics.txt');
    await writeFile(outPath, lines.join('\n'));
    console.log(`Generated wiki/topics.txt (${keywords.size} keywords from ${disciplines.size} disciplines)`);
}
run().catch((err)=>{
    console.error('generate-topics failed:', err.message);
    process.exit(1);
});

