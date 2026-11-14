import fs from 'fs';

const html = fs.readFileSync('scripts/target_gnome.html', 'utf8');

// 1. JSON-LD
const jsonLdRegex = /<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi;
let match;
const jsonLds = [];
while ((match = jsonLdRegex.exec(html)) !== null) {
  try {
    const parsed = JSON.parse(match[1]);
    jsonLds.push(parsed);
  } catch (e) {}
}

const productJsonLd = jsonLds.find(item => item['@type'] === 'Product' || (Array.isArray(item) && item.some(x => x['@type'] === 'Product')));
console.log('--- JSON-LD PRODUCT ---');
if (productJsonLd) {
  console.log('Name:', productJsonLd.name);
  console.log('Description:', productJsonLd.description?.substring(0, 200));
  console.log('Offers:', productJsonLd.offers?.length || (productJsonLd.offers ? 1 : 0));
  if (productJsonLd.offers) {
    const offers = Array.isArray(productJsonLd.offers) ? productJsonLd.offers : [productJsonLd.offers];
    console.log('First offer:', offers[0]);
  }
}

// 2. Look for window.ShopifyAnalytics or meta
const metaMatch = html.match(/var meta\s*=\s*(\{[\s\S]*?\});/);
if (metaMatch) {
  try {
    const meta = JSON.parse(metaMatch[1]);
    console.log('\n--- META OBJECT ---');
    console.log('Product meta:', JSON.stringify(meta.product || meta, null, 2).substring(0, 500));
  } catch (e) {
    console.log('Meta regex matched but failed parse');
  }
}

// 3. Look for product json in script tags or form
const productJsonMatches = [...html.matchAll(/<script[^>]*id=["'][^"']*product[^"']*["'][^>]*>([\s\S]*?)<\/script>/gi)];
console.log('\nProduct script tags found:', productJsonMatches.length);

// 4. Look for title, gallery images, variants
const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
console.log('H1 Title:', titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : 'N/A');

// Look for image urls
const imgUrls = new Set();
const imgRegex = /https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp|avif)(?:\?[^"'\s]*)?/gi;
let imgMatch;
while ((imgMatch = imgRegex.exec(html)) !== null) {
  const url = imgMatch[0];
  if (url.includes('cdn/shop/files') || url.includes('cdn/shop/products')) {
    imgUrls.add(url.split('&')[0]); // clean url
  }
}
console.log('\nUnique Shopify CDN Product Images:', imgUrls.size);
console.log(Array.from(imgUrls).slice(0, 10));

// 5. Look for reviews widgets (Judge.me, Loox, Okendo, Yotpo, etc.)
if (html.includes('judge.me') || html.includes('jdgm')) {
  console.log('\nReviews: Detected Judge.me');
}
if (html.includes('loox')) {
  console.log('\nReviews: Detected Loox');
}
if (html.includes('yotpo')) {
  console.log('\nReviews: Detected Yotpo');
}
if (html.includes('shopify-product-reviews') || html.includes('spr-reviews')) {
  console.log('\nReviews: Detected Shopify Product Reviews');
}

