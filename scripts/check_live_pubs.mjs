import { getCliToken } from './config.mjs';

async function checkLivePubs() {
  const token = getCliToken();
  const query = `
    query {
      product(id: "gid://shopify/Product/15635841057139") {
        id
        title
        status
        resourcePublicationsV2(first: 5) {
          edges {
            node {
              publication {
                id
                name
              }
              isPublished
            }
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
  console.log('Live product publications:', JSON.stringify(data, null, 2));
}

checkLivePubs();

