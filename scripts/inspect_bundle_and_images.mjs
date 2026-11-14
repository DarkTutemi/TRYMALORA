import fs from 'fs';

const html = fs.readFileSync('scripts/extracted_product_body.html', 'utf8');

// 1. Inspect images in the body
const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)];
console.log('Images in body:', imgMatches.length);
const uniqueImgs = [...new Set(imgMatches.map(m => m[1]))];
for (const u of uniqueImgs) {
  console.log('IMG:', u);
}

// 2. Inspect bundle & save
const bundleMatches = [...html.matchAll(/BUNDLE & SAVE[\s\S]*?(?=<\/form>|<div class="product__info-container")/gi)];
console.log('\n--- BUNDLE SECTION ---');
const bundleIdx = html.indexOf('BUNDLE & SAVE');
if (bundleIdx !== -1) {
  console.log(html.substring(bundleIdx - 50, bundleIdx + 3000));
}

// 3. Inspect custom sections / blocks
const sectionBlocks = [...html.matchAll(/class=["']([^"']*(?:section|block|feature|grid|banner|story)[^"']*)["']/gi)];
console.log('\nUnique classes matching story/block/feature:', [...new Set(sectionBlocks.map(m => m[1]))].slice(0, 20));

