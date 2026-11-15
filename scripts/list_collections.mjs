import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/custom_collections.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  console.log('Custom Collections:', data.custom_collections.map(c => ({ id: c.id, handle: c.handle, title: c.title })));
}

main().catch(console.error);
