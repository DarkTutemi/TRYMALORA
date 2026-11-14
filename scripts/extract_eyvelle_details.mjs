import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');

// Extract all images and gifs
const imgMatches = [...html.matchAll(/(https:\/\/cdn\.shopify\.com\/s\/files\/[^"'\s\)]+)/g)].map(m => m[1]);
const uniqueImages = [...new Set(imgMatches.map(u => u.split('?')[0]))];
console.log('Unique Shopify CDN Assets found:', uniqueImages.length);
uniqueImages.forEach((img, i) => {
  if (img.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
    console.log(`[Asset #${i+1}] ${img}`);
  }
});

// Check for Kaching bundle configs
const kachingMatches = [...html.matchAll(/window\.kaching[A-Za-z0-9_]*\s*=\s*(\{[\s\S]*?\});/g)];
console.log('\nKaching matches count:', kachingMatches.length);
if (kachingMatches.length > 0) {
  console.log('Kaching config snippet:', kachingMatches[0][1].slice(0, 500));
}

// Check for Loox data
const looxId = html.match(/data-product-id="([^"]+)"/);
console.log('Product ID attribute:', looxId ? looxId[1] : 'none');

// Look for FAQs
const faqQuestions = [...html.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('\nFAQs (summary tags):', faqQuestions);

// Search for any accordions or details
const detailsBlocks = [...html.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi)].map(m => m[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
console.log('\nDetails blocks count:', detailsBlocks.length);
detailsBlocks.forEach((d, i) => console.log(`[Details #${i+1}]`, d.slice(0, 200)));

