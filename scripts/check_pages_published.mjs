import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkAllPagesPublished() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/pages.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  for (const p of data.pages || []) {
    console.log(`${p.handle}: published_at = ${p.published_at}`);
  }
}
checkAllPagesPublished();

