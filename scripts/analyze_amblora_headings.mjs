import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf-8');

// Match all h2 and h3
const headings = [];
const regex = /<(h[23])[^>]*>([\s\S]*?)<\/\1>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  const text = match[2].replace(/<[^>]+>/g, '').trim();
  if (text && text.length < 120 && !headings.includes(text)) {
    headings.push(text);
  }
}

console.log('Amblora Headings found:\n', headings.join('\n- '));

