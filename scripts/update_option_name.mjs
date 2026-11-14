import { adminGraphql } from './config.mjs';

async function main() {
  const productId = "gid://shopify/Product/15647463735667";
  const optionId = "gid://shopify/ProductOption/17882569933171";

  console.log('Updating option name to Package...');
  const res = await adminGraphql(`
    mutation productOptionUpdate($productId: ID!, $option: OptionUpdateInput!) {
      productOptionUpdate(productId: $productId, option: $option) {
        userErrors { field message }
        product {
          options {
            id
            name
            values
          }
        }
      }
    }
  `, {
    productId,
    option: {
      id: optionId,
      name: "Package"
    }
  });

  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

