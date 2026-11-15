import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // 1. Create product
  const createRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        input: {
          title: 'ULTRA™ Delicate Care Intimate Wash Bag',
          descriptionHtml: '<p>Protect your ULTRA OVERNIGHT™ period underwear during machine wash cycles with our ultra-fine micro-mesh protective bag. Keeps bamboo-cotton fibers and multi-layer absorbent seals soft and intact for hundreds of washes.</p>',
          vendor: 'ULTRA OVERNIGHT',
          productType: 'Care Accessories',
          status: 'ACTIVE'
        }
      }
    })
  });

  const createData = await createRes.json();
  console.log('Product create result:', JSON.stringify(createData, null, 2));

  const prod = createData.data?.productCreate?.product;
  if (!prod) {
    console.error('Failed to create product!');
    return;
  }

  const variantId = prod.variants.edges[0]?.node?.id;
  console.log(`Created Product ID: ${prod.id}, Variant ID: ${variantId}`);

  // 2. Update price to $9.99 and compare-at to $16.00
  const updateRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants {
            id
            price
            compareAtPrice
          }
          userErrors {
            field
            message
          }
        }
      }`,
      variables: {
        productId: prod.id,
        variants: [{
          id: variantId,
          price: '9.99',
          compareAtPrice: '16.00',
          inventoryPolicy: 'CONTINUE'
        }]
      }
    })
  });

  const updateData = await updateRes.json();
  console.log('Price update result:', JSON.stringify(updateData, null, 2));

  // 3. Add an image from Shopify files or CDN
  // We can use an existing high quality image or upload one
  const imgRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media {
            ... on MediaImage {
              id
              image { url }
            }
          }
          userErrors { field message }
        }
      }`,
      variables: {
        productId: prod.id,
        media: [{
          originalSource: 'https://cdn.shopify.com/s/files/1/1032/4541/4771/files/M_m_m_i_su_t_dem_Ultra_Overnight.png?v=1794715221',
          alt: 'ULTRA™ Delicate Care Wash Bag',
          mediaContentType: 'IMAGE'
        }]
      }
    })
  });
  console.log('Media result:', JSON.stringify(await imgRes.json(), null, 2));
}

main().catch(console.error);

