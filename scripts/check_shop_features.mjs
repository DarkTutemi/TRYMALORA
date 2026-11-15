import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        shop {
          checkoutApiSupported
          features {
            branding
          }
        }
      }`
    })
  });
  const data = await res.json();
  console.log('Shop Features:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
