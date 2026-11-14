import { adminGraphql } from './config.mjs';
import fs from 'fs';

async function updateGnomeVariants() {
  const productId = "gid://shopify/Product/15650950283635";

  const tiers = [
    {
      name: "1x Single Gnome",
      price: "69.99",
      compareAtPrice: "139.98"
    },
    {
      name: "2x Woodland Duo (Save $160)",
      price: "119.98",
      compareAtPrice: "279.96"
    },
    {
      name: "3x Holiday Family Trio (Best Value)",
      price: "159.98",
      compareAtPrice: "419.94"
    }
  ];

  const input = {
    id: productId,
    productOptions: [
      {
        name: "Package",
        values: tiers.map(t => ({ name: t.name }))
      }
    ],
    variants: tiers.map(t => ({
      optionValues: [
        {
          optionName: "Package",
          name: t.name
        }
      ],
      price: t.price,
      compareAtPrice: t.compareAtPrice,
      inventoryPolicy: "CONTINUE"
    }))
  };

  console.log('Setting product options and variants via productSet...');
  const res = await adminGraphql(`
    mutation setProductVariants($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          title
          options {
            id
            name
            values
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                compareAtPrice
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
  `, { input });

  if (res.productSet?.userErrors?.length > 0) {
    console.error('UserErrors:', res.productSet.userErrors);
    throw new Error('Failed to update variants');
  }

  console.log('✔ Product variants successfully set:');
  const variants = res.productSet.product.variants.edges.map(e => e.node);
  console.log(JSON.stringify(variants, null, 2));

  fs.writeFileSync('data/gnome_created_variants.json', JSON.stringify({
    productId,
    variants
  }, null, 2));
}

updateGnomeVariants().catch(console.error);

