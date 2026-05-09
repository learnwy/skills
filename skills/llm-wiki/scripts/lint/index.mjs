#!/usr/bin/env node
import { readFile as promises_readFile, readdir } from "node:fs/promises";
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





;// CONCATENATED MODULE: ./src/llm-wiki/lint/index.ts



const DEEP_SCAN_TYPES = new Set([
    'concepts'
]);
async function buildInventory() {
    const inventory = new Set();
    const allFiles = {};
    for (const dir of PAGE_DIRS){
        const dirPath = external_node_path_join(WIKI_DIR, dir);
        allFiles[dir] = [];
        if (DEEP_SCAN_TYPES.has(dir)) {
            const entries = await readMdFilesDeep(dirPath);
            for (const { file, subdir } of entries){
                const relPath = subdir ? `${subdir}/${file}` : file;
                allFiles[dir].push({
                    file,
                    relPath,
                    subdir
                });
                const slug = file.replace('.md', '');
                inventory.add(`${dir}/${slug}`);
                inventory.add(`${dir}/${file}`);
                if (subdir) {
                    inventory.add(`${dir}/${subdir}/${slug}`);
                    inventory.add(`${dir}/${subdir}/${file}`);
                }
            }
        } else {
            const files = await readMdFiles(dirPath);
            for (const file of files){
                allFiles[dir].push({
                    file,
                    relPath: file,
                    subdir: ''
                });
                inventory.add(`${dir}/${file.replace('.md', '')}`);
                inventory.add(`${dir}/${file}`);
            }
        }
    }
    inventory.add('index.md');
    inventory.add('overview.md');
    return {
        inventory,
        allFiles
    };
}
function checkWikilinks(content, inventory) {
    const broken = [];
    const resolved = [];
    for (const match of content.matchAll(/\[\[([^\]]+)\]\]/g)){
        const link = match[1].replace(/\.md$/, '');
        const normalized = link.replace(/^raw\//, '').replace(/^wiki\//, '');
        const isWikiLink = PAGE_DIRS.some((d)=>normalized.startsWith(`${d}/`));
        if (!isWikiLink) continue;
        const withMd = normalized.endsWith('.md') ? normalized : `${normalized}.md`;
        const withoutMd = normalized.replace(/\.md$/, '');
        if (!inventory.has(withMd) && !inventory.has(withoutMd)) {
            broken.push(match[1]);
        } else {
            resolved.push(withoutMd);
        }
    }
    return {
        broken,
        resolved
    };
}
function checkMetaTags(dir, content) {
    const missing = [];
    if (dir === 'snippets') {
        if (!content.includes('**Language**:')) missing.push('**Language**: tag');
        if (!content.includes('**Platform**:')) missing.push('**Platform**: tag');
    }
    if (dir === 'troubleshooting') {
        if (!content.includes('**Platform**:')) missing.push('**Platform**: tag');
        if (!content.includes('**Severity**:')) missing.push('**Severity**: tag');
    }
    return missing;
}
async function run() {
    console.log('Linting wiki...\n');
    const { inventory, allFiles } = await buildInventory();
    const errors = [];
    const warnings = [];
    const incomingLinks = {};
    let totalLinks = 0;
    let totalPages = 0;
    for (const dir of PAGE_DIRS){
        for (const { file, relPath, subdir } of allFiles[dir] || []){
            const filePath = subdir ? external_node_path_join(WIKI_DIR, dir, subdir, file) : external_node_path_join(WIKI_DIR, dir, file);
            const content = await promises_readFile(filePath, 'utf-8');
            const loc = `${dir}/${relPath}`;
            totalPages++;
            if (!content.split('\n')[0]?.startsWith('# ')) {
                warnings.push(`${loc}: Missing # title on line 1`);
            }
            const { broken, resolved } = checkWikilinks(content, inventory);
            totalLinks += broken.length + resolved.length;
            for (const link of broken){
                errors.push(`${loc}: Broken link -> [[${link}]]`);
            }
            for (const target of resolved){
                incomingLinks[target] = (incomingLinks[target] || 0) + 1;
            }
            const missingTags = checkMetaTags(dir, content);
            for (const tag of missingTags){
                warnings.push(`${loc}: Missing ${tag}`);
            }
        }
    }
    for (const dir of PAGE_DIRS){
        if (dir === 'entities' || dir === 'comparisons') continue;
        for (const { file, subdir } of allFiles[dir] || []){
            const slug = file.replace('.md', '');
            const flatKey = `${dir}/${slug}`;
            const nestedKey = subdir ? `${dir}/${subdir}/${slug}` : flatKey;
            if (!incomingLinks[flatKey] && !incomingLinks[nestedKey]) {
                const loc = subdir ? `${dir}/${subdir}/${file}` : `${dir}/${file}`;
                warnings.push(`${loc}: Orphan page (no incoming wikilinks)`);
            }
        }
    }
    console.log('Statistics:');
    for (const dir of PAGE_DIRS){
        const count = (allFiles[dir] || []).length;
        if (count > 0) console.log(`   ${dir}: ${count}`);
    }
    console.log(`   Total pages: ${totalPages}`);
    console.log(`   Total wikilinks: ${totalLinks}`);
    console.log(`   Broken links: ${errors.length}`);
    console.log('');
    if (errors.length > 0) {
        console.log(`Errors (${errors.length}):`);
        for (const e of errors.slice(0, 50))console.log(`   ${e}`);
        if (errors.length > 50) console.log(`   ... and ${errors.length - 50} more`);
        console.log('');
    }
    if (warnings.length > 0) {
        console.log(`Warnings (${warnings.length}):`);
        for (const w of warnings.slice(0, 30))console.log(`   ${w}`);
        if (warnings.length > 30) console.log(`   ... and ${warnings.length - 30} more`);
        console.log('');
    }
    if (errors.length === 0 && warnings.length === 0) {
        console.log('No issues found!');
    }
    process.exit(errors.length > 0 ? 1 : 0);
}
run().catch((err)=>{
    console.error('lint failed:', err.message);
    process.exit(1);
});

