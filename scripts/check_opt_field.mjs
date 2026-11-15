import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `
    query {
      __type(name: "ProductVariantsBulkInput") {
        inputFields {
          name
          type {
            name
            ofType {
              name
              ofType {
                name
              }
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
  const optValField = data.data.__type.inputFields.find(f => f.name === 'optionValues');
  console.log('optionValues field type:', JSON.stringify(optValField, null, 2));
}

main().catch(console.error);
