import { getAccessToken, SHOP } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  const query = `{
    product(id: "gid://shopify/Product/15647536415091") {
      title
      variants(first: 5) {
        nodes {
          id
          title
          price
          availableForSale
          inventoryQuantity
          inventoryPolicy
        }
      }
    }
    upsell: product(id: "gid://shopify/Product/15647533236595") {
      title
      variants(first: 5) {
        nodes {
          id
          title
          price
          availableForSale
          inventoryQuantity
          inventoryPolicy
        }
      }
    }
  }`;

  const res = await fetch(`https://${SHOP}/admin/api/2024-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query })
  });
  const data = await res.json();
  console.log(JSON.stringify(data.data, null, 2));
}

main();

