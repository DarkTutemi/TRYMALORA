import { getCliToken } from './config.mjs';

async function introspectCatalogTypeEnum() {
  const token = getCliToken();
  const query = `
    query {
      __type(name: "AllPublicationsPublishContext") {
        inputFields {
          name
          type {
            ofType {
              ofType {
                ofType {
                  name
                  kind
                  enumValues {
                    name
                  }
                }
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
  console.log('Enum values:', JSON.stringify(data.data.__type.inputFields[0].type.ofType.ofType.ofType.enumValues, null, 2));
}

introspectCatalogTypeEnum();

