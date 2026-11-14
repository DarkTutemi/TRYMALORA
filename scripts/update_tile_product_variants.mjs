import { adminGraphql } from './config.mjs';

const colors = ["Pure White", "Modern Gray", "Matte Black"];
const sizes = [
  { size: "100g", price: "16.99" },
  { size: "300g", price: "29.99" },
  { size: "500g", price: "39.99" }
];

async function main() {
  const variants = [];
  for (const c of colors) {
    for (const s of sizes) {
      variants.push({
        optionValues: [
          { optionName: "Color", name: c },
          { optionName: "Size", name: s.size }
        ],
        price: s.price,
        inventoryPolicy: "CONTINUE"
      });
    }
  }

  const input = {
    id: "gid://shopify/Product/15636321698163",
    productOptions: [
      {
        name: "Color",
        values: colors.map(c => ({ name: c }))
      },
      {
        name: "Size",
        values: sizes.map(s => ({ name: s.size }))
      }
    ],
    variants
  };

  const mutation = `
    mutation productSet($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          title
          handle
          status
          options {
            id
            name
            values
          }
          variants(first: 20) {
            edges {
              node {
                id
                title
                price
                inventoryPolicy
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  console.log("Updating variants for product 15636321698163...");
  const res = await adminGraphql(mutation, { input });
  console.log(JSON.stringify(res, null, 2));
}

main();

