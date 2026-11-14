import fs from 'fs';

async function main() {
  const scriptUrl = 'https://cdn.shopify.com/extensions/01a19a43-1b51-7c07-a896-e846e58bd2dd/cwilltrustoo-reviews-294/assets/swiper-reviews.min.js';
  const res = await fetch(scriptUrl);
  const code = await res.text();
  console.log('Script length:', code.length);
  // Search for http or api
  const matches = code.match(/https?:\/\/[a-zA-Z0-9.-]+\/[a-zA-Z0-9._\-\/]+/g) || [];
  console.log('URLs in script:', [...new Set(matches)]);
}

main();

