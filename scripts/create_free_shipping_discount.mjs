import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const mutation = `
    mutation discountAutomaticFreeShippingCreate($freeShippingAutomaticDiscount: DiscountAutomaticFreeShippingInput!) {
      discountAutomaticFreeShippingCreate(freeShippingAutomaticDiscount: $freeShippingAutomaticDiscount) {
        userErrors {
          field
          message
          code
        }
        automaticDiscountNode {
          id
          automaticDiscount {
            ... on DiscountAutomaticFreeShipping {
              title
              status
              summary
            }
          }
        }
      }
    }
  `;

  console.log('Creating Automatic Free Shipping Discount for US orders >= $70...');
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        freeShippingAutomaticDiscount: {
          title: 'FREE US SHIPPING ON ORDERS $70+',
          startsAt: new Date(Date.now() - 60000).toISOString(),
          minimumRequirement: {
            subtotal: {
              greaterThanOrEqualToSubtotal: '70.0'
            }
          },
          destination: {
            countries: {
              add: ['US']
            }
          },
          combinesWith: {
            orderDiscounts: true,
            productDiscounts: true
          }
        }
      }
    })
  });

  const json = await res.json();
  console.log('Free Shipping Discount Result:', JSON.stringify(json, null, 2));
}

main().catch(console.error);
