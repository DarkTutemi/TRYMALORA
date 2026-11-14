import { adminGraphql } from './config.mjs';

async function check() {
  const res = await adminGraphql(`
    query {
      product(id: "gid://shopify/Product/15635841057139") {
        id
        title
        handle
        templateSuffix
      }
    }
  `);
  console.log('Result:', JSON.stringify(res, null, 2));
}

check().catch(console.error);
