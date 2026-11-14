import { adminGraphql } from './config.mjs';

async function listCollections() {
  const data = await adminGraphql(`
    query {
      collections(first: 50) {
        edges {
          node {
            id
            title
            handle
            templateSuffix
            productsCount {
              count
            }
          }
        }
      }
    }
  `);

  const colls = data.collections.edges.map(e => e.node);
  console.log(`Found ${colls.length} collections:`);
  for (const c of colls) {
    console.log(`- [${c.id}] ${c.title} (handle: "${c.handle}", templateSuffix: "${c.templateSuffix}", products: ${c.productsCount?.count})`);
  }
}

listCollections().catch(console.error);

