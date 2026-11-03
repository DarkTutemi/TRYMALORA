import { adminGraphql } from './config.mjs';

async function addVariants() {
  const productId = 'gid://shopify/Product/15635841057139';

  console.log('Querying current product options...');
  const prodRes = await adminGraphql(`
    query getProd($id: ID!) {
      product(id: $id) {
        id
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
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `, { id: productId });

  console.log('Options:', prodRes.product.options);
  console.log('Variants:', prodRes.product.variants.edges);

  const optionName = prodRes.product.options[0]?.name || 'Package Tier';

  console.log('Creating variants for 2 Sets ($169.99) and 3 Sets ($229.99)...');
  const createRes = await adminGraphql(`
    mutation createVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
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
    productId,
    variants: [
      {
        optionValues: [
          {
            optionName: optionName,
            name: '2 Sets (Duo Team Pack)'
          }
        ],
        price: '169.99'
      },
      {
        optionValues: [
          {
            optionName: optionName,
            name: '3 Sets (Family Arena Pack)'
          }
        ],
        price: '229.99'
      }
    ]
  });

  if (createRes.productVariantsBulkCreate.userErrors?.length) {
    console.error('Errors creating variants:', createRes.productVariantsBulkCreate.userErrors);
  } else {
    console.log('Successfully created variants:', createRes.productVariantsBulkCreate.productVariants);
  }

  // Verify all variants
  const fresh = await adminGraphql(`
    query getFresh($id: ID!) {
      product(id: $id) {
        title
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
            }
          }
        }
      }
    }
  `, { id: productId });

  console.log('All variants now on product:');
  fresh.product.variants.edges.forEach(e => {
    console.log(`- ${e.node.title} (ID: ${e.node.id}): $${e.node.price}`);
  });
}

addVariants().catch(console.error);
