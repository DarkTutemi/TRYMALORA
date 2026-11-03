/**
 * TRYMALORA - Automated Reusable Product-to-Collection Classification Engine
 * 
 * Rules:
 * 1. Search existing collections before creating new ones.
 * 2. Reuse appropriate collections to prevent duplicate taxonomies.
 * 3. Create a new collection only when necessary for distinct product lines.
 * 4. Assign 2.5D showroom template (collection.showroom) automatically.
 * 5. Keep unapproved products and collections unpublished (DRAFT state).
 * 6. Never create empty speculative collections.
 */

import { adminGraphql, SHOP } from './config.mjs';

// Predefined taxonomy rules for automated categorization
export const TAXONOMY_RULES = [
  {
    handle: 'interactive-toys',
    title: 'Interactive Toys',
    description: 'Immersive interactive toys, battle blasters, and STEM play systems engineered for active indoor and outdoor excitement.',
    keywords: ['toy', 'blaster', 'laser', 'infrared', 'target', 'projector', 'game', 'interactive', 'stem', 'rc'],
    shelfStyle: 'tech'
  },
  {
    handle: 'acoustic-instruments',
    title: 'Acoustic Instruments',
    description: 'Harmonically tuned alloy steel tongue drums and handcrafted sound therapy instruments.',
    keywords: ['handpan', 'drum', 'rain drum', 'tongue drum', 'sound therapy', 'percussion'],
    shelfStyle: 'wood'
  },
  {
    handle: 'home-and-workshop',
    title: 'Home & Workshop',
    description: 'Industrial-grade equipment and precision home maintenance tools.',
    keywords: ['tool', 'sweeper', 'steam', 'cleaner', 'heater', 'lamp', 'workshop'],
    shelfStyle: 'metal'
  }
];

export async function fetchAllCollections() {
  const data = await adminGraphql(`
    query {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            templateSuffix
            productsCount {
              count
            }
          }
        }
      }
    }
  `);
  return data.collections.edges.map(e => e.node);
}

export async function ensureCollection(rule) {
  const existing = await fetchAllCollections();
  const match = existing.find(c => c.handle === rule.handle || c.title.toLowerCase() === rule.title.toLowerCase());
  
  if (match) {
    console.log(`[Collection Engine] Reusing existing collection '${match.title}' (${match.handle}, ID: ${match.id})`);
    return match;
  }

  console.log(`[Collection Engine] Creating new collection '${rule.title}' (${rule.handle})...`);
  const createRes = await adminGraphql(`
    mutation createCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          title
          handle
          templateSuffix
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
    input: {
      title: rule.title,
      handle: rule.handle,
      descriptionHtml: `<p>${rule.description}</p>`,
      templateSuffix: 'showroom',
      sortOrder: 'BEST_SELLING'
    }
  });

  if (createRes.collectionCreate.userErrors?.length) {
    throw new Error(`Failed to create collection: ${createRes.collectionCreate.userErrors[0].message}`);
  }

  const newCol = createRes.collectionCreate.collection;
  console.log(`[Collection Engine] Successfully created '${newCol.title}' (ID: ${newCol.id})`);
  return newCol;
}

export function matchProductRule(product) {
  const textToSearch = [
    product.title,
    product.productType,
    ...(product.tags || []),
    product.description || ''
  ].join(' ').toLowerCase();

  for (const rule of TAXONOMY_RULES) {
    const matched = rule.keywords.some(kw => textToSearch.includes(kw.toLowerCase()));
    if (matched) return rule;
  }
  return null;
}

export async function assignProductToCollection(productId, collectionId) {
  const assignRes = await adminGraphql(`
    mutation assignProduct($id: ID!, $productIds: [ID!]!) {
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
    productIds: [productId]
  });

  if (assignRes.collectionAddProducts?.userErrors?.length) {
    console.warn(`[Collection Engine] Assignment warning:`, assignRes.collectionAddProducts.userErrors);
  } else {
    console.log(`[Collection Engine] Product assigned to '${assignRes.collectionAddProducts.collection.title}' (Count: ${assignRes.collectionAddProducts.collection.productsCount.count})`);
  }
}

export async function runAutomatedClassification(targetProductId = null) {
  console.log(`\n======================================================`);
  console.log(`TRYMALORA PRODUCT-TO-COLLECTION CLASSIFIER`);
  console.log(`Store: ${SHOP}`);
  console.log(`======================================================\n`);

  let products = [];
  if (targetProductId) {
    const pData = await adminGraphql(`
      query getOne($id: ID!) {
        product(id: $id) {
          id
          title
          handle
          productType
          tags
          status
        }
      }
    `, { id: targetProductId });
    if (pData.product) products = [pData.product];
  } else {
    const pData = await adminGraphql(`
      query getAll {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              productType
              tags
              status
            }
          }
        }
      }
    `);
    products = pData.products.edges.map(e => e.node);
  }

  console.log(`Found ${products.length} product(s) to evaluate.`);

  for (const prod of products) {
    console.log(`\nEvaluating: "${prod.title}" (${prod.id})`);
    console.log(`- Type: ${prod.productType || 'None'}`);
    console.log(`- Tags: ${(prod.tags || []).join(', ') || 'None'}`);
    console.log(`- Status: ${prod.status}`);

    const matchedRule = matchProductRule(prod);
    if (!matchedRule) {
      console.log(`[Skip] No automatic taxonomy rule matched for "${prod.title}". Preventing speculative collection creation.`);
      continue;
    }

    console.log(`[Matched Rule] -> "${matchedRule.title}" (${matchedRule.handle})`);
    const col = await ensureCollection(matchedRule);
    await assignProductToCollection(prod.id, col.id);
  }

  console.log(`\nClassification run completed successfully.\n`);
}

// Allow CLI invocation: node scripts/auto_collection_assign.mjs [productId]
if (process.argv[1]?.endsWith('auto_collection_assign.mjs')) {
  const targetId = process.argv[2] || null;
  runAutomatedClassification(targetId).catch(console.error);
}
