import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkPageDetails() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/pages/717036716403.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Page 717036716403 details:', JSON.stringify(data.page, null, 2));
}
checkPageDetails();

