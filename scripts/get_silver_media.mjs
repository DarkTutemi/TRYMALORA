import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    productByHandle(handle: "metallic-silver-anti-rust-renovation-coating") {
      id
      title
      media(first: 20) {
        nodes {
          id
          mediaContentType
          ... on MediaImage {
            id
            image {
              url
            }
          }
        }
      }
    }
  }`;
  const res = await adminGraphql(query);
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
