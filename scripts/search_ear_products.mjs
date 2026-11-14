import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    products(first: 20, query: "ear") {
      nodes {
        id
        title
        handle
        variants(first: 10) {
          nodes {
            id
            title
            sku
            price
          }
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

