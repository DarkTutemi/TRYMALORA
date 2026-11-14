import { getCliToken } from './config.mjs';

const SHOP = 'ikwh1h-fx.myshopify.com';
const API_VERSION = '2026-10';

async function shopifyGql(query, variables = {}) {
  const token = getCliToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });
  return await res.json();
}

const variantConfigs = [
  {
    handle: 'metallic-silver-anti-rust-renovation-coating',
    optionName: 'Package',
    variants: [
      { name: '1 Can (100g Starter Kit)', price: '19.99', compareAtPrice: '39.99' },
      { name: '2 Cans (Renovation Pack - 10% OFF)', price: '35.99', compareAtPrice: '79.98' },
      { name: '3 Cans (Complete Home Pack - 20% OFF)', price: '47.99', compareAtPrice: '119.97' }
    ]
  },
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
  for (const cfg of variantConfigs) {
    console.log(`\nConfiguring variants for: ${cfg.handle}...`);
    const prodRes = await shopifyGql(`
      query getProd($handle: String!) {
        productByHandle(handle: $handle) {
          id
          title
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
              }
            }
          }
        }
      }
    `, { handle: cfg.handle });

    const p = prodRes?.data?.productByHandle;
    if (!p) {
      console.log('Product not found:', cfg.handle);
      continue;
    }

    const currentOption = p.options[0];
    const defaultVariant = p.variants.edges[0]?.node;

    // 1. Update option name (e.g. from Title to Color or Package)
    console.log(`Current option name: ${currentOption.name}. Updating option name to: ${cfg.optionName}...`);
    await shopifyGql(`
      mutation updateOption($productId: ID!, $id: ID!, $option: OptionUpdateInput!) {
        productOptionUpdate(productId: $productId, id: $id, option: $option) {
          userErrors { field message }
        }
      }
    `, {
      productId: p.id,
      id: currentOption.id,
      option: { name: cfg.optionName }
    });

    // 2. Update default variant option value & price
    const firstVar = cfg.variants[0];
    console.log(`Updating default variant ${defaultVariant.id} to ${firstVar.name} ($${firstVar.price})...`);
    await shopifyGql(`
      mutation updateVar($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          userErrors { field message }
        }
      }
    `, {
      input: {
        id: defaultVariant.id,
        price: firstVar.price,
        compareAtPrice: firstVar.compareAtPrice,
        inventoryPolicy: 'CONTINUE',
        options: [firstVar.name]
      }
    });

    // 3. Create remaining variants
    const remaining = cfg.variants.slice(1);
    if (remaining.length > 0) {
      console.log(`Creating ${remaining.length} additional variants...`);
      const bulkInput = remaining.map(v => ({
        optionValues: [{ optionName: cfg.optionName, name: v.name }],
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        inventoryPolicy: 'CONTINUE'
      }));

      const bulkRes = await shopifyGql(`
        mutation bulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkCreate(productId: $productId, variants: $variants) {
            productVariants {
              id
              title
              price
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        productId: p.id,
        variants: bulkInput
      });

      console.log('Bulk create result:', JSON.stringify(bulkRes?.data?.productVariantsBulkCreate));
    }
  }

  console.log('\n[ALL DONE] Finished configuring all variants!');
}

main().catch(console.error);

