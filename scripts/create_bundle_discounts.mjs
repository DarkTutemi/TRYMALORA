import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const PRODUCT_ID = 'gid://shopify/Product/15664431104371';

async function main() {
  const token = await getAccessToken();

  const mutation = `
    mutation discountAutomaticBasicCreate($automaticBasicDiscount: DiscountAutomaticBasicInput!) {
      discountAutomaticBasicCreate(automaticBasicDiscount: $automaticBasicDiscount) {
        userErrors {
          field
          message
          code
        }
        automaticDiscountNode {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
              status
              summary
            }
          }
        }
      }
    }
  `;

  console.log('Creating 10% Automatic Discount (Qty >= 3)...');
  const res1 = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        automaticBasicDiscount: {
          title: 'ULTRA OVERNIGHT — 3-Pack 10% OFF',
          startsAt: new Date(Date.now() - 60000).toISOString(),
          minimumRequirement: {
            quantity: {
              greaterThanOrEqualToQuantity: '3'
            }
          },
          customerGets: {
            value: {
              percentage: 0.10
            },
            items: {
              products: {
                productsToAdd: [PRODUCT_ID]
              }
            }
          },
          combinesWith: {
            orderDiscounts: true,
            productDiscounts: true,
            shippingDiscounts: true
          }
        }
      }
    })
  });

  const json1 = await res1.json();
  console.log('Discount 1 Result:', JSON.stringify(json1, null, 2));

  console.log('\nCreating 20% Automatic Discount (Qty >= 5)...');
  const res2 = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        automaticBasicDiscount: {
          title: 'ULTRA OVERNIGHT — 5-Pack 20% OFF',
          startsAt: new Date(Date.now() - 60000).toISOString(),
          minimumRequirement: {
            quantity: {
              greaterThanOrEqualToQuantity: '5'
            }
          },
          customerGets: {
            value: {
              percentage: 0.20
            },
            items: {
              products: {
                productsToAdd: [PRODUCT_ID]
              }
            }
          },
          combinesWith: {
            orderDiscounts: true,
            productDiscounts: true,
            shippingDiscounts: true
          }
        }
      }
    })
  });

  const json2 = await res2.json();
  console.log('Discount 2 Result:', JSON.stringify(json2, null, 2));
}

main().catch(console.error);
