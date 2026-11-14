import { adminGraphql } from './config.mjs';

async function main() {
  const res = await adminGraphql(`{
    productByHandle(handle: "ear-cleaner") {
      id
      title
      description
      descriptionHtml
      options {
        id
        name
        values
      }
      variants(first: 10) {
        nodes {
          id
          title
          sku
          price
          compareAtPrice
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }`);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);

