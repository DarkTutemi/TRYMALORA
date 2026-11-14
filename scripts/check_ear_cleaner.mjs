import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    productByHandle(handle: "ear-cleaner") {
      id
      title
      handle
      options {
        id
        name
        values
      }
      variants(first: 10) {
        nodes {
          id
          title
          price
        }
      }
      media(first: 10) {
        nodes {
          id
          status
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

