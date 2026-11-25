import fs from 'fs';

const home = fs.readFileSync('scripts/8sheep_home.html', 'utf8');
const imgMatches = [...home.matchAll(/src="([^"]+cdn[^"]+)"/gi)].map(m => m[1]);
console.log('Sample image URLs in original 8sheep_home.html:');
console.log(imgMatches.slice(0, 10));

const srcsetMatches = [...home.matchAll(/srcset="([^"]+)"/gi)].map(m => m[1]);
console.log('Sample srcset URLs:');
console.log(srcsetMatches.slice(0, 3));
