#!/usr/bin/env node
// Claude Code hook (Stop + SessionEnd): renders the current session transcript
// to docs/ai/sessions/<date>-<session>.md so the AI collaboration is committed
// with the code. Keeps prompts, replies and a one-line trace of each tool call;
// drops tool output, thinking and injected system context. Rewrites the same
// file on every turn, so it is always current and never duplicated.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const { transcript_path: transcriptPath, session_id: sessionId = 'unknown' } = input;
if (!transcriptPath || !existsSync(transcriptPath)) process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const outDir = join(projectDir, 'docs', 'ai', 'sessions');

const entries = readFileSync(transcriptPath, 'utf8')
  .split('\n')
  .filter(Boolean)
  .flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  })
  .filter((e) => (e.type === 'user' || e.type === 'assistant') && !e.isSidechain && !e.isMeta);

const SECRET_PATTERNS = [
  /\b(sk-[A-Za-z0-9_-]{16,})/g,
  /\b(gh[pousr]_[A-Za-z0-9]{20,})/g,
  /\b(github_pat_[A-Za-z0-9_]{20,})/g,
  /\b([A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY|PRIVATE_KEY)[A-Z0-9_]*\s*[=:]\s*)("[^"]*"|'[^']*'|\S+)/g,
  /\b(postgres(?:ql)?:\/\/)[^\s'"]+/g,
];

function redact(text) {
  return SECRET_PATTERNS.reduce(
    (acc, re) => acc.replace(re, (_m, prefix) => (prefix && /[=:]\s*$|:\/\/$/.test(prefix) ? `${prefix}[REDACTED]` : '[REDACTED]')),
    text,
  );
}

function cleanUserText(text) {
  const command = text.match(/<command-name>([\s\S]*?)<\/command-name>/);
  if (command) {
    const args = text.match(/<command-args>([\s\S]*?)<\/command-args>/);
    return `${command[1].trim()} ${args ? args[1].trim() : ''}`.trim();
  }
  return text
    .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, '')
    .replace(/<local-command-(?:stdout|stderr)>[\s\S]*?<\/local-command-(?:stdout|stderr)>/g, '')
    .replace(/<\/?pasted_content[^>]*>/g, '')
    .trim();
}

// Replies use their own headings; push them below the speaker headings.
function demoteHeadings(text) {
  let inFence = false;
  return text
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      return !inFence && /^#{1,4} /.test(line) ? `##${line}` : line;
    })
    .join('\n');
}

function relativeToProject(path) {
  const normalize = (p) => p.replace(/\\/g, '/');
  const root = `${normalize(projectDir).replace(/\/$/, '')}/`;
  const p = normalize(path);
  return p.toLowerCase().startsWith(root.toLowerCase()) ? p.slice(root.length) : p;
}

function describeToolUse({ name, input = {} }) {
  const detail =
    input.description ||
    (input.file_path && relativeToProject(input.file_path)) ||
    input.pattern ||
    input.skill ||
    input.url ||
    input.query ||
    input.prompt?.slice(0, 120) ||
    '';
  return `> 🔧 **${name}**${detail ? ` — ${String(detail).replace(/\s+/g, ' ')}` : ''}`;
}

const blocks = [];
let lastRole = null;

for (const entry of entries) {
  const { content } = entry.message ?? {};
  if (entry.isCompactSummary) {
    blocks.push('---\n\n*(context compacted here)*');
    lastRole = null;
    continue;
  }

  if (entry.type === 'user') {
    const texts =
      typeof content === 'string'
        ? [content]
        : (content ?? []).filter((b) => b.type === 'text').map((b) => b.text);
    const text = cleanUserText(texts.join('\n\n'));
    if (!text) continue; // tool results only
    blocks.push(`## 🧑 Daniel\n\n${text}`);
    lastRole = 'user';
    continue;
  }

  for (const block of content ?? []) {
    if (block.type !== 'text' && block.type !== 'tool_use') continue;
    if (lastRole !== 'assistant') {
      blocks.push('## 🤖 Claude');
      lastRole = 'assistant';
    }
    if (block.type === 'text' && block.text.trim()) blocks.push(demoteHeadings(block.text.trim()));
    if (block.type === 'tool_use') blocks.push(describeToolUse(block));
  }
}

if (!blocks.some((b) => b.startsWith('## 🧑'))) process.exit(0);

const firstTimestamp = entries[0]?.timestamp ?? new Date().toISOString();
const stamp = firstTimestamp.slice(0, 16).replace('T', '-').replace(':', '');
const file = join(outDir, `${stamp}-${sessionId.slice(0, 8)}.md`);

const header = [
  `# AI session ${stamp}`,
  '',
  `Session \`${sessionId}\`, started ${firstTimestamp}. Rendered automatically by \`.claude/hooks/save-session.mjs\`:`,
  'prompts and replies verbatim; tool calls as one line each; tool output, model thinking and injected system context omitted.',
].join('\n');

mkdirSync(outDir, { recursive: true });
writeFileSync(file, `${redact([header, ...blocks].join('\n\n'))}\n`);
