import { getCliToken } from './config.mjs';

const products = [
  { name: 'Metallic Silver Anti-Rust Renovation Coating', id: 'gid://shopify/Product/15636321403251' },
  { name: 'Car Metal Rust Repair Paste', id: 'gid://shopify/Product/15636321468787' },
  { name: 'Metal Chrome Polish & Restorer Paste', id: 'gid://shopify/Product/15636321567091' },
  { name: 'Mini Dual-Purpose Travel Styling Iron', id: 'gid://shopify/Product/15636321599859' },
  { name: 'Tile Refinishing Paint Restoration Kit', id: 'gid://shopify/Product/15636321698163' }
];

async function publishAllChannels() {
  const token = getCliToken();
  const mutation = `
    mutation productBulkPublish($productIds: [ID!]!, $publishToAll: AllPublicationsPublishContext) {
      productBulkPublish(productIds: $productIds, publishToAll: $publishToAll) {
        userErrors {
          field
          message
        }
        job {
          id
          done
        }
      }
    }
  `;

  for (const item of products) {
    console.log(`Publishing ${item.name} to ALL channels...`);
    const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        query: mutation,
        variables: {
          productIds: [item.id],
          publishToAll: {
            catalogTypes: ['APP', 'MARKET']
          }
        }
      })
    });
    const data = await res.json();
    console.log(`  Result for ${item.name}:`, JSON.stringify(data.data?.productBulkPublish, null, 2));
    if (data.errors) {
      console.log('  Errors:', JSON.stringify(data.errors, null, 2));
    }
  }
}

publishAllChannels();

