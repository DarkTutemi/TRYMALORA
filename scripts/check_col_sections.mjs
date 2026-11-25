import fs from 'fs';

const html = fs.readFileSync('scripts/8sheep_collection.html', 'utf8');
const sectionMatches = [...html.matchAll(/id="shopify-section-([^"]+)"/g)].map(m => m[1]);
console.log('Collection section IDs:', sectionMatches);
