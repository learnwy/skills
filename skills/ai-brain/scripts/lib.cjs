#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

const MEMORY_ROOT = path.join(os.homedir(), '.learnwy', 'ai', 'memory');

const DIRS = {
  semantic: {
    facts: path.join(MEMORY_ROOT, 'semantic', 'facts'),
    preferences: path.join(MEMORY_ROOT, 'semantic', 'preferences'),
  },
  procedural: {
    patterns: path.join(MEMORY_ROOT, 'procedural', 'patterns'),
  },
  episodic: {
    sessions: path.join(MEMORY_ROOT, 'episodic', 'sessions'),
  },
  identity: path.join(MEMORY_ROOT, 'identity'),
  index: path.join(MEMORY_ROOT, 'index'),
};

function ensureDirs() {
  Object.values(DIRS).forEach(v => {
    if (typeof v === 'string') {
      fs.mkdirSync(v, { recursive: true });
    } else {
      Object.values(v).forEach(d => fs.mkdirSync(d, { recursive: true }));
    }
  });
}

function generateId(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex')}`;
}

function timestamp() {
  return new Date().toISOString();
}

function dateStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function loadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function saveJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// --- Memory CRUD ---

function buildMemoryContent(content, category, opts = {}) {
  const now = timestamp();
  const lines = [
    `**Content**: ${content}`,
    `**Category**: ${category}`,
    `**Scope**: ${opts.scope || 'long-term'}`,
    `**Confidence**: ${opts.confidence || 'high'}`,
    `**Source**: ${opts.source || 'explicit'}`,
    `**Created**: ${now}`,
    `**Accessed**: ${now}`,
    `**Frequency**: ${opts.frequency || 1}`,
  ];
  if (opts.tags && opts.tags.length > 0) {
    lines.push(`**Tags**: ${opts.tags.join(', ')}`);
  }
  if (opts.project) {
    lines.push(`**Project**: ${opts.project}`);
  }
  if (opts.session) {
    lines.push(`**Session**: ${opts.session}`);
  }
  return lines.join('\n');
}

function parseMemoryFile(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    const result = { _file: filePath };
    const lines = text.split('\n');
    for (const line of lines) {
      const m = line.match(/^\*\*(\w+)\*\*:\s*(.+)$/);
      if (m) {
        const key = m[1].toLowerCase();
        result[key] = m[2].trim();
      }
    }
    if (result.frequency) result.frequency = parseInt(result.frequency, 10) || 1;
    if (result.tags) result.tags = result.tags.split(',').map(t => t.trim());
    return result;
  } catch {
    return null;
  }
}

function getAllMemories(dir) {
  try {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .map(f => parseMemoryFile(path.join(dir, f)))
      .filter(Boolean);
  } catch {
    return [];
  }
}

function searchMemories(query, categories) {
  const q = query.toLowerCase();
  const tokens = q.split(/\s+/).filter(t => t.length > 2);
  const results = [];

  const dirsToSearch = [];
  if (!categories || categories.includes('fact')) dirsToSearch.push(DIRS.semantic.facts);
  if (!categories || categories.includes('preference')) dirsToSearch.push(DIRS.semantic.preferences);
  if (!categories || categories.includes('pattern')) dirsToSearch.push(DIRS.procedural.patterns);

  for (const dir of dirsToSearch) {
    const memories = getAllMemories(dir);
    for (const mem of memories) {
      if (!mem.content) continue;
      const content = mem.content.toLowerCase();
      let score = 0;

      if (content.includes(q)) {
        score += 10;
      }
      for (const token of tokens) {
        if (content.includes(token)) score += 2;
      }
      if (mem.tags) {
        for (const tag of mem.tags) {
          if (q.includes(tag.toLowerCase())) score += 3;
        }
      }
      if (mem.project && q.includes(mem.project.toLowerCase())) score += 5;

      if (score > 0) {
        results.push({ ...mem, score });
      }
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.frequency || 1) - (a.frequency || 1);
  });

  return results;
}

function findDuplicate(content, dir) {
  const normalized = content.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const memories = getAllMemories(dir);
  for (const mem of memories) {
    if (!mem.content) continue;
    const memNorm = mem.content.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (memNorm === normalized) return mem;
    if (normalized.length > 20 && memNorm.length > 20) {
      const shorter = normalized.length < memNorm.length ? normalized : memNorm;
      const longer = normalized.length >= memNorm.length ? normalized : memNorm;
      if (longer.includes(shorter)) return mem;
    }
  }
  return null;
}

