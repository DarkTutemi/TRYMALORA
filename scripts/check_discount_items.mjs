import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `
    query {
      items: __type(name: "DiscountItemsInput") {
        inputFields {
          name
          type {
            name
            ofType {
              name
            }
          }
        }
      }
      val: __type(name: "DiscountCustomerGetsValueInput") {
        inputFields {
          name
          type {
            name
            ofType {
              name
            }
          }
        }
      }
      comb: __type(name: "DiscountCombinesWithInput") {
        inputFields {
          name
          type {
            name
            ofType {
              name
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
  console.log('DiscountItemsInput:', JSON.stringify(data.data.items, null, 2));
  console.log('DiscountCustomerGetsValueInput:', JSON.stringify(data.data.val, null, 2));
  console.log('DiscountCombinesWithInput:', JSON.stringify(data.data.comb, null, 2));
}

main().catch(console.error);
