import fs from 'fs';

const html = fs.readFileSync('scripts/eyvelle_steam_therapy.html', 'utf8');

// Title
const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
console.log('Title:', titleMatch ? titleMatch[1].trim() : '');

// Headings
const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('H1s:', h1s);

const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
console.log('H2s:', h2s);

const h3s = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
console.log('H3s (first 15):', h3s.slice(0, 15));

// Check Shopify sections on page
const sections = [...html.matchAll(/id="shopify-section-([^"]+)"/gi)].map(m => m[1]);
console.log('Sections:', [...new Set(sections)]);

// Look for price or offers
const priceMatches = [...html.matchAll(/\$\d+(\.\d{2})?/g)].map(m => m[0]);
console.log('Prices found on page:', [...new Set(priceMatches)].slice(0, 15));

// Search for reviews or testimonials
const hasJudgeMe = html.includes('jdgm') || html.includes('judgeme');
const hasLoox = html.includes('loox');
const hasKaching = html.includes('kaching');
const hasYotpo = html.includes('yotpo');
const hasTrustoo = html.includes('trustoo');
console.log('Review/Bundle Apps:', { hasJudgeMe, hasLoox, hasKaching, hasYotpo, hasTrustoo });

// Find product description text in json
const pJson = JSON.parse(fs.readFileSync('scripts/eyvelle_steam_therapy.json', 'utf8')).product;
console.log('\n--- Product Description HTML excerpt ---');
console.log(pJson.body_html.slice(0, 600));
