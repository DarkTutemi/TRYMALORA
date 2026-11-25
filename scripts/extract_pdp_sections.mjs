import fs from 'fs';

const html = fs.readFileSync('scripts/8sheep_pdp_sleepylotion.html', 'utf8');

const sectionStarts = [...html.matchAll(/id="shopify-section-([^"]+)"/g)];
console.log('Total PDP section markers found:', sectionStarts.length);

fs.mkdirSync('scripts/8sheep_extracted_pdp', { recursive: true });

for (let i = 0; i < sectionStarts.length; i++) {
  const current = sectionStarts[i];
  const sectionId = current[1];
  const startIndex = html.lastIndexOf('<', current.index);
  
  let endIndex;
  if (i < sectionStarts.length - 1) {
    const next = sectionStarts[i + 1];
    endIndex = html.lastIndexOf('<', next.index);
  } else {
    endIndex = html.indexOf('</body>', startIndex);
    if (endIndex === -1) endIndex = html.length;
  }

  const sectionHtml = html.slice(startIndex, endIndex);
  const safeName = sectionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  fs.writeFileSync(`scripts/8sheep_extracted_pdp/${safeName}.html`, sectionHtml);
  console.log(`[${i + 1}] Extracted ${safeName} (${sectionHtml.length} chars)`);
}
