import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  console.log('TOKEN:', token ? token.substring(0, 10) + '...' : 'NONE');
  const url = `https://${SHOP}/admin/api/${API_VERSION}/graphql.json`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query: '{ shop { name myshopifyDomain } }' })
  });
  console.log('STATUS:', res.status);
  const text = await res.text();
  console.log('BODY:', text);
}

main().catch(console.error);
