import { adminGraphql, getAccessToken, SHOP, API_VERSION, THEME_ID } from './config.mjs';
import fs from 'fs';

async function createUpsell() {
  console.log('--- 1. UPLOAD IMAGE TO THEME ASSET API ---');
  const token = await getAccessToken(true);
  const imgBuffer = fs.readFileSync('assets/trymalora_jeweled_ornaments_set.png');
  const base64 = imgBuffer.toString('base64');

  const assetKey = 'assets/trymalora_jeweled_ornaments_set.png';
  const putUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json`;

  const assetRes = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      asset: {
        key: assetKey,
        attachment: base64
      }
    })
  });

  const assetData = await assetRes.json();
  if (!assetData.asset) {
    console.error('Failed to upload asset:', assetData);
    throw new Error('Asset upload failed');
  }
  const publicAssetUrl = assetData.asset.public_url;
  console.log('✔ Asset uploaded to theme! Public URL:', publicAssetUrl);

  // 2. CREATE PRODUCT ON SHOPIFY VIA GRAPHQL
  console.log('\n--- 2. CREATE PRODUCT ON SHOPIFY ---');
  const title = 'Artisan Starlight Pearl & Crystal Mosaic Christmas Ornaments (6-Piece Heirloom Set)';
  const handle = 'artisan-starlight-pearl-crystal-christmas-ornaments-set';
  const price = '25.99';
  const compareAtPrice = '52.00';

  const descHtml = `
    <p>Adorn your holiday tree with the timeless radiance of the <strong>Artisan Starlight Pearl &amp; Crystal Mosaic Ornaments</strong>. Handcrafted with meticulous artistry, each circular wooden medallion features an intricate, raised mosaic pattern of shimmering royal blue crystals, luminous baroque faux pearls, and brilliant winter starlight snowflakes.</p>
    <h3>What Makes Them Special:</h3>
    <ul>
      <li><strong>6 Unique Heirloom Designs:</strong> Includes 6 distinct celestial mandala and winter starlight patterns in deep sapphire, royal amethyst, and shimmering celestial blue.</li>
      <li><strong>Dual-Sided Tactile Craftsmanship:</strong> Hand-set resin crystals, iridescent pearls, and natural wooden core with smooth lacquered edges.</li>
      <li><strong>Golden Satin Hanging Cords:</strong> Pre-attached shimmering gold hanging loops ready for immediate tree, garland, or wreath display.</li>
      <li><strong>The Perfect Holiday Gift:</strong> Arrives nestled in an elegant protective Trymalora gift box, perfect for family keepsakes or hostess gifts.</li>
    </ul>
  `;

  // Check if exists
  const checkRes = await adminGraphql(`
    query getByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        variants(first: 5) {
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
  `, { handle });

  let productId;
  let variantId;

  if (checkRes.productByHandle) {
    productId = checkRes.productByHandle.id;
    variantId = checkRes.productByHandle.variants.edges[0]?.node?.id;
    console.log(`Product already exists: ${productId}, variantId: ${variantId}`);
  } else {
    const createRes = await adminGraphql(`
      mutation createProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 5) {
              edges {
                node {
                  id
                  price
                }
              }
            }
          }
          userErrors { field message }
        }
      }
    `, {
      input: {
        title,
        handle,
        descriptionHtml: descHtml,
        vendor: 'TRYMALORA',
        productType: 'Holiday Decor & Ornaments',
        tags: ['Christmas', 'Ornaments', 'Holiday', 'Handcrafted', 'Heirloom', 'Jeweled', 'Upsell'],
        status: 'ACTIVE'
      }
    });

    if (createRes.productCreate?.userErrors?.length) {
      throw new Error(createRes.productCreate.userErrors.map(e => e.message).join(', '));
    }

    productId = createRes.productCreate.product.id;
    console.log(`✔ Created product: ${productId}`);

    // Update variant price & compare price
    console.log('Setting price and options...');
    const setRes = await adminGraphql(`
      mutation setVariants($input: ProductSetInput!) {
        productSet(input: $input) {
          product {
            id
            variants(first: 5) {
              edges {
                node {
                  id
                  price
                  compareAtPrice
                }
              }
            }
          }
          userErrors { field message }
        }
      }
    `, {
      input: {
        id: productId,
        productOptions: [{ name: 'Title', values: [{ name: 'Default Title' }] }],
        variants: [{
          price,
          compareAtPrice,
          inventoryPolicy: 'CONTINUE',
          optionValues: [{ optionName: 'Title', name: 'Default Title' }]
        }]
      }
    });

    variantId = setRes.productSet.product.variants.edges[0]?.node?.id;
    console.log(`✔ Variant set: ${variantId} at $${price} (Compare: $${compareAtPrice})`);

    // Attach image
    console.log('Attaching image...');
    await adminGraphql(`
      mutation addMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id status }
          mediaUserErrors { field message }
        }
      }
    `, {
      productId,
      media: [{
        originalSource: publicAssetUrl,
        alt: title,
        mediaContentType: 'IMAGE'
      }]
    });
    console.log('✔ Image attached to product media!');

    // Publish to Online Store
    const pubs = (await adminGraphql(`
      query getPubs {
        publications(first: 5) {
          edges { node { id name } }
        }
      }
    `)).publications.edges.map(e => e.node);

    for (const pub of pubs) {
      await adminGraphql(`
        mutation pub($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            userErrors { field message }
          }
        }
      `, { id: productId, input: [{ publicationId: pub.id }] });
    }
    console.log('✔ Published to all sales channels!');
  }

  // Save info
  const numericVariantId = variantId.replace('gid://shopify/ProductVariant/', '');
  console.log('\n======================================================');
  console.log('🎉 UPSELL PRODUCT READY:');
  console.log('Product ID:', productId);
  console.log('Variant ID:', variantId);
  console.log('Numeric Variant ID:', numericVariantId);
  console.log('Public Asset Image URL:', publicAssetUrl);
  console.log('Price:', price);
  console.log('Compare-at Price:', compareAtPrice);
  console.log('======================================================');

  fs.writeFileSync('data/upsell_ornaments.json', JSON.stringify({
    productId,
    variantId,
    numericVariantId,
    title,
    handle,
    price: 25.99,
    priceCents: 2599,
    compareAtPrice: 52.00,
    compareCents: 5200,
    publicAssetUrl
  }, null, 2));
}

createUpsell().catch(console.error);

