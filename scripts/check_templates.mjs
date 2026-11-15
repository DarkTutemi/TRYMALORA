import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkTemplates() {
  const token = await getAccessToken();
  const keys = [
    'templates/page.track-order.json',
    'templates/page.track-order.liquid',
    'templates/page.about-us.json',
    'templates/page.about-us.liquid',
    'sections/ultra-track-order.liquid',
    'sections/ultra-about.liquid',
    'sections/ultra-about-story.liquid'
  ];
  for (const key of keys) {
    const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=${encodeURIComponent(key)}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    console.log(key, 'Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Content preview for', key, ':', data.asset?.value?.slice(0, 300));
    }
  }
}
checkTemplates();

