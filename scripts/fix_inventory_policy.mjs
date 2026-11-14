import { adminGraphql } from './config.mjs';

async function main() {
  const prod = await adminGraphql(`{
    productByHandle(handle: "ear-cleaner") {
      id
      title
      variants(first: 10) {
        nodes {
          id
          title
          inventoryPolicy
        }
      }
    }
  }`);

  const variants = prod.productByHandle.variants.nodes;
  console.log('Current ear-cleaner variants:', variants);

  const updateInput = variants.map(v => ({
    id: v.id,
    inventoryPolicy: "CONTINUE"
  }));

  const res = await adminGraphql(`
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          inventoryPolicy
        }
        userErrors { field message }
      }
    }
  `, {
    productId: prod.productByHandle.id,
    variants: updateInput
  });

  console.log('Update result:', JSON.stringify(res, null, 2));

  // Also check wipes product
  const wipes = await adminGraphql(`{
    productByHandle(handle: "ear-finger-wipes") {
      id
      title
      variants(first: 5) {
        nodes {
          id
          title
          inventoryPolicy
        }
      }
    }
  }`);
  console.log('Wipes variants:', wipes.productByHandle.variants.nodes);
  await adminGraphql(`
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          inventoryPolicy
        }
        userErrors { field message }
      }
    }
  `, {
    productId: wipes.productByHandle.id,
    variants: wipes.productByHandle.variants.nodes.map(v => ({
      id: v.id,
      inventoryPolicy: "CONTINUE"
    }))
  });
  console.log('Wipes inventory policy set to CONTINUE.');
}

main().catch(console.error);

