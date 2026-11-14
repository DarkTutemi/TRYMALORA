import fs from 'fs';

const raw = fs.readFileSync('scripts/eyvelle_embedded_reviews_raw.txt', 'utf8');

// The script contains JSON escaped inside string
// Let's find JSON string
const jsonMatch = raw.match(/"(\[\\{[\s\S]*?\\}\])"/);
if (jsonMatch) {
  try {
    const unescaped = JSON.parse(jsonMatch[0]);
    const reviews = JSON.parse(unescaped);
    console.log('Parsed reviews count:', reviews.length);
    fs.writeFileSync('scripts/eyvelle_parsed_reviews.json', JSON.stringify(reviews, null, 2), 'utf8');
    reviews.slice(0, 5).forEach((r, i) => {
      console.log(`[Review #${i+1}] ${r.author || r.name} (${r.rating || r.rate}★):`, (r.content || r.body || r.review || '').slice(0, 100));
    });
  } catch(e) {
    console.log('Parse error:', e.message);
  }
} else {
  // Let's search for review objects directly
  console.log('No direct array match, printing snippet:');
  console.log(raw.slice(0, 1000));
}

