import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

// Look for judge.me, loox, yotpo, trustoo, or review snippets
['judge', 'loox', 'yotpo', 'trustoo', 'vstar', 'stamped', 'junip', 'okendo', 'review'].forEach(k => {
  const idx = html.toLowerCase().indexOf(k);
  if (idx !== -1) {
    console.log(`Found review keyword "${k}" at ${idx}:`, html.slice(idx, idx + 150));
  }
});

