import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `
    query {
      __type(name: "Mutation") {
        fields {
          name
          args {
            name
            type {
              name
              kind
              ofType {
                name
                kind
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
  const bulkCreate = data.data.__type.fields.find(f => f.name === 'productVariantsBulkCreate');
  const bulkUpdate = data.data.__type.fields.find(f => f.name === 'productVariantsBulkUpdate');
  console.log('productVariantsBulkCreate args:', JSON.stringify(bulkCreate.args, null, 2));
  console.log('productVariantsBulkUpdate args:', JSON.stringify(bulkUpdate.args, null, 2));
}

main().catch(console.error);

