import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function queryThemes() {
  console.log(`Querying themes for store: ${SHOP}...`);
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const data = await res.json();
  if (!data.themes) {
    console.error('Failed to fetch themes:', data);
    return;
  }
  console.log(`\nThemes on ${SHOP}:`);
  for (const t of data.themes) {
    console.log(`- ID: ${t.id} | Name: "${t.name}" | Role: ${t.role} | Updated: ${t.updated_at}`);
  }
}

queryThemes().catch(console.error);
