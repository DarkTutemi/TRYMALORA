import fs from 'fs';

const allReviews = JSON.parse(fs.readFileSync('scripts/all_125_reviews.json', 'utf8'));

const photoReviews = allReviews.filter(r => r.resources && r.resources.length > 0);
console.log(`Total photo reviews: ${photoReviews.length}`);

photoReviews.forEach((r, idx) => {
  console.log(`[${idx+1}] ${r.author.trim()} (${r.star}★): "${r.content.slice(0, 60)}..."`);
  console.log(`    Img: ${r.resources[0].src}`);
});

