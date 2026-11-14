import fs from 'fs';

const html = fs.readFileSync('scripts/target_gnome.html', 'utf8');

// Look for description / product-description / rich text / sections
console.log('--- SEARCHING FOR SECTIONS & DESCRIPTION ---');

// Check sections
const sectionMatches = [...html.matchAll(/id=["'](shopify-section-[^"']+)["']/g)];
console.log('Sections found:', sectionMatches.map(m => m[1]));

// Look for form or variant selector
const formMatches = [...html.matchAll(/<form[^>]*action=["'][^"']*cart\/add[^"']*["'][^>]*>([\s\S]*?)<\/form>/gi)];
console.log('\nCart Add Forms found:', formMatches.length);
if (formMatches.length > 0) {
  console.log('Form 1 snippet:', formMatches[0][1].substring(0, 1000));
}

// Look for main product container or description
const descRegexes = [
  /<div[^>]*class=["'][^"']*(?:product__description|description|rte|product-details|product-info)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi,
  /<div[^>]*id=["'][^"']*(?:description|product-description)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi
];

for (const rg of descRegexes) {
  let m;
  while ((m = rg.exec(html)) !== null) {
    console.log('\n--- DESCRIPTION CANDIDATE ---');
    console.log(m[1].substring(0, 600));
  }
}

// Check for review widgets, ratings, stars, or reviews container
console.log('\n--- SEARCHING FOR REVIEWS ---');
const reviewKeywords = ['review', 'testimonial', 'rating', 'star', 'customer-reviews', 'judge', 'loox', 'yotpo', 'opinew', 'air-reviews', 'automizely'];
for (const kw of reviewKeywords) {
  const matches = [...html.matchAll(new RegExp(`class=["'][^"']*${kw}[^"']*["']`, 'gi'))];
  if (matches.length > 0) {
    console.log(`Found class with keyword "${kw}": ${matches.length} occurrences`);
  }
}

