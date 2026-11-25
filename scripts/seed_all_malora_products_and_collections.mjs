import fs from 'fs';
import { getAccessToken, SHOP, adminGraphql } from './config.mjs';

const PUBLICATION_ID = 'gid://shopify/Publication/366564180339';

async function seedAll() {
  const token = await getAccessToken();
  const catalog = JSON.parse(fs.readFileSync('scripts/malora_catalog_prepared.json', 'utf8'));
  const collectionsData = JSON.parse(fs.readFileSync('scripts/malora_collections_prepared.json', 'utf8'));

  console.log(`=== SEEDING ${catalog.length} PRODUCTS ===`);
  const createdProducts = {};

  for (let i = 0; i < catalog.length; i++) {
    const item = catalog[i];
    console.log(`[${i + 1}/${catalog.length}] Processing product: ${item.title} (${item.handle})...`);

    // Check if product already exists by handle
    const checkRes = await fetch(`https://${SHOP}/admin/api/2024-01/products.json?handle=${item.handle}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const checkData = await checkRes.json();
    let productId = null;

    if (checkData.products && checkData.products.length > 0) {
      productId = checkData.products[0].id;
      console.log(`  -> Already exists with ID ${productId}`);
      createdProducts[item.handle] = productId;
    } else {
      const payload = {
        product: {
          title: item.title,
          handle: item.handle,
          body_html: item.body_html,
          vendor: 'Malora Organics',
          product_type: item.product_type,
          tags: item.tags.join(', '),
          status: 'active',
          options: item.options.map(o => ({ name: o.name, values: o.values })),
          variants: item.variants.map(v => ({
            option1: v.options[0] || null,
            option2: v.options[1] || null,
            option3: v.options[2] || null,
            price: v.price,
            compare_at_price: v.compare_at_price || null,
            sku: v.sku
          })),
          images: item.images.map(img => ({ src: img.src, alt: img.alt }))
        }
      };

      const createRes = await fetch(`https://${SHOP}/admin/api/2024-01/products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
        },
        body: JSON.stringify(payload)
      });
      const createData = await createRes.json();

      if (createData.product) {
        productId = createData.product.id;
        console.log(`  -> CREATED successfully with ID ${productId} (${createData.product.variants.length} variants, ${createData.product.images.length} images)`);
        createdProducts[item.handle] = productId;
      } else {
        console.error(`  -> ERROR creating product:`, JSON.stringify(createData));
      }
    }

    // Publish to Online Store
    if (productId) {
      try {
        await adminGraphql(`
          mutation publishProduct($id: ID!, $input: [PublicationInput!]!) {
            publishablePublish(id: $id, input: $input) {
              publishable {
                availablePublicationCount
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          id: `gid://shopify/Product/${productId}`,
          input: [{ publicationId: PUBLICATION_ID }]
        });
      } catch (e) {
        // ignore publish errors if already published
      }
    }

    // Brief delay to be polite with rate limits
    await new Promise(r => setTimeout(r, 600));
  }

  console.log(`\n=== SEEDING ${collectionsData.length} COLLECTIONS ===`);
  const createdCollections = {};

  for (let i = 0; i < collectionsData.length; i++) {
    const col = collectionsData[i];
    console.log(`[${i + 1}/${collectionsData.length}] Processing collection: ${col.title} (${col.handle})...`);

    // Check if custom collection exists
    const checkRes = await fetch(`https://${SHOP}/admin/api/2024-01/custom_collections.json?handle=${col.handle}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    const checkData = await checkRes.json();
    let colId = null;

    if (checkData.custom_collections && checkData.custom_collections.length > 0) {
      colId = checkData.custom_collections[0].id;
      console.log(`  -> Already exists with ID ${colId}`);
      createdCollections[col.handle] = colId;
    } else {
      const payload = {
        custom_collection: {
          title: col.title,
          handle: col.handle,
          body_html: col.body_html,
          published: true,
          image: col.image ? { src: col.image.src, alt: col.image.alt } : null
        }
      };

      const createRes = await fetch(`https://${SHOP}/admin/api/2024-01/custom_collections.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': token
        },
        body: JSON.stringify(payload)
      });
      const createData = await createRes.json();

      if (createData.custom_collection) {
        colId = createData.custom_collection.id;
        console.log(`  -> CREATED collection with ID ${colId}`);
        createdCollections[col.handle] = colId;
      } else {
        console.error(`  -> ERROR creating collection:`, JSON.stringify(createData));
      }
    }

    // Link relevant products to collection
    if (colId) {
      // Find matching products
      const matchingProductIds = [];
      const handleLower = col.handle.toLowerCase();

      for (const item of catalog) {
        const pId = createdProducts[item.handle];
        if (!pId) continue;

        const titleLower = item.title.toLowerCase();
        const tagsLower = item.tags.map(t => t.toLowerCase());

        let matches = false;
        if (handleLower === 'our-best-sellers' && tagsLower.includes('best sellers')) matches = true;
        else if (handleLower === 'sleep-products' && (tagsLower.includes('sleep') || titleLower.includes('sleep') || titleLower.includes('bedtime') || titleLower.includes('pillow'))) matches = true;
        else if (handleLower === 'organic-pregnancy-products' && (tagsLower.includes('pregnancy') || titleLower.includes('pregnancy') || titleLower.includes('belly') || titleLower.includes('lotion'))) matches = true;
        else if (handleLower === 'stretch-marks' || handleLower === 'stretch-mark-products' || handleLower === 'stretch-mark-bundle' || handleLower === 'stretch-mark-cream' || handleLower === 'stretch-mark-oil' || handleLower === 'stretch-mark-belly-butter') {
          if (tagsLower.includes('stretch marks') || titleLower.includes('stretch mark') || titleLower.includes('belly')) matches = true;
        }
        else if (handleLower === 'baby' && (tagsLower.includes('baby') || titleLower.includes('baby') || titleLower.includes('junior'))) matches = true;
        else if (handleLower === 'bundle' && (titleLower.includes('bundle') || titleLower.includes('kit'))) matches = true;
        else if (handleLower === 'body' && (titleLower.includes('lotion') || titleLower.includes('rub') || titleLower.includes('balm') || titleLower.includes('wash'))) matches = true;
        else if (handleLower === 'bath-products' && (titleLower.includes('wash') || titleLower.includes('bath'))) matches = true;
        else if (handleLower === 'skin' || handleLower === 'face') {
          if (titleLower.includes('serum') || titleLower.includes('barrier') || titleLower.includes('lip') || titleLower.includes('balm')) matches = true;
        }

        if (matches) matchingProductIds.push(pId);
      }

      // If no specific match, add sleepylotion and best sellers as default
      if (matchingProductIds.length === 0) {
        if (createdProducts['sleepylotion']) matchingProductIds.push(createdProducts['sleepylotion']);
      }

      console.log(`  -> Linking ${matchingProductIds.length} products to collection ${col.title}...`);
      for (const prodId of matchingProductIds) {
        try {
          await fetch(`https://${SHOP}/admin/api/2024-01/collects.json`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Access-Token': token
            },
            body: JSON.stringify({
              collect: {
                collection_id: colId,
                product_id: prodId
              }
            })
          });
        } catch (e) {
          // ignore duplicate collects
        }
      }
    }

    await new Promise(r => setTimeout(r, 600));
  }

  console.log('=== ALL PRODUCTS & COLLECTIONS SEEDED AND LINKED! ===');
}

seedAll().catch(console.error);
