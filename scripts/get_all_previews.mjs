import { getCliToken } from './config.mjs';

async function getAllPreviewUrls() {
  const token = getCliToken();
  const query = `
    query {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            status
            onlineStorePreviewUrl
          }
        }
      }
    }
  `;
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const products = data.data.products.edges.map(e => e.node);
  console.log(JSON.stringify(products, null, 2));
}

getAllPreviewUrls();

