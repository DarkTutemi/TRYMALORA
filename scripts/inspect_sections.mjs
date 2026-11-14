import fs from 'fs';

const html = fs.readFileSync('scripts/target_gnome.html', 'utf8');

function extractSection(id) {
  const startTag = `<div id="${id}"`;
  const startIndex = html.indexOf(startTag);
  if (startIndex === -1) {
    console.log(`Section ${id} not found`);
    return '';
  }
  // find shopify-section closing or next section
  const nextSectionIndex = html.indexOf('class="shopify-section', startIndex + startTag.length);
  return html.substring(startIndex, nextSectionIndex !== -1 ? nextSectionIndex : startIndex + 50000);
}

const mainContent = extractSection('shopify-section-template--22832191996094__main');
console.log('=== MAIN SECTION LENGTH ===', mainContent.length);
fs.writeFileSync('scripts/section_main.html', mainContent);

const customLiquid = extractSection('shopify-section-template--22832191996094__custom_liquid_Fe8yyJ');
console.log('=== CUSTOM LIQUID LENGTH ===', customLiquid.length);
fs.writeFileSync('scripts/section_custom_liquid.html', customLiquid);

// Look for text, titles, specs in mainContent
console.log('\n--- MAIN CONTENT HEADINGS ---');
const headings = [...mainContent.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)];
for (const h of headings) {
  console.log(h[0].replace(/<[^>]+>/g, '').trim());
}

// Look for all paragraphs in mainContent
console.log('\n--- MAIN CONTENT PARAGRAPHS ---');
const paragraphs = [...mainContent.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
for (const p of paragraphs.slice(0, 15)) {
  const t = p[0].replace(/<[^>]+>/g, '').trim();
  if (t) console.log('-', t);
}

