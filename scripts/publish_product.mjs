import { adminGraphql } from './config.mjs';

async function publish() {
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          status
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
  console.log(JSON.stringify(res, null, 2));
}

publish().catch(console.error);
