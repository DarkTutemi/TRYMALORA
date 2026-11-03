import { adminGraphql, SHOP } from './config.mjs';

async function main() {
  console.log(`Checking store status for: ${SHOP}`);

  // 1. Check or Create Collection: Interactive Toys
  let collectionId = null;
  const colRes = await adminGraphql(`
    query {
      collections(first: 20) {
        edges {
          node {
            id
            title
            handle
            templateSuffix
          }
        }
      }
    }
  `);

  const existingCol = colRes.collections.edges.find(e => e.node.handle === 'interactive-toys');
  if (existingCol) {
    console.log(`Found existing collection: ${existingCol.node.title} (${existingCol.node.id})`);
    collectionId = existingCol.node.id;
  } else {
    console.log('Creating collection: Interactive Toys (interactive-toys)...');
    const createColRes = await adminGraphql(`
      mutation createCol($input: CollectionInput!) {
        collectionCreate(input: $input) {
          collection {
            id
            title
            handle
            templateSuffix
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      input: {
        title: 'Interactive Toys',
        handle: 'interactive-toys',
        descriptionHtml: '<p>Immersive interactive toys, battle blasters, and STEM play systems engineered for active indoor and outdoor excitement.</p>',
        templateSuffix: 'showroom',
        sortOrder: 'BEST_SELLING'
      }
    });

    if (createColRes.collectionCreate.userErrors?.length) {
      console.error('Errors creating collection:', createColRes.collectionCreate.userErrors);
      throw new Error(createColRes.collectionCreate.userErrors[0].message);
    }
    collectionId = createColRes.collectionCreate.collection.id;
    console.log(`Created collection: Interactive Toys with ID ${collectionId}`);
  }

  // 2. Check if product already exists
  const prodRes = await adminGraphql(`
    query {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            status
            templateSuffix
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
      }
    }
  `);

  const existingProd = prodRes.products.edges.find(e => e.node.handle === 'kids-infrared-battle-blaster-set-with-target-projector');
  if (existingProd) {
    console.log(`Product already exists: ${existingProd.node.title} (${existingProd.node.id})`);
    console.log(`Status: ${existingProd.node.status}`);
    console.log(`Template: ${existingProd.node.templateSuffix}`);
    console.log(`Variants:`, existingProd.node.variants.edges.map(v => `${v.node.title}: $${v.node.price}`));
    return;
  }

  // 3. Prepare product data
  const descriptionHtml = `
<div class="zv-product-desc-content">
  <p class="zv-lead">Transform any living space into an energetic, screen-free action arena. The Kids Infrared Battle Blaster Set combines interactive wall-target projection with tactical multiplayer team battle modes, featuring responsive sound effects, hit-sensing LED health meters, and safe optical infrared play.</p>

  <h3>Key Features</h3>
  <ul>
    <li><strong>Dual Play Modes:</strong> Switch seamlessly between Solo Wall-Target Practice (dynamic projected targets) and Multiplayer Team Battle (up to 4 teams).</li>
    <li><strong>Optical Infrared Technology:</strong> Emits safe, invisible infrared signals with zero physical projectiles and no high-powered lasers.</li>
    <li><strong>Tactical Sensory Feedback:</strong> Integrated vibration motors and dynamic sound effects trigger with each shot and hit.</li>
    <li><strong>LED Health Indicators:</strong> Visual life bars display remaining health points in real time.</li>
    <li><strong>Ergonomic Lightweight Build:</strong> Molded from durable impact-resistant ABS plastic, built for active play.</li>
  </ul>

  <h3>What's in the Box</h3>
  <ul>
    <li>2 × Infrared Tactical Mini Blasters</li>
    <li>1 × 180° Dynamic Target Projector</li>
    <li>Dynamic Target Slide Discs</li>
    <li>1 × Game Rules & Quick-Start Manual</li>
  </ul>

  <h3>Important Battery Notice</h3>
  <p><strong>Batteries Not Included.</strong> Blasters require 4 × 1.5V AAA batteries (2 per blaster). Target Projector requires 3 × 1.5V AA batteries.</p>

  <h3>Technical Specifications</h3>
  <ul>
    <li><strong>Recommended Age:</strong> 6 years and older</li>
    <li><strong>Material:</strong> Impact-resistant non-toxic ABS polymer</li>
    <li><strong>Signal System:</strong> Invisible optical infrared sensor</li>
    <li><strong>Effective Indoor Range:</strong> Up to 15–30 ft (depending on ambient lighting)</li>
  </ul>
</div>
  `.trim();

  const images = [
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173020_6c8c1c4cf7d711cdd5a4d6aa91290eb2_e583f568-e0e8-4c22-9785-6dc4d0eb727b.jpg',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173020_95469ec9ffbf4d73ac184b9e30d7d3ee_356f56e5-46d7-4421-8be1-d7f82d6241f0.png',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173020_94e0edf9f1023e1489161d1b3218329e_57ef72a8-8ded-4354-b4fd-8dfd4995b2d2.png',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173021_e96c06fafc655ed1c5a79a0092569a05_bad627ce-b9fb-4776-a2d7-d7b05627f978.png',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173021_862c2dbbf724bdf5df0e5e1d41358221_bf119adc-cdd4-4354-9562-5d9331655a01.jpg',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173021_2ea8000740ee44a3bd5efaf5393b4a39_9a3d2c37-afea-4c82-9305-1162ca8663bf.jpg',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173021_1ae607e790df26dd182b167eb599a1e4_75187355-b515-479c-b765-d8223db49fa6.jpg',
    'https://ashbtop.com/cdn/shop/files/spp_shopify20261028173021_588fee46bf68527523c0d33e6b852371_98183249-26c5-4eea-9bfd-bdc67299f0ff.jpg'
  ];

  console.log('Creating Product as DRAFT...');
  const createProdRes = await adminGraphql(`
    mutation createProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
      productCreate(input: $input, media: $media) {
        product {
          id
          title
          handle
          status
          templateSuffix
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
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: {
      title: 'Kids Infrared Battle Blaster Set with Target Projector',
      handle: 'kids-infrared-battle-blaster-set-with-target-projector',
      descriptionHtml: descriptionHtml,
      status: 'DRAFT',
      templateSuffix: 'v2',
      productType: 'Interactive Toys',
      vendor: 'TRYMALORA',
      tags: ['Interactive Toys', 'STEM', 'Battle Blaster', 'Target Projector', 'Infrared']
    },
    media: images.map(url => ({
      originalSource: url,
      mediaContentType: 'IMAGE'
    }))
  });

  if (createProdRes.productCreate.userErrors?.length) {
    console.error('Errors creating product:', createProdRes.productCreate.userErrors);
    throw new Error(createProdRes.productCreate.userErrors[0].message);
  }

  const createdProduct = createProdRes.productCreate.product;
  console.log(`Product created successfully! ID: ${createdProduct.id}`);

  // 4. Update variants to create 3 bundle tiers
  // In modern Shopify Admin, we use productVariantsBulkUpdate or productVariantsBulkCreate
  // First, check the default variant created:
  const defaultVariantId = createdProduct.variants.edges[0]?.node?.id;
  console.log(`Default variant ID: ${defaultVariantId}`);

  // We want 3 variants:
  // 1 Set ($99.99)
  // 2 Sets ($169.99)
  // 3 Sets ($229.99)
  // Let's create the Bundle Option
  try {
    console.log('Configuring Bundle Tiers via productOptionsCreate or productVariantsBulkCreate...');
    // Add Option: "Package Tier"
    const optRes = await adminGraphql(`
      mutation createOption($productId: ID!, $options: [OptionCreateInput!]!) {
        productOptionsCreate(productId: $productId, options: $options) {
          product {
            id
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
          userErrors {
            field
            message
          }
        }
      }
    `, {
      productId: createdProduct.id,
      options: [
        {
          name: 'Package Tier',
          values: [
            { name: '1 Set (Starter Battle Pack)' },
            { name: '2 Sets (Duo Team Pack)' },
            { name: '3 Sets (Family Arena Pack)' }
          ]
        }
      ]
    });
    console.log('Options created:', JSON.stringify(optRes, null, 2));
  } catch (err) {
    console.warn('Option create notice:', err.message);
  }

  // Query updated variants
  const freshProd = await adminGraphql(`
    query getProd($id: ID!) {
      product(id: $id) {
        id
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
  `, { id: createdProduct.id });

  const currentVariants = freshProd.product.variants.edges;
  console.log('Current variants:', currentVariants.map(v => `${v.node.title} (${v.node.id}): $${v.node.price}`));

  // If only 1 variant exists, update its price to $99.99 and create 2 additional variants
  if (currentVariants.length === 1) {
    console.log('Updating single variant price to 99.99...');
    await adminGraphql(`
      mutation updateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
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
      productId: createdProduct.id,
      variants: [
        {
          id: currentVariants[0].node.id,
          price: '99.99'
        }
      ]
    });
  } else {
    // We have multiple variants, update their prices according to tiers
    const variantUpdates = [];
    for (const edge of currentVariants) {
      const title = edge.node.title;
      let price = '99.99';
      if (title.includes('2 Set') || title.includes('Duo')) price = '169.99';
      else if (title.includes('3 Set') || title.includes('Family')) price = '229.99';
      variantUpdates.push({
        id: edge.node.id,
        price
      });
    }

    console.log('Updating variant prices:', variantUpdates);
    await adminGraphql(`
      mutation updateVariants($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
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
      productId: createdProduct.id,
      variants: variantUpdates
    });
  }

  // 5. Assign Product to Collection: Interactive Toys
  console.log(`Assigning Product ${createdProduct.id} to Collection ${collectionId}...`);
  const assignRes = await adminGraphql(`
    mutation assignToCollection($id: ID!, $productIds: [ID!]!) {
      collectionAddProducts(id: $id, productIds: $productIds) {
        collection {
          id
          title
          productsCount {
            count
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    id: collectionId,
    productIds: [createdProduct.id]
  });

  if (assignRes.collectionAddProducts?.userErrors?.length) {
    console.error('Error assigning to collection:', assignRes.collectionAddProducts.userErrors);
  } else {
    console.log(`Successfully assigned product to ${assignRes.collectionAddProducts.collection.title}! Total products: ${assignRes.collectionAddProducts.collection.productsCount.count}`);
  }

  console.log('\n--- FIRST PRODUCT CREATION COMPLETE ---');
  console.log(`Product ID: ${createdProduct.id}`);
  console.log(`Product Handle: ${createdProduct.handle}`);
  console.log(`Product Status: ${createdProduct.status}`);
  console.log(`Collection: Interactive Toys (${collectionId})`);
  console.log(`Direct Preview URL: https://${SHOP}/products/${createdProduct.handle}?preview_theme_id=197111906675`);
  console.log(`Local Dev URL: http://127.0.0.1:9292/products/${createdProduct.handle}`);
}

main().catch(console.error);
