import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // Query shop and delivery profiles
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        shop {
          name
          currencyCode
          currencyFormats {
            moneyFormat
            moneyWithCurrencyFormat
          }
          enabledPresentmentCurrencies
        }
      }`
    })
  });

  const data = await res.json();
  console.log('Shop & Delivery Info:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
