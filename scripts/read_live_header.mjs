import { adminGraphql } from './config.mjs';

async function main() {
  const query = `
    query {
      theme(id: "gid://shopify/OnlineStoreTheme/197111513459") {
        files(filenames: ["sections/header-group.json"], first: 1) {
          nodes {
            filename
            body {
              ... on OnlineStoreThemeFileBodyText {
                content
              }
            }
          }
        }
      }
    }
  `;
  const res = await adminGraphql(query);
  console.log(res?.theme?.files?.nodes?.[0]?.body?.content);
}

main();

