#!/usr/bin/env node
const { memoryDir, ensureDir, getPaths, readText } = require('./lib.cjs');

const p = getPaths();

console.log('=== AI Brain: Session Start ===\n');
console.log('Loading memories...\n');

function loadMemories() {
  const memories = {
    preferences: [],
    facts: [],
    patterns: [],
    recentHistory: []
  };

  if (p.semanticPrefs && fs.existsSync(p.semanticPrefs)) {
    const files = fs.readdirSync(p.semanticPrefs).filter(f => f.endsWith('.md'));
    for (const f of files.sort().reverse().slice(0, 5)) {
      memories.preferences.push(readText(path.join(p.semanticPrefs, f)));
    }
  }

  if (p.semanticFacts && fs.existsSync(p.semanticFacts)) {
    const files = fs.readdirSync(p.semanticFacts).filter(f => f.endsWith('.md'));
    for (const f of files.sort().reverse().slice(0, 5)) {
      memories.facts.push(readText(path.join(p.semanticFacts, f)));
    }
  }

  if (p.proceduralPatterns && fs.existsSync(p.proceduralPatterns)) {
    const files = fs.readdirSync(p.proceduralPatterns).filter(f => f.endsWith('.md'));
    for (const f of files.sort().reverse().slice(0, 3)) {
      memories.patterns.push(readText(path.join(p.proceduralPatterns, f)));
    }
  }

  if (p.episodicHistory && fs.existsSync(p.episodicHistory)) {
    const files = fs.readdirSync(p.episodicHistory).filter(f => f.startsWith('history-')).sort().reverse().slice(0, 3);
    for (const f of files) {
      memories.recentHistory.push(readText(path.join(p.episodicHistory, f)));
    }
  }

  return memories;
}

const fs = require('fs');
const path = require('path');

const memories = loadMemories();

if (memories.preferences.length > 0) {
  console.log('📋 Preferences:');
  for (const m of memories.preferences) {
    console.log(`  • ${m.split('\n')[0].replace('**', '')}`);
  }
  console.log('');
}

if (memories.facts.length > 0) {
  console.log('💡 Facts:');
  for (const m of memories.facts.slice(0, 3)) {
    console.log(`  • ${m.split('\n')[0].replace('**', '')}`);
  }
  console.log('');
}

if (memories.patterns.length > 0) {
  console.log('🔄 Patterns:');
  for (const m of memories.patterns) {
    console.log(`  • ${m.split('\n')[0].replace('**', '')}`);
  }
  console.log('');
}

if (memories.recentHistory.length > 0) {
  console.log('📖 Recent Sessions:', memories.recentHistory.length);
  console.log('');
}

console.log('Type "node brain.cjs recall <query>" to search memories');
console.log('Type "node brain.cjs remember <text>" to store new memory');

const fs = require('fs');
