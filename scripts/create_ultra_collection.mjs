import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const ONLINE_STORE_PUB_ID = 'gid://shopify/Publication/366564180339';

async function main() {
  const token = await getAccessToken();
  console.log('--- Creating Collection: ULTRA PERIOD UNDERWEAR COLLECTION ---');

  const payload = {
    custom_collection: {
      title: 'ULTRA PERIOD UNDERWEAR COLLECTION',
      handle: 'ultra-period-underwear',
      body_html: '<p>Explore the complete ULTRA™ Period Underwear Collection. Thoughtfully designed for every body, every flow, and every way you rest. From everyday feminine elegance to complete high-waisted and full-spine leakproof security.</p>',
      published: true,
      collects: [
        { product_id: 15664431104371 }, // Flagship
        { product_id: 15669450244467 }, // ULTRA LACE
        { product_id: 15669450670451 }  // ULTRA COMFORT SHORTS
      ]
    }
  };

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/custom_collections.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.custom_collection) {
    console.error('Failed to create collection:', JSON.stringify(data, null, 2));
    throw new Error('Collection creation failed');
  }

  const coll = data.custom_collection;
  console.log(`✓ Collection Created: ${coll.title} | ID: ${coll.id} | Handle: ${coll.handle}`);

  // Publish to Online Store
  const pubMutation = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        availablePublicationsCount { count }
      }
      userErrors { field message }
    }
  }`;

  await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: pubMutation,
      variables: {
        id: `gid://shopify/Collection/${coll.id}`,
        input: [{ publicationId: ONLINE_STORE_PUB_ID }]
      }
    })
  });
  console.log('✓ Collection published to Online Store');
}

main().catch(console.error);
