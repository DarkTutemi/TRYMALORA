import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkAboutPage() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/pages/717036683635.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Page 717036683635 (about-us) details:', JSON.stringify(data.page, null, 2));
}
checkAboutPage();

