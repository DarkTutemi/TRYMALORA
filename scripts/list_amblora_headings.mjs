import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

// Find all headings
const hMatches = html.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi) || [];
console.log('Headings found:');
hMatches.forEach(h => {
  const clean = h.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  if (clean) console.log('-', clean);
});

