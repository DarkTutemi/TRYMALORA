import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';

async function main() {
  const token = await getAccessToken();
  const schemaContent = fs.readFileSync('config/settings_schema.json', 'utf8');
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({ asset: { key: 'config/settings_schema.json', value: schemaContent } })
  });
  console.log(res.status, await res.text());
}

main().catch(console.error);
