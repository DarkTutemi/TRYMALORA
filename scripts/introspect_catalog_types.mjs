import { getCliToken } from './config.mjs';

async function introspectCatalogTypes() {
  const token = getCliToken();
  const query = `
    query {
      __type(name: "AllPublicationsPublishContext") {
        inputFields {
          name
          type {
            name
            kind
            ofType {
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
  console.log('Context:', JSON.stringify(data, null, 2));
}

introspectCatalogTypes();

