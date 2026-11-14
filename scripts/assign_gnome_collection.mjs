import { adminGraphql } from './config.mjs';

async function assignGnomeCollection() {
  const productId = "gid://shopify/Product/15650950283635";

  // 1. Ensure collection 'Holiday & Home Living'
  console.log('Checking / creating collection "Holiday & Home Living"...');
  const getColQuery = `
    query getColByHandle($handle: String!) {
      collectionByHandle(handle: $handle) {
        id
        title
        handle
      }
    }
  `;
  const existingRes = await adminGraphql(getColQuery, { handle: 'holiday-and-home-living' });
  let colId;

  if (existingRes.collectionByHandle) {
    colId = existingRes.collectionByHandle.id;
    console.log(`Reusing existing collection: ${colId}`);
  } else {
    const createColQuery = `
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
    `;
    const createRes = await adminGraphql(createColQuery, {
      input: {
        title: 'Holiday & Home Living',
        handle: 'holiday-and-home-living',
        descriptionHtml: '<p>Handcrafted woodland holiday decor, atmospheric illuminated lanterns, and cozy seasonal home accents.</p>',
        templateSuffix: 'showroom',
        sortOrder: 'BEST_SELLING'
      }
    });

    if (createRes.collectionCreate.userErrors?.length > 0) {
      throw new Error(createRes.collectionCreate.userErrors[0].message);
    }
    colId = createRes.collectionCreate.collection.id;
    console.log(`✔ Created collection: ${colId}`);

    // Publish to Online Store
    const pubQuery = `
      query getPubs {
        publications(first: 5) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `;
    const pubs = (await adminGraphql(pubQuery)).publications.edges.map(e => e.node);
    for (const p of pubs) {
      await adminGraphql(`
        mutation pubCol($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            userErrors { field message }
          }
        }
      `, { id: colId, input: [{ publicationId: p.id }] });
    }
    console.log('✔ Published collection to Online Store.');
  }

  // 2. Add product to Holiday & Home Living collection
  console.log('Adding product to Holiday & Home Living...');
  const addQuery = `
    mutation addProd($id: ID!, $productIds: [ID!]!) {
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
  `;
  const addRes1 = await adminGraphql(addQuery, {
    id: colId,
    productIds: [productId]
  });
  console.log('Result 1:', addRes1.collectionAddProducts?.collection || addRes1.collectionAddProducts?.userErrors);

  // 3. Add product to Frontpage collection
  console.log('Adding product to Frontpage (ID: gid://shopify/Collection/708548493683)...');
  const addRes2 = await adminGraphql(addQuery, {
    id: 'gid://shopify/Collection/708548493683',
    productIds: [productId]
  });
  console.log('Result 2:', addRes2.collectionAddProducts?.collection || addRes2.collectionAddProducts?.userErrors);
}

assignGnomeCollection().catch(console.error);

