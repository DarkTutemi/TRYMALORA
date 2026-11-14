import { adminGraphql } from './config.mjs';

async function main() {
  const query = `{
    webPixelSettings {
      customerAccountWebPixel {
        id
        settings
      }
    }
    webPixels(first: 10) {
      edges {
        node {
          id
          settings
        }
      }
    }
  }`;
  try {
    const res = await adminGraphql(query);
    console.log('WebPixels query result:', JSON.stringify(res, null, 2));
  } catch(e) {
    console.log('Error querying webPixels:', e.message);
  }
}

main().catch(console.error);

