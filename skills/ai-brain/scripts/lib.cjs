#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

function memoryDir() {
  return path.join(os.homedir(), '.learnwy', 'ai', 'memory');
}

function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function readText(filePath) {
  if (!fs.existsSync(filePath)) return '';
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf8');
}

function getPaths(memPath) {
  const mem = path.resolve(memPath || memoryDir());
  return {
    mem,
    session: path.join(mem, 'session'),
    episodic: path.join(mem, 'episodic'),
    episodicHistory: path.join(mem, 'episodic', 'history'),
    semantic: path.join(mem, 'semantic'),
    semanticFacts: path.join(mem, 'semantic', 'facts'),
    semanticPrefs: path.join(mem, 'semantic', 'preferences'),
    procedural: path.join(mem, 'procedural'),
    proceduralPatterns: path.join(mem, 'procedural', 'patterns'),
    proceduralWorkflows: path.join(mem, 'procedural', 'workflows'),
  };
}

function autoCategorize(text) {
  const lower = text.toLowerCase();

  if (lower.includes('prefer') || lower.includes('like') || lower.includes('dislike') ||
      lower.includes('want') || lower.includes('不喜欢') || lower.includes('喜欢') ||
      lower.includes('want')) {
    return 'preference';
  }

  if (lower.includes('always') || lower.includes('when') || lower.includes('if') ||
      lower.includes('check') || lower.includes('first')) {
    return 'pattern';
  }

  if (lower.includes('uses') || lower.includes('is ') || lower.includes('are ') ||
      lower.includes('uses') || lower.includes('has ') || lower.includes('have')) {
    return 'fact';
  }

  return 'fact';
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function nextHistoryFilename(historyDir) {
  const d = todayStr();
  let maxN = 0;

  if (fs.existsSync(historyDir)) {
    const files = fs.readdirSync(historyDir).filter(f => f.startsWith(`history-${d}`));
    for (const f of files) {
      const m = f.match(/^history-\d{4}-\d{2}-\d{2}-(\d+)\.md$/);
      if (m) maxN = Math.max(maxN, parseInt(m[1]));
    }
  }

  return `history-${d}-${maxN + 1}.md`;
}

module.exports = {
  memoryDir,
  ensureDir,
  readText,
  writeText,
  getPaths,
  autoCategorize,
  todayStr,
  nextHistoryFilename,
};
