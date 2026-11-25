import fs from 'fs';

const html = fs.readFileSync('scripts/8sheep_pdp_sleepylotion.html', 'utf8');
const pubkey = html.match(/pubkey-[a-zA-Z0-9]+/i);
const storeHash = html.match(/data-store-hash="([^"]+)"/i) || html.match(/sId["']?\s*[:=]\s*["']?(\d+)/i);

console.log('Stamped pubkey:', pubkey?.[0]);
console.log('Stamped storeHash/sId:', storeHash?.[1] || storeHash?.[0]);

// Also check stamped widget div
const widgetIdx = html.indexOf('stamped-main-widget');
if (widgetIdx !== -1) {
  console.log('Widget snippet:', html.slice(widgetIdx - 100, widgetIdx + 600));
}
