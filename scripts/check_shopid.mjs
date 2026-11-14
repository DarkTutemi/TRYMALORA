import fs from 'fs';

const html = fs.readFileSync('scripts/aneedfamily_page.html', 'utf8');

const m = html.match(/shopId[\"']?\s*:\s*(\d+)/i) || html.match(/"shopId":\s*(\d+)/);
console.log('shopId match:', m ? m[1] : 'none');

