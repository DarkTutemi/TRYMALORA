import fs from 'fs';

async function main() {
  const scriptUrl = 'https://cdn.shopify.com/extensions/01a19a43-1b51-7c07-a896-e846e58bd2dd/cwilltrustoo-reviews-294/assets/swiper-reviews.min.js';
  const res = await fetch(scriptUrl);
  const code = await res.text();
  const idx = code.indexOf('https://rapi.trustoo.io');
  if (idx !== -1) {
    console.log('Around rapi:', code.slice(idx - 50, idx + 250));
  }
  const idx2 = code.indexOf('https://api.trustoo.io');
  if (idx2 !== -1) {
    console.log('Around api:', code.slice(idx2 - 50, idx2 + 250));
  }
}

main();

