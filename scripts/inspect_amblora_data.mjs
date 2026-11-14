import fs from 'fs';

const data = JSON.parse(fs.readFileSync('scripts/amblora_ear_cleaner.json', 'utf8'));
const p = data.product;

console.log('Title:', p.title);
console.log('Handle:', p.handle);
console.log('Product type:', p.product_type);
console.log('Tags:', p.tags);
console.log('Price:', p.variants?.[0]?.price);
console.log('Compare at price:', p.variants?.[0]?.compare_at_price);
console.log('Images:', p.images?.map(img => img.src));

// Let's also check description snippet
console.log('Description snippet:', p.body_html?.slice(0, 500));

