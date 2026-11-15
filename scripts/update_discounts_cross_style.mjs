import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const PRODUCT_IDS = [
  'gid://shopify/Product/15664431104371', // ULTRA OVERNIGHT
  'gid://shopify/Product/15669450244467', // ULTRA LACE
  'gid://shopify/Product/15669450670451'  // ULTRA COMFORT SHORTS
];

async function updateDiscount(token, id, title, percentage, minQty) {
  const mutation = `mutation discountAutomaticBasicUpdate($id: ID!, $automaticBasicDiscount: DiscountAutomaticBasicInput!) {
    discountAutomaticBasicUpdate(id: $id, automaticBasicDiscount: $automaticBasicDiscount) {
      automaticDiscountNode {
        id
        automaticDiscount {
          ... on DiscountAutomaticBasic {
            title
            status
          }
        }
      }
      userErrors {
        field
        code
        message
      }
    }
  }`;

  const payload = {
    id: id,
    automaticBasicDiscount: {
      title: title,
      customerGets: {
        value: { percentage: percentage },
        items: {
          products: {
            productsToAdd: PRODUCT_IDS
          }
        }
      },
      minimumRequirement: {
        quantity: {
          greaterThanOrEqualToQuantity: minQty
        }
      }
    }
  };

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: mutation,
      variables: payload
    })
  });

  const data = await res.json();
  console.log(`Update ${title}:`, JSON.stringify(data, null, 2));
}

async function main() {
  const token = await getAccessToken();
  console.log('--- Updating Automatic Discounts for Cross-Style Mix & Match ---');
  await updateDiscount(token, 'gid://shopify/DiscountAutomaticNode/1798366232947', 'ULTRA COLLECTION — 3-Pack 10% OFF', 0.10, '3');
  await updateDiscount(token, 'gid://shopify/DiscountAutomaticNode/1798366265715', 'ULTRA COLLECTION — 5-Pack 20% OFF', 0.20, '5');
}

main().catch(console.error);
