import fs from 'fs';

const html = fs.readFileSync('scripts/amblora_ear_cleaner.html', 'utf8');

const kachingMatch = html.match(/<script class="kaching-bundles-product"[^>]*>([\s\S]*?)<\/script>/i);
if (kachingMatch) {
  const json = JSON.parse(kachingMatch[1]);
  fs.writeFileSync('scripts/amblora_kaching_product.json', JSON.stringify(json, null, 2), 'utf8');
  console.log('Saved kaching product:', json.title, json.id);
}

// Also find the bundle block config (dealBars)
const dealBarsMatch = html.match(/dealBars":(\[[\s\S]*?\])\s*,\s*"dealBarTemplate"/i);
if (dealBarsMatch) {
  const dealBars = JSON.parse(dealBarsMatch[1]);
  fs.writeFileSync('scripts/amblora_dealbars.json', JSON.stringify(dealBars, null, 2), 'utf8');
  console.log('DealBars count:', dealBars.length);
  dealBars.forEach(db => {
    console.log(`- Title: "${db.title}", Subtitle: "${db.subtitle}", Badge: "${db.badgeText}", Label: "${db.label}"`);
  });
}

// Find upsells
const upsellsMatch = html.match(/"upsells":(\[[\s\S]*?\])\s*,\s*"productPersonalisation"/i);
if (upsellsMatch) {
  const upsells = JSON.parse(upsellsMatch[1]);
  fs.writeFileSync('scripts/amblora_upsells.json', JSON.stringify(upsells, null, 2), 'utf8');
  console.log('Upsells count:', upsells.length);
  upsells.forEach(u => console.log('Upsell:', u.title, u.subtitle, u.discountValue));
}

