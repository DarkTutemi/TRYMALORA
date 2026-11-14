import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

const regex = /<div[^>]*class=["'][^"']*review[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
let m;
let count = 0;
while ((m = regex.exec(html)) !== null && count < 10) {
  console.log('Review div:', m[0].slice(0, 200));
  count++;
}

// Check for testimonials or ratings on the page
['★', '⭐', 'stars', 'rating', 'testimonial'].forEach(w => {
  const i = html.toLowerCase().indexOf(w);
  if (i !== -1) {
    console.log(`Word "${w}" at ${i}:`, html.slice(i - 50, i + 150));
  }
});

