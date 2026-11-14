import fs from 'fs';

async function main() {
  const scriptUrl = 'https://cdn.shopify.com/extensions/01a19a43-1b51-7c07-a896-e846e58bd2dd/cwilltrustoo-reviews-294/assets/swiper-reviews.min.js';
  const res = await fetch(scriptUrl);
  const code = await res.text();
  
  // Find calls to request or fetch
  const regex = /url:\s*['"]([^'"]+)['"]/g;
  let m;
  const urls = [];
  while ((m = regex.exec(code)) !== null) {
    urls.push(m[1]);
  }
  console.log('URLs:', urls);
}

main();

