import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // Test GraphQL product update
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        title
        options {
          id
          name
          values
          position
        }
        variants(first: 50) {
          nodes {
            id
            title
            selectedOptions {
              name
              value
            }
            price
            compareAtPrice
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
    body: JSON.stringify({
      query,
      variables: { id: 'gid://shopify/Product/15664431104371' }
    })
  });

  const data = await res.json();
  console.log('GraphQL Product:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
