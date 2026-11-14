import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

// Search for bundle keywords, upsell, finger wipes, etc.
const keywords = ['finger', 'wipes', 'bundle', 'subscription', 'selling_plan', 'discount', '34.99', 'Buy', 'FREE', 'free'];
keywords.forEach(k => {
  let count = 0;
  let pos = 0;
  while ((pos = html.indexOf(k, pos)) !== -1) {
    count++;
    pos += k.length;
  }
  console.log(`Keyword "${k}": ${count} occurrences`);
});

// Let's find sections around "finger" or "wipes"
const fIdx = html.toLowerCase().indexOf('finger');
if (fIdx !== -1) {
  console.log('\nAround "finger":', html.slice(Math.max(0, fIdx - 200), fIdx + 300));
}

// Let's find bundle sections or buy buttons
const bIdx = html.indexOf('bundle');
if (bIdx !== -1) {
  console.log('\nAround "bundle":', html.slice(Math.max(0, bIdx - 200), bIdx + 300));
}

