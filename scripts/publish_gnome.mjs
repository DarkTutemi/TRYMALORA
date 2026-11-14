import { adminGraphql } from './config.mjs';

async function checkAndPublish() {
  const productId = "gid://shopify/Product/15650950283635";

  // 1. Get publications
  const pubQuery = `
    query getPublications {
      publications(first: 10) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;
  const pubRes = await adminGraphql(pubQuery);
  const pubs = pubRes.publications.edges.map(e => e.node);
  console.log('Available Publications:', pubs);

  // 2. Publish to all available publications
  for (const pub of pubs) {
    const publishQuery = `
      mutation publish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          publishable {
            availablePublicationsCount {
              count
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const res = await adminGraphql(publishQuery, {
      id: productId,
      input: [{ publicationId: pub.id }]
    });
    console.log(`Published to ${pub.name}:`, res.publishablePublish?.userErrors || 'OK');
  }
}

checkAndPublish().catch(console.error);

