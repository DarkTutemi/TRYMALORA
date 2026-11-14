import fs from 'fs';
import path from 'path';
import readline from 'readline';

const CONV_ID = 'd284d670-0cfd-4f12-bbed-f8eeaea36551';
const BRAIN_DIR = path.join('C:', 'Users', 'Admin', '.gemini', 'antigravity', 'brain', CONV_ID);
const LOGS_DIR = path.join(BRAIN_DIR, '.system_generated', 'logs');
const DEST_DIR = path.join(process.cwd(), 'docs', 'backups', 'chat_session');

if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

function sanitizeText(text) {
  return text
    .replace(/atkn_[a-zA-Z0-9_-]+/g, 'atkn_[REDACTED_SHOPIFY_MERCHANT_TOKEN]')
    .replace(/shp(at|ca|ss|va|pa|in)_[a-zA-Z0-9_-]+/g, 'shp_[REDACTED_SHOPIFY_SECRET]')
    .replace(/Cv[A-Za-z0-9_-]{50,}/g, 'Cv_[REDACTED_SHOPIFY_CLI_SESSION]');
}

async function copyAndSanitizeFile(src, dest) {
  const readStream = fs.createReadStream(src);
  const writeStream = fs.createWriteStream(dest);
  const rl = readline.createInterface({ input: readStream, crlfDelay: Infinity });

  for await (const line of rl) {
    const sanitized = sanitizeText(line);
    writeStream.write(sanitized + '\n');
  }
  writeStream.end();
  await new Promise(r => writeStream.on('finish', r));
}

console.log('1. Copying and comprehensively sanitizing raw transcripts for GitHub push protection...');
const transcriptFullSrc = path.join(LOGS_DIR, 'transcript_full.jsonl');
const transcriptSrc = path.join(LOGS_DIR, 'transcript.jsonl');

if (fs.existsSync(transcriptFullSrc)) {
  await copyAndSanitizeFile(transcriptFullSrc, path.join(DEST_DIR, 'transcript_full.jsonl'));
  console.log(`[OK] Sanitized & copied transcript_full.jsonl (${(fs.statSync(path.join(DEST_DIR, 'transcript_full.jsonl')).size / (1024 * 1024)).toFixed(2)} MB)`);
}

if (fs.existsSync(transcriptSrc)) {
  await copyAndSanitizeFile(transcriptSrc, path.join(DEST_DIR, 'transcript.jsonl'));
  console.log(`[OK] Sanitized & copied transcript.jsonl (${(fs.statSync(path.join(DEST_DIR, 'transcript.jsonl')).size / (1024 * 1024)).toFixed(2)} MB)`);
}

console.log('2. Copying markdown report artifacts...');
const reportFiles = [
  'steam_eye_therapy_clone_report.md',
  'ear_cleaner_task_report.md',
  'ear_cleaner_clone_report.md',
  'execution_plan_steam_eye_therapy.md',
  'execution_plan_ear_cleaner.md'
];

reportFiles.forEach(rf => {
  const src = path.join(BRAIN_DIR, rf);
  if (fs.existsSync(src)) {
    const rawContent = fs.readFileSync(src, 'utf8');
    fs.writeFileSync(path.join(DEST_DIR, rf), sanitizeText(rawContent), 'utf8');
    console.log(`[OK] Copied artifact ${rf}`);
  }
});

console.log('3. Parsing full transcript to build human-readable CHAT_HISTORY.md ...');

async function buildMarkdownChat() {
  const fileStream = fs.createReadStream(path.join(DEST_DIR, 'transcript_full.jsonl'));
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  const turns = [];
  let currentTurn = null;

  for await (const line of rl) {
    if (!line.trim()) continue;
    let item;
    try {
      item = JSON.parse(line);
    } catch {
      continue;
    }

    if (item.type === 'USER_INPUT' || item.source === 'USER_EXPLICIT') {
      const raw = item.content || '';
      let text = raw;
      const match = raw.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
      if (match) {
        text = match[1].trim();
      } else {
        text = raw.replace(/<[^>]+>/g, '').trim();
      }

      currentTurn = {
        role: 'user',
        step: item.step_index,
        time: item.created_at,
        text: sanitizeText(text),
        responses: []
      };
      turns.push(currentTurn);
    } else if (item.source === 'MODEL' && item.content && item.content.trim().length > 0) {
      const content = item.content.trim();
      const isToolOutput = (
        content.startsWith('Created At:') ||
        content.startsWith('Completed At:') ||
        content.startsWith('Command exited') ||
        content.startsWith('Task:') ||
        content.startsWith('Showing lines') ||
        content.startsWith('Made 1 replacement') ||
        content.startsWith('Created file') ||
        content.startsWith('Tool is running as a background task') ||
        content.startsWith('The tool\'s output was truncated') ||
        content.startsWith('warning: in the working copy')
      );

      if (!isToolOutput && currentTurn) {
        currentTurn.responses.push({
          step: item.step_index,
          time: item.created_at,
          text: sanitizeText(content)
        });
      }
    }
  }

  let md = `# Antigravity Chat Session Backup\n\n`;
  md += `- **Conversation ID:** \`${CONV_ID}\`\n`;
  md += `- **Export Date:** ${new Date().toISOString()}\n`;
  md += `- **Total User Turns:** ${turns.length}\n`;
  md += `- **Raw Files:** [transcript_full.jsonl](./transcript_full.jsonl) | [transcript.jsonl](./transcript.jsonl)\n\n`;
  md += `---\n\n`;

  turns.forEach((turn, idx) => {
    md += `## Turn #${idx + 1} — User Request\n`;
    md += `*Timestamp: ${turn.time || 'N/A'} (Step ${turn.step})*\n\n`;
    md += `\`\`\`text\n${turn.text}\n\`\`\`\n\n`;

    if (turn.responses.length > 0) {
      md += `### Assistant Responses\n\n`;
      turn.responses.forEach((resp, rIdx) => {
        if (turn.responses.length > 1) {
          md += `#### Response Part ${rIdx + 1} *(${resp.time})*\n\n`;
        }
        md += `${resp.text}\n\n`;
      });
    } else {
      md += `*(Turn executed backend tools without direct user response)*\n\n`;
    }
    md += `---\n\n`;
  });

  const chatMdPath = path.join(DEST_DIR, 'CHAT_HISTORY.md');
  fs.writeFileSync(chatMdPath, md, 'utf8');
  console.log(`[OK] Generated CHAT_HISTORY.md (${(fs.statSync(chatMdPath).size / 1024).toFixed(2)} KB, ${turns.length} user turns)`);
}

await buildMarkdownChat();
console.log('Session chat backup completed successfully!');
