import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkMenuUpdateInput() {
  const token = await getAccessToken();
  const query = `
    query {
      __type(name: "MenuItemUpdateInput") {
        inputFields {
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
  console.log('MenuItemUpdateInput:', JSON.stringify(data.data?.__type?.inputFields, null, 2));
}

checkMenuUpdateInput();

