import { getCliToken } from './config.mjs';

const variantConfigs = [
  {
    handle: 'car-metal-rust-repair-paste',
    optionName: 'Color',
    variants: [
      { name: 'White (50g)', price: '14.99', compareAtPrice: '29.99' },
      { name: 'Black (50g)', price: '14.99', compareAtPrice: '29.99' },
      { name: 'Blue (50g)', price: '14.99', compareAtPrice: '29.99' },
      { name: 'Pink (50g)', price: '14.99', compareAtPrice: '29.99' },
      { name: 'Red (50g)', price: '14.99', compareAtPrice: '29.99' },
      { name: 'Gray (50g)', price: '14.99', compareAtPrice: '29.99' }
    ]
  },
  {
    handle: 'metal-chrome-polish-restorer-paste',
    optionName: 'Option',
    variants: [
      { name: 'Chrome Silver (100g + Brush)', price: '13.99', compareAtPrice: '27.99' },
      { name: 'Dark Chrome / Black Trim (100g + Brush)', price: '13.99', compareAtPrice: '27.99' }
    ]
  },
  {
    handle: 'mini-dual-purpose-travel-styling-iron',
    optionName: 'Color',
    variants: [
      { name: 'Pearl White', price: '19.99', compareAtPrice: '39.99' },
      { name: 'Soft Pink', price: '19.99', compareAtPrice: '39.99' },
      { name: 'Sage Green', price: '19.99', compareAtPrice: '39.99' },
      { name: 'Sky Blue', price: '19.99', compareAtPrice: '39.99' }
    ]
  },
  {
    handle: 'tile-refinishing-paint-restoration-kit',
    optionName: 'Color',
    variants: [
      { name: 'Pure White (with Brush)', price: '16.99', compareAtPrice: '34.99' },
      { name: 'Modern Gray (with Brush)', price: '16.99', compareAtPrice: '34.99' },
      { name: 'Matte Black (with Brush)', price: '16.99', compareAtPrice: '34.99' }
    ]
  }
];

async function main() {
  const token = getCliToken();
  const shopifyGql = async (query, variables = {}) => {
    const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ query, variables })
    });
    return await res.json();
  };

  for (const cfg of variantConfigs) {
    console.log(`\n========================================`);
    console.log(`Configuring variants for: ${cfg.handle}...`);

    // 1. Fetch product & options
    const pRes = await shopifyGql(`
      query getProd($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
          options {
            id
            name
          }
        }
      }
    `, { handle: cfg.handle });

    const p = pRes?.data?.productByHandle;
    if (!p) {
      console.error(`Product not found: ${cfg.handle}`);
      continue;
    }

    const oldOptions = p.options.map(o => o.id);

    // 2. Add new option with all desired values
    console.log(`Creating option "${cfg.optionName}" with ${cfg.variants.length} values...`);
    const optRes = await shopifyGql(`
      mutation createOpts($productId: ID!, $options: [OptionCreateInput!]!, $variantStrategy: ProductOptionCreateVariantStrategy) {
        productOptionsCreate(productId: $productId, options: $options, variantStrategy: $variantStrategy) {
          userErrors { field message }
          product {
            id
            options { id name values }
          }
        }
      }
    `, {
      productId: p.id,
      options: [
        {
          name: cfg.optionName,
          values: cfg.variants.map(v => ({ name: v.name }))
        }
      ],
      variantStrategy: 'CREATE'
    });

    const optErrors = optRes?.data?.productOptionsCreate?.userErrors || [];
    if (optErrors.length > 0) {
      console.error('Error creating option:', optErrors);
      continue;
    }

    // 3. Delete old default option(s) (e.g. Title)
    if (oldOptions.length > 0) {
      console.log(`Deleting old options: ${oldOptions.join(', ')}...`);
      const delRes = await shopifyGql(`
        mutation delOpts($productId: ID!, $options: [ID!]!) {
          productOptionsDelete(productId: $productId, options: $options) {
            userErrors { field message }
            product {
              id
              variants(first: 20) {
                edges {
                  node {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      `, {
        productId: p.id,
        options: oldOptions
      });

      const delErrors = delRes?.data?.productOptionsDelete?.userErrors || [];
      if (delErrors.length > 0) {
        console.error('Error deleting old option:', delErrors);
      }
    }

    // 4. Fetch updated variants and set prices & inventoryPolicy: CONTINUE
    const updatedPRes = await shopifyGql(`
      query getVariants($handle: String!) {
        productByHandle(handle: $handle) {
          id
          variants(first: 20) {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      }
    `, { handle: cfg.handle });

    const newVariants = updatedPRes?.data?.productByHandle?.variants?.edges?.map(e => e.node) || [];
    console.log(`Found ${newVariants.length} variants on product. Setting pricing and inventory policy...`);

    const priceMap = {};
    for (const v of cfg.variants) {
      priceMap[v.name] = v;
    }

    const bulkUpdateInput = newVariants.map(v => {
      const match = priceMap[v.title];
      return {
        id: v.id,
        price: match?.price || cfg.variants[0].price,
        compareAtPrice: match?.compareAtPrice || cfg.variants[0].compareAtPrice,
        inventoryPolicy: 'CONTINUE'
      };
    });

    const updateRes = await shopifyGql(`
      mutation updateVars($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          userErrors { field message }
          productVariants {
            id
            title
            price
            compareAtPrice
            inventoryPolicy
          }
        }
      }
    `, {
      productId: p.id,
      variants: bulkUpdateInput
    });

    const updateErrors = updateRes?.data?.productVariantsBulkUpdate?.userErrors || [];
    if (updateErrors.length > 0) {
      console.error('Error updating variants:', updateErrors);
    } else {
      console.log(`Successfully configured ${updateRes?.data?.productVariantsBulkUpdate?.productVariants?.length} variants for ${cfg.handle}!`);
    }
  }

  console.log('\n[ALL DONE] All draft variants created and configured with inventoryPolicy: CONTINUE!');
}

main().catch(console.error);

