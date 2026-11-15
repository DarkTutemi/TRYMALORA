import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // Test updating option 2 values via productOptionUpdate
  const mutation = `
    mutation productOptionUpdate($productId: ID!, $option: OptionUpdateInput!) {
      productOptionUpdate(productId: $productId, option: $option) {
        userErrors {
          field
          message
        }
        product {
          id
          options {
            id
            name
            values
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
      query: mutation,
      variables: {
        productId: 'gid://shopify/Product/15664431104371',
        option: {
          id: 'gid://shopify/ProductOption/17901842530675',
          name: 'Color',
          values: [
            { name: 'Black' },
            { name: 'Orange' },
            { name: 'Red' },
            { name: 'Nude' }
          ]
        }
      }
    })
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
