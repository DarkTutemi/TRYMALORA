import { getCliToken } from './config.mjs';

async function introspectPublishablePublish() {
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
  const fields = data.data.__type.fields.filter(f => f.name.toLowerCase().includes('publish'));
  console.log('Publish mutations:', JSON.stringify(fields, null, 2));
}

introspectPublishablePublish();

