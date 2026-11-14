import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

// Find all occurrences of "dealBars"
let idx = 0;
while ((idx = html.indexOf('dealBars', idx)) !== -1) {
  console.log(`Found dealBars at ${idx}:`, html.slice(idx, idx + 600));
  idx += 8;
}

