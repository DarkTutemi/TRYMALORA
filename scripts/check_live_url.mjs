import { getCliToken } from './config.mjs';

async function checkLiveUrl() {
  const token = getCliToken();
  const query = `
    query {
      product(id: "gid://shopify/Product/15635841057139") {
        id
        title
        status
        onlineStorePreviewUrl
        onlineStoreUrl
      }
    }
  `;
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('Live product:', JSON.stringify(data, null, 2));
}

checkLiveUrl();

