import { getCliToken } from './config.mjs';

async function checkChannelApp() {
  const token = getCliToken();
  const query = `
    query {
      product(id: "gid://shopify/Product/15635841057139") {
        supportedChannels(first: 2) {
          edges {
            node {
              id
              name
              app {
                id
                title
              }
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
  console.log('Channel App:', JSON.stringify(data, null, 2));
}

checkChannelApp();

