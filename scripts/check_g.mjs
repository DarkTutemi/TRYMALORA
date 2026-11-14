import fs from 'fs';

async function main() {
  const scriptUrl = 'https://cdn.shopify.com/extensions/01a19a43-1b51-7c07-a896-e846e58bd2dd/cwilltrustoo-reviews-294/assets/swiper-reviews.min.js';
  const res = await fetch(scriptUrl);
  const code = await res.text();
  const idx = code.indexOf('shop_id:g');
  console.log(code.slice(idx - 300, idx + 100));
}

main();

