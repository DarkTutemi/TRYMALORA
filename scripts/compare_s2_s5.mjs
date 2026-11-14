import fs from 'fs';

const s2 = JSON.parse(fs.readFileSync('scripts/source_2_data.json', 'utf8'));
const s5 = JSON.parse(fs.readFileSync('scripts/source_5_data.json', 'utf8'));

console.log('=== SOURCE 2 vs SOURCE 5 COMPARISON ===');
console.log('S2 Title:', s2.title);
console.log('S5 Title:', s5.title);
console.log('\nS2 Variants:');
s2.variants.forEach(v => console.log(' ', v.title, v.price, v.sku));
console.log('\nS5 Variants:');
s5.variants.forEach(v => console.log(' ', v.title, v.price, v.sku));

console.log('\nS2 Description snippet:');
console.log(s2.description.replace(/<[^>]+>/g, ' ').substring(0, 300));
console.log('\nS5 Description snippet:');
console.log(s5.description.replace(/<[^>]+>/g, ' ').substring(0, 300));

console.log('\nS2 Image sample:', s2.images ? s2.images.slice(0, 3) : []);
console.log('S5 Image sample:', s5.images ? s5.images.slice(0, 3) : []);

