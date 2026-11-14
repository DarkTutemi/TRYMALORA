import { adminGraphql, getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';

async function seedGnome() {
  console.log('--- 1. CHECK EXISTING PRODUCT ---');
  const checkQuery = `
    query getProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        id
        title
        handle
        status
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              compareAtPrice
            }
          }
        }
      }
    }
  `;

  const existingRes = await adminGraphql(checkQuery, { handle: 'christmas-lantern-welcome-gnome' });
  let product = existingRes.productByHandle;
  let productId;

  const harvested = JSON.parse(fs.readFileSync('data/gnome_harvested.json', 'utf8')).product;

  if (product) {
    console.log(`Product already exists: ${product.id}`);
    productId = product.id;
  } else {
    console.log('Creating new product on Shopify via GraphQL...');
    const createQuery = `
      mutation createProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const createInput = {
      title: harvested.title,
      handle: harvested.handle,
      descriptionHtml: harvested.body_html,
      vendor: 'TRYMALORA',
      productType: 'Holiday & Home Decor',
      tags: harvested.tags,
      status: 'ACTIVE'
    };

    const createRes = await adminGraphql(createQuery, { input: createInput });
    if (createRes.productCreate?.userErrors?.length > 0) {
      throw new Error(createRes.productCreate.userErrors.map(e => e.message).join(', '));
    }
    productId = createRes.productCreate.product.id;
    console.log(`✔ Created product: ${productId}`);
  }

  // 2. Upload Images
  console.log('\n--- 2. UPLOADING MEDIA IMAGES ---');
  // Check existing media
  const mediaQuery = `
    query getProductMedia($id: ID!) {
      product(id: $id) {
        media(first: 20) {
          edges {
            node {
              id
              mediaContentType
              status
            }
          }
        }
      }
    }
  `;
  const mediaRes = await adminGraphql(mediaQuery, { id: productId });
  const existingMediaCount = mediaRes.product.media.edges.length;
  console.log(`Existing media items: ${existingMediaCount}`);

  if (existingMediaCount < harvested.images.length) {
    console.log('Uploading images from harvested URLs...');
    const createMediaQuery = `
      mutation createMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media {
            id
            status
          }
          mediaUserErrors {
            field
            message
          }
        }
      }
    `;

    const mediaInputs = harvested.images.map(img => ({
      originalSource: img.src,
      alt: img.alt,
      mediaContentType: 'IMAGE'
    }));

    const uploadRes = await adminGraphql(createMediaQuery, {
      productId,
      media: mediaInputs
    });

    if (uploadRes.productCreateMedia?.mediaUserErrors?.length > 0) {
      console.warn('Media upload errors:', uploadRes.productCreateMedia.mediaUserErrors);
    } else {
      console.log(`✔ Uploaded ${uploadRes.productCreateMedia.media.length} media images!`);
    }
  }

  // 3. Configure Variants & Options
  console.log('\n--- 3. CONFIGURING BUNDLE VARIANTS ---');
  const prodDetailQuery = `
    query getProdDetail($id: ID!) {
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
              compareAtPrice
            }
          }
        }
      }
    }
  `;
  const detailRes = await adminGraphql(prodDetailQuery, { id: productId });
  const currentVariants = detailRes.product.variants.edges.map(e => e.node);
  console.log('Current variants count:', currentVariants.length);

  // If only 1 default variant, update it to Tier 1 and bulk create Tier 2 & Tier 3
  const defaultVar = currentVariants[0];
  const optionName = detailRes.product.options[0]?.name || 'Title';

  // Update product option name to "Package Tier" if it is 'Title'
  if (detailRes.product.options[0]?.name === 'Title') {
    console.log('Updating option name to "Package Tier"...');
    const updateOptionQuery = `
      mutation updateOption($productId: ID!, $options: [OptionUpdateInput!]!) {
        productOptionsUpdate(productId: $productId, options: $options) {
          userErrors {
            field
            message
          }
        }
      }
    `;
    try {
      await adminGraphql(updateOptionQuery, {
        productId,
        options: [{ id: detailRes.product.options[0].id, name: 'Package Tier' }]
      });
      console.log('✔ Option name updated to "Package Tier".');
    } catch (e) {
      console.warn('Option update warning:', e.message);
    }
  }

  // Update default variant (Tier 1)
  console.log('Updating Variant 1 (Single Gnome)...');
  const updateVarQuery = `
    mutation updateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          price
          compareAtPrice
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const v1UpdateRes = await adminGraphql(updateVarQuery, {
    productId,
    variants: [{
      id: defaultVar.id,
      price: '69.99',
      compareAtPrice: '139.98',
      optionValues: [{
        optionName: 'Package Tier',
        name: '1x Christmas Lantern Welcome Gnome (Single)'
      }]
    }]
  });

  if (v1UpdateRes.productVariantsBulkUpdate?.userErrors?.length > 0) {
    console.warn('Variant 1 update note:', v1UpdateRes.productVariantsBulkUpdate.userErrors);
  } else {
    console.log('✔ Variant 1 updated to $69.99 (Compare $139.98)');
  }

  // Check if Tier 2 & Tier 3 already exist
  const recheckRes = await adminGraphql(prodDetailQuery, { id: productId });
  const updatedVars = recheckRes.product.variants.edges.map(e => e.node);

  if (updatedVars.length < 3) {
    console.log('Creating Tier 2 and Tier 3 bundle variants...');
    const bulkCreateQuery = `
      mutation createVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkCreate(productId: $productId, variants: $variants) {
          productVariants {
            id
            title
            price
            compareAtPrice
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const bulkCreateRes = await adminGraphql(bulkCreateQuery, {
      productId,
      variants: [
        {
          price: '119.98',
          compareAtPrice: '279.96',
          optionValues: [
            {
              optionName: 'Package Tier',
              name: '2x Woodland Duo Set (Buy 2 & Save $160)'
            }
          ]
        },
        {
          price: '159.98',
          compareAtPrice: '419.94',
          optionValues: [
            {
              optionName: 'Package Tier',
              name: '3x Holiday Family Trio (Best Value + Free Gift Box)'
            }
          ]
        }
      ]
    });

    if (bulkCreateRes.productVariantsBulkCreate?.userErrors?.length > 0) {
      console.warn('Variants bulk create note:', bulkCreateRes.productVariantsBulkCreate.userErrors);
    } else {
      console.log('✔ Variants bulk created successfully!');
    }
  }

  // 4. Final Verification
  const finalCheckRes = await adminGraphql(prodDetailQuery, { id: productId });
  console.log('\n====================================================');
  console.log('🎉 PRODUCT SEEDING COMPLETED SUCCESSFULLY!');
  console.log('Product ID:', productId);
  console.log('Variants:');
  for (const edge of finalCheckRes.product.variants.edges) {
    console.log(`- [${edge.node.id}] ${edge.node.title}: $${edge.node.price} (Compare: $${edge.node.compareAtPrice})`);
  }
  console.log('====================================================');

  // Save variant details to data/gnome_created_variants.json
  fs.writeFileSync('data/gnome_created_variants.json', JSON.stringify({
    productId,
    variants: finalCheckRes.product.variants.edges.map(e => e.node)
  }, null, 2));
}

seedGnome().catch(e => {
  console.error('❌ Seeding failed:', e);
  process.exit(1);
});

