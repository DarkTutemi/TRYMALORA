import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const PRODUCT_ID = 'gid://shopify/Product/15664431104371';
const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

async function main() {
  const token = await getAccessToken();

  // 1. Fetch current variants
  const getQuery = `
    query getProduct($id: ID!) {
      product(id: $id) {
        id
        options {
          id
          name
          values
        }
        variants(first: 100) {
          nodes {
            id
            title
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  `;

  const fetchRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: getQuery, variables: { id: PRODUCT_ID } })
  });

  const fetchJson = await fetchRes.json();
  const currentVariants = fetchJson.data.product.variants.nodes;
  console.log('Current variants count:', currentVariants.length);

  // Group into Plum Noir and Blush Rose
  const plumVariants = currentVariants.filter(v => v.selectedOptions.some(o => o.name === 'Color' && o.value === 'Plum Noir'));
  const blushVariants = currentVariants.filter(v => v.selectedOptions.some(o => o.name === 'Color' && o.value === 'Blush Rose'));

  console.log(`Plum variants: ${plumVariants.length}, Blush variants: ${blushVariants.length}`);

  // 2. Prepare update payload:
  // Plum Noir -> Black
  // Blush Rose -> Orange
  const updatePayload = [];

  for (const v of plumVariants) {
    const sizeOpt = v.selectedOptions.find(o => o.name === 'Size').value;
    updatePayload.push({
      id: v.id,
      price: '39.99',
      compareAtPrice: '79.98',
      optionValues: [
        { optionName: 'Size', name: sizeOpt },
        { optionName: 'Color', name: 'Black' }
      ]
    });
  }

  for (const v of blushVariants) {
    const sizeOpt = v.selectedOptions.find(o => o.name === 'Size').value;
    updatePayload.push({
      id: v.id,
      price: '39.99',
      compareAtPrice: '79.98',
      optionValues: [
        { optionName: 'Size', name: sizeOpt },
        { optionName: 'Color', name: 'Orange' }
      ]
    });
  }

  console.log('Executing productVariantsBulkUpdate for Black & Orange...');
  const updateMutation = `
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors {
          field
          message
        }
        productVariants {
          id
          title
        }
      }
    }
  `;

  const updateRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: updateMutation,
      variables: {
        productId: PRODUCT_ID,
        variants: updatePayload
      }
    })
  });

  const updateJson = await updateRes.json();
  console.log('Update result userErrors:', updateJson.data?.productVariantsBulkUpdate?.userErrors);
  console.log('Updated variants count:', updateJson.data?.productVariantsBulkUpdate?.productVariants?.length);

  // 3. Create variants for Red and Nude
  const createPayload = [];

  for (const size of SIZES) {
    createPayload.push({
      price: '39.99',
      compareAtPrice: '79.98',
      inventoryPolicy: 'CONTINUE',
      optionValues: [
        { optionName: 'Size', name: size },
        { optionName: 'Color', name: 'Red' }
      ]
    });
  }

  for (const size of SIZES) {
    createPayload.push({
      price: '39.99',
      compareAtPrice: '79.98',
      inventoryPolicy: 'CONTINUE',
      optionValues: [
        { optionName: 'Size', name: size },
        { optionName: 'Color', name: 'Nude' }
      ]
    });
  }

  console.log('Executing productVariantsBulkCreate for Red & Nude (16 variants)...');
  const createMutation = `
    mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkCreate(productId: $productId, variants: $variants) {
        userErrors {
          field
          message
        }
        productVariants {
          id
          title
        }
      }
    }
  `;

  const createRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      query: createMutation,
      variables: {
        productId: PRODUCT_ID,
        variants: createPayload
      }
    })
  });

  const createJson = await createRes.json();
  console.log('Create result userErrors:', createJson.data?.productVariantsBulkCreate?.userErrors);
  console.log('Created variants count:', createJson.data?.productVariantsBulkCreate?.productVariants?.length);

  // 4. Verify Final Product Variants
  const verifyRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: getQuery, variables: { id: PRODUCT_ID } })
  });
  const verifyJson = await verifyRes.json();
  const finalProduct = verifyJson.data.product;
  console.log('\n=== FINAL VERIFICATION ===');
  console.log('Options:', JSON.stringify(finalProduct.options, null, 2));
  console.log('Total Variants:', finalProduct.variants.nodes.length);
  console.log('Variant Titles:', finalProduct.variants.nodes.map(v => v.title));
}

main().catch(console.error);
