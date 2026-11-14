import fs from 'fs';

const html = fs.readFileSync('scripts/target_gnome.html', 'utf8');

function extractBetween(startPattern, endPattern) {
  const startIdx = typeof startPattern === 'string' ? html.indexOf(startPattern) : html.search(startPattern);
  if (startIdx === -1) return '';
  const sub = html.substring(startIdx);
  const endIdx = typeof endPattern === 'string' ? sub.indexOf(endPattern) : sub.search(endPattern);
  if (endIdx === -1) return sub;
  return sub.substring(0, endIdx);
}

const mainSec = extractBetween('shopify-section-template--22832191996094__main', 'shopify-section-sections--22063868772542__footer');
fs.writeFileSync('scripts/extracted_product_body.html', mainSec);
console.log('Extracted length:', mainSec.length);

// Let's inspect headings, text, buttons, images in this section
const headings = [...mainSec.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)];
console.log('\n--- HEADINGS ---');
for (const h of headings) {
  console.log(h[0].replace(/<[^>]+>/g, '').trim());
}

// Collapsible tabs / accordions
const accordions = [...mainSec.matchAll(/<details[^>]*>([\s\S]*?)<\/details>/gi)];
console.log('\n--- ACCORDIONS / DETAILS (' + accordions.length + ') ---');
for (const acc of accordions) {
  const summary = acc[1].match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
  console.log('Summary:', summary ? summary[1].replace(/<[^>]+>/g, '').trim() : 'No summary');
}

// Rich text paragraphs
console.log('\n--- PARAGRAPHS ---');
const paras = [...mainSec.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
for (const p of paras) {
  const t = p[1].replace(/<[^>]+>/g, '').trim();
  if (t && t.length > 10) {
    console.log('-', t.substring(0, 150));
  }
}

