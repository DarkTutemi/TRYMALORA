import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function main() {
  const token = await getAccessToken();

  // 1. Get publications
  const pubRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        publications(first: 10) {
          edges {
            node {
              id
              name
            }
          }
        }
        product(id: "gid://shopify/Product/15669312094579") {
          id
          title
          status
          publishedOnCurrentPublication
          variants(first: 5) {
            edges {
              node {
                id
                title
                price
                availableForSale
              }
            }
          }
        }
      }`
    })
  });

  const pubData = await pubRes.json();
  console.log('Product & Publications:', JSON.stringify(pubData, null, 2));

  const publications = pubData.data.publications.edges.map(e => e.node);
  const onlineStorePub = publications.find(p => p.name.toLowerCase().includes('online store'));
  console.log('Online Store publication:', onlineStorePub);

  // Get variant ID
  const prodRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: `query {
        product(id: "gid://shopify/Product/15669312094579") {
          id
          title
          variants(first: 5) {
            edges {
              node {
                id
                price
                availableForSale
              }
            }
          }
        }
      }`
    })
  });
  const prodData = await prodRes.json();
  console.log('Wash bag product data:', JSON.stringify(prodData, null, 2));
}

main().catch(console.error);
