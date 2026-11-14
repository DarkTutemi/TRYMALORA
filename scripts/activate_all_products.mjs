import { getCliToken } from './config.mjs';

const productIds = [
  { name: 'Metallic Silver Anti-Rust Renovation Coating', id: 'gid://shopify/Product/15636321403251' },
  { name: 'Car Metal Rust Repair Paste', id: 'gid://shopify/Product/15636321468787' },
  { name: 'Metal Chrome Polish & Restorer Paste', id: 'gid://shopify/Product/15636321567091' },
  { name: 'Mini Dual-Purpose Travel Styling Iron', id: 'gid://shopify/Product/15636321599859' },
  { name: 'Tile Refinishing Paint Restoration Kit', id: 'gid://shopify/Product/15636321698163' }
];

async function activateAll() {
  const token = getCliToken();
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          status
          onlineStoreUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  for (const item of productIds) {
    const res = await fetch('https://ikwh1h-fx.myshopify.com/admin/api/2026-10/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: item.id,
            status: 'ACTIVE'
          }
        }
      })
    });
    const data = await res.json();
    console.log(`[ACTIVATED] ${item.name}:`, data.data?.productUpdate?.product?.status);
    if (data.data?.productUpdate?.userErrors?.length) {
      console.log('Errors:', data.data.productUpdate.userErrors);
    }
  }
}

activateAll();

