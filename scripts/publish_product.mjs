import { adminGraphql } from './config.mjs';

async function updateProduct() {
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          status
          publishedAt
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const res = await adminGraphql(mutation, {
    input: {
      id: 'gid://shopify/Product/15635841057139',
      status: 'ACTIVE'
    }
  });
  console.log('productUpdate Result:', JSON.stringify(res, null, 2));
}

updateProduct().catch(console.error);
