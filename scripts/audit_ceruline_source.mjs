import fs from 'fs';

const html = fs.readFileSync('scripts/ceruline_audit/source.html', 'utf8');
const prod = JSON.parse(fs.readFileSync('scripts/ceruline_audit/product.json', 'utf8'));

console.log('=== CERULINE PRODUCT JSON ===');
console.log('Title:', prod.product.title);
console.log('Handle:', prod.product.handle);
console.log('Variants:', prod.product.variants.map(v => ({ id: v.id, title: v.title, price: v.price, compare_at_price: v.compare_at_price, sku: v.sku })));
console.log('Images count:', prod.product.images.length);

const themeMatch = html.match(/Shopify\.theme\s*=\s*(\{.+?\});/);
console.log('\nShopify.theme:', themeMatch?.[1]);

const sectionIds = [...html.matchAll(/id="shopify-section-([^"]+)"/g)].map(m => m[1]);
console.log('\nSection IDs in exact order (' + sectionIds.length + '):');
sectionIds.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));

const cssLinks = [...new Set([...html.matchAll(/href="([^"]+\.css[^"]*)"/gi)].map(m => m[1]))].filter(u => u.includes('ceruline') || u.includes('cdn.shopify'));
console.log('\nCSS Assets:', cssLinks.slice(0, 15));

const jsLinks = [...new Set([...html.matchAll(/src="([^"]+\.js[^"]*)"/gi)].map(m => m[1]))].filter(u => u.includes('ceruline') || u.includes('cdn.shopify'));
console.log('\nJS Assets:', jsLinks.slice(0, 15));
