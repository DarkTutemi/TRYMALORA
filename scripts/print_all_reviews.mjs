import fs from 'fs';

const reviews = JSON.parse(fs.readFileSync('scripts/extracted_reviews.json', 'utf8'));

console.log(`Total reviews extracted: ${reviews.length}`);
reviews.forEach((r, idx) => {
  console.log(`\n[${idx + 1}] ${r.author.trim()} - ${r.star}★ (${r.commented_at?.split(' ')[0]})`);
  console.log(`Text: "${r.content}"`);
  console.log(`Image: ${r.resources?.[0]?.src || 'none'}`);
});

