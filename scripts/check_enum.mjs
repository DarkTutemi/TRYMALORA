import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function checkMenuItemType() {
  const token = await getAccessToken();
  const query = `
    query {
      __type(name: "MenuItemType") {
        enumValues {
          name
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
  console.log('MenuItemType enum values:', data.data?.__type?.enumValues?.map(e => e.name));
}

checkMenuItemType();

