import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      product(id: "gid://shopify/Product/15636872003955") {
        onlineStorePreviewUrl
        onlineStoreUrl
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

main();

