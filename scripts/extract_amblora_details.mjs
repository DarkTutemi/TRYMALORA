import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

// Find all JSON blocks in script tags
const jsonMatches = html.match(/<script[^>]*type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('JSON script tags count:', jsonMatches.length);

// Search for the app block configuration (looks like Kaching bundle or Selleasy or similar)
const fIdx = html.indexOf('"title":"Add 50 Finger Wipes"');
if (fIdx !== -1) {
  const start = html.lastIndexOf('{', fIdx);
  console.log('Upsell config block:', html.slice(fIdx - 100, fIdx + 800));
}

// Let's also search for bundle tiers in HTML
const buyIdx = html.indexOf('Buy 1');
if (buyIdx !== -1) {
  console.log('\nAround "Buy 1":', html.slice(buyIdx - 100, buyIdx + 400));
}

// Let's search for "selling_plan"
const spIdx = html.indexOf('selling_plan');
if (spIdx !== -1) {
  console.log('\nAround selling_plan:', html.slice(spIdx - 100, spIdx + 500));
}

