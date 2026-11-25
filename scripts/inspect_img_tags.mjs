import fs from 'fs';

const pdpMain = fs.readFileSync('sections/malora-product-main.liquid', 'utf8');

const imgTags = [...pdpMain.matchAll(/<img[^>]+>/g)].slice(0, 5).map(m => m[0]);
console.log('Sample img tags in malora-product-main.liquid:');
for (const tag of imgTags) {
  console.log('---');
  console.log(tag);
}

const colTabs = fs.readFileSync('sections/malora-collection-tabs.liquid', 'utf8');
const colImgTags = [...colTabs.matchAll(/<img[^>]+>/g)].slice(0, 5).map(m => m[0]);
console.log('\nSample img tags in malora-collection-tabs.liquid:');
for (const tag of colImgTags) {
  console.log('---');
  console.log(tag);
}
