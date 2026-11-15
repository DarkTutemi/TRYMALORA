import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // 1. Get Product Details
  const pRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products/15664431104371.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const pData = await pRes.json();
  console.log('=== PRODUCT OPTIONS ===');
  console.log(JSON.stringify(pData.product.options, null, 2));
  console.log('VARIANT COUNT:', pData.product.variants.length);
  console.log('ALL VARIANTS:');
  console.log(pData.product.variants.map(v => ({
    id: v.id,
    title: v.title,
    option1: v.option1,
    option2: v.option2,
    option3: v.option3,
    price: v.price,
    compare_at_price: v.compare_at_price,
    inventory_quantity: v.inventory_quantity
  })));

  // 2. Get Shipping Zones
  const sRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/shipping_zones.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (sRes.ok) {
    const sData = await sRes.json();
    console.log('\n=== SHIPPING ZONES ===');
    console.log(JSON.stringify(sData.shipping_zones.map(z => ({
      id: z.id,
      name: z.name,
      countries: z.countries.map(c => c.code),
      price_based_shipping_rates: z.price_based_shipping_rates,
      weight_based_shipping_rates: z.weight_based_shipping_rates
    })), null, 2));
  } else {
    console.log('Shipping zones response:', sRes.status, await sRes.text());
  }

  // 3. Check Automatic Discounts via GraphQL
  const gqlQuery = `
    query {
      automaticDiscountNodes(first: 20) {
        nodes {
          id
          automaticDiscount {
            ... on DiscountAutomaticBasic {
              title
              status
              summary
              startsAt
              endsAt
            }
            ... on DiscountAutomaticBxgy {
              title
              status
              summary
              startsAt
              endsAt
            }
            ... on DiscountAutomaticApp {
              title
              status
            }
          }
        }
      }
      codeDiscountNodes(first: 20) {
        nodes {
          id
          codeDiscount {
            ... on DiscountCodeBasic {
              title
              status
              summary
            }
            ... on DiscountCodeBxgy {
              title
              status
              summary
            }
          }
        }
      }
    }
  `;

  const gRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: gqlQuery })
  });

  const gData = await gRes.json();
  console.log('\n=== EXISTING AUTOMATIC DISCOUNTS ===');
  console.log(JSON.stringify(gData.data?.automaticDiscountNodes?.nodes, null, 2));
  console.log('\n=== EXISTING CODE DISCOUNTS ===');
  console.log(JSON.stringify(gData.data?.codeDiscountNodes?.nodes, null, 2));
}

main().catch(console.error);