function touchAccess(filePath) {
  try {
    let text = fs.readFileSync(filePath, 'utf-8');
    const now = timestamp();
    text = text.replace(/\*\*Accessed\*\*: .+/, `**Accessed**: ${now}`);
    const freqMatch = text.match(/\*\*Frequency\*\*: (\d+)/);
    if (freqMatch) {
      const newFreq = parseInt(freqMatch[1], 10) + 1;
      text = text.replace(/\*\*Frequency\*\*: \d+/, `**Frequency**: ${newFreq}`);
    }
    fs.writeFileSync(filePath, text, 'utf-8');
  } catch {}
}

// --- Session Management ---

function getActiveSessionFile() {
  return path.join(DIRS.index, 'active-session.json');
}

function getActiveSession() {
  return loadJson(getActiveSessionFile());
}

function saveActiveSession(session) {
  saveJson(getActiveSessionFile(), session);
}

function clearActiveSession() {
  const f = getActiveSessionFile();
  try { fs.unlinkSync(f); } catch {}
}

function createSession(project) {
  ensureDirs();
  const id = `session-${dateStamp()}-${crypto.randomBytes(3).toString('hex')}`;
  const session = {
    id,
    project: project || null,
    started: timestamp(),
    ended: null,
    memories_created: 0,
    memories_recalled: 0,
    summary: null,
  };
  saveActiveSession(session);
  return session;
}

function endSession(summary) {
  const session = getActiveSession();
  if (!session) return null;

  session.ended = timestamp();
  session.summary = summary || null;

  const sessionFile = path.join(DIRS.episodic.sessions, `${session.id}.md`);
  const lines = [
    `# Session: ${session.id}`,
    '',
    `**Started**: ${session.started}`,
    `**Ended**: ${session.ended}`,
    `**Project**: ${session.project || 'general'}`,
    `**Memories Created**: ${session.memories_created}`,
    `**Memories Recalled**: ${session.memories_recalled}`,
    '',
    '## Summary',
    summary || 'No summary provided.',
    '',
  ];
  fs.writeFileSync(sessionFile, lines.join('\n'), 'utf-8');

  clearActiveSession();
  return session;
}

function getRecentSessions(limit) {
  const n = limit || 5;
  try {
    const files = fs.readdirSync(DIRS.episodic.sessions)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse()
      .slice(0, n);

    return files.map(f => {
      const text = fs.readFileSync(path.join(DIRS.episodic.sessions, f), 'utf-8');
      const result = { file: f };
      const lines = text.split('\n');
      for (const line of lines) {
        const m = line.match(/^\*\*(\w[\w\s]*)\*\*:\s*(.+)$/);
        if (m) result[m[1].toLowerCase()] = m[2].trim();
      }
      const summaryIdx = lines.findIndex(l => l.startsWith('## Summary'));
      if (summaryIdx >= 0) {
        result.summary = lines.slice(summaryIdx + 1).join('\n').trim();
      }
      return result;
    });
  } catch {
    return [];
  }
}

// --- Identity ---

function getIdentityFile(name) {
  return path.join(DIRS.identity, `${name}.md`);
}

function loadIdentity(name) {
  const f = getIdentityFile(name);
  try {
    return fs.readFileSync(f, 'utf-8');
  } catch {
    return null;
  }
}

function saveIdentity(name, content) {
  ensureDirs();
  fs.writeFileSync(getIdentityFile(name), content, 'utf-8');
}

// --- Stats ---

function getStats() {
  const count = (dir) => {
    try { return fs.readdirSync(dir).filter(f => f.endsWith('.md')).length; } catch { return 0; }
  };

  return {
    facts: count(DIRS.semantic.facts),
    preferences: count(DIRS.semantic.preferences),
    patterns: count(DIRS.procedural.patterns),
    sessions: count(DIRS.episodic.sessions),
    has_identity: fs.existsSync(getIdentityFile('AI')) || fs.existsSync(getIdentityFile('user')),
    active_session: !!getActiveSession(),
  };
}

module.exports = {
  MEMORY_ROOT,
  DIRS,
  ensureDirs,
  generateId,
  timestamp,
  dateStamp,
  loadJson,
  saveJson,
  buildMemoryContent,
  parseMemoryFile,
  getAllMemories,
  searchMemories,
  findDuplicate,
  touchAccess,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  createSession,
  endSession,
  getRecentSessions,
  getIdentityFile,
  loadIdentity,
  saveIdentity,
  getStats,
};
