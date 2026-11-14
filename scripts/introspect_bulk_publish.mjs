import { getCliToken } from './config.mjs';

async function testProductBulkPublish() {
  const token = getCliToken();
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
  const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  const field = data.data.__type.fields.find(f => f.name === 'productBulkPublish');
  console.log('productBulkPublish field:', JSON.stringify(field, null, 2));
}

testProductBulkPublish();
