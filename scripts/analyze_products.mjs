import fs from 'fs';

const productsData = JSON.parse(fs.readFileSync('scripts/8sheep_products.json', 'utf8'));
console.log('--- 8SHEEP PRODUCTS SUMMARY ---');
console.log(`Total Products: ${productsData.products.length}\n`);

for (const p of productsData.products) {
  console.log(`Product: [${p.id}] ${p.title} (${p.handle})`);
  console.log(`  Variants: ${p.variants.length} (${p.variants.map(v => v.title + ': $' + v.price).join(', ')})`);
  console.log(`  Images: ${p.images.length}`);
  console.log(`  Tags: ${p.tags}`);
  console.log(`  Options: ${p.options.map(o => o.name + ': [' + o.values.join(', ') + ']').join(' | ')}`);
  console.log('--------------------------------------------------');
}
