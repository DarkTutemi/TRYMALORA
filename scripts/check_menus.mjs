import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkLinklists() {
  const token = await getAccessToken();
  // Query via GraphQL for menus
  const query = `
    query {
      menus(first: 10) {
        nodes {
          id
          title
          handle
          items {
            id
            title
            url
            items {
              id
              title
              url
            }
          }
        }
      }
    }
  `;
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log('Shopify Menus:', JSON.stringify(data.data?.menus?.nodes, null, 2));
}
checkLinklists();

