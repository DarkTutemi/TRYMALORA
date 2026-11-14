import { adminGraphql, getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const prodRes = await adminGraphql(`{
    productByHandle(handle: "metallic-silver-anti-rust-renovation-coating") {
      id
      title
      handle
      status
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
          compareAtPrice
          selectedOptions {
            name
            value
          }
        }
      }
    }
  }`);
  console.log('PRODUCT:', JSON.stringify(prodRes.productByHandle, null, 2));
}

main().catch(console.error);
