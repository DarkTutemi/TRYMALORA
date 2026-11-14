import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function check() {
  const token = await getAccessToken();
  const query = `
    query {
      product(id: "gid://shopify/Product/15664431104371") {
        id
        title
        status
        onlineStoreUrl
        onlineStorePreviewUrl
      }
    }
  `;
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();

