import fs from 'fs';

const html = fs.readFileSync('scripts/aneedfamily_page.html', 'utf8');

// Look for product ID of itcb
const prodIdMatch = html.match(/"product":\{"id":(\d+)/) || html.match(/productId:\s*['"]?(\d+)['"]?/);
console.log('Product ID match:', prodIdMatch ? prodIdMatch[1] : 'not found');

// Let's search for how Trustoo requests reviews
const chunk = html.slice(html.indexOf('var vstar_product_reviews'), html.indexOf('var vstar_product_reviews') + 5000);
console.log('Around vstar_product_reviews:', chunk.slice(0, 1000));

