import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function check() {
  const token = await getAccessToken();
  const files = [
    'doctor-avatar-1.png',
    'doctor-avatar-2.png',
    'doctor-avatar-3.png',
    'ultra-lifestyle-card-1.jpg',
    'ultra-lifestyle-card-2.jpg',
    'ultra-lifestyle-card-3.jpg'
  ];
  for (const f of files) {
    const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=assets/${f}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    console.log(f, res.status);
  }
}
check();

