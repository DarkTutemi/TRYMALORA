import fs from 'fs';

async function main() {
  const scriptUrl = 'https://cdn.shopify.com/extensions/01a19a43-1b51-7c07-a896-e846e58bd2dd/cwilltrustoo-reviews-294/assets/swiper-reviews.min.js';
  const res = await fetch(scriptUrl);
  const code = await res.text();
  
  const idx = code.indexOf('get_product_reviews');
  if (idx !== -1) {
    console.log(code.slice(idx - 200, idx + 400));
  }
}

main();

