import { adminGraphql } from './config.mjs';

async function main() {
  const prodRes = await adminGraphql(`{
    productByHandle(handle: "metallic-silver-anti-rust-renovation-coating") {
      id
      title
      options {
        id
        name
        values
      }
      variants(first: 10) {
        nodes {
          id
          title
          price
        }
      }
    }
  }`);

  const p = prodRes.productByHandle;
  console.log('Product:', p.id, p.title);
  console.log('Variants:', p.variants.nodes);

  const v1 = p.variants.nodes[0];
  const v2 = p.variants.nodes[1];
  const v3 = p.variants.nodes[2];

  const mutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          price
          selectedOptions {
            name
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    productId: p.id,
    variants: [
      {
        id: v1.id,
        price: "99.95",
        compareAtPrice: null,
        optionValues: [
          {
            optionName: "Package",
            name: "Buy 5 Get 3 FREE (8 Cans Total · 50g)"
          }
        ]
      },
      {
        id: v2.id,
        price: "59.97",
        compareAtPrice: null,
        optionValues: [
          {
            optionName: "Package",
            name: "Buy 3 Get 1 FREE (4 Cans Total · 50g)"
          }
        ]
      },
      {
        id: v3.id,
        price: "19.99",
        compareAtPrice: null,
        optionValues: [
          {
            optionName: "Package",
            name: "1 Can (50g Starter Kit)"
          }
        ]
      }
    ]
  };

  const updateRes = await adminGraphql(mutation, variables);
  console.log('Update result:', JSON.stringify(updateRes, null, 2));
}

main().catch(console.error);
