import { adminGraphql } from './config.mjs';

const newImages = [
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/C_i_t_o_kim_lo_i_b_ng_s_n_b_c_l_p_lanh.png?v=1793897470",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/6fb53c51539b47559cf0d122a832cf63.png?v=1793736107",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/3_0e403739-86c7-462f-bd85-71821a8338e3.png?v=1793897470",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/4_33df4e32-deb9-4fb8-959c-937755291394.png?v=1793897470",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/5.png?v=1793897470",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/6.png?v=1793897470",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/4_24d8e722-1c94-4e41-85aa-002764cbb839.png?v=1793736107",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/7.png?v=1793897470"
];

async function main() {
  // 1. Get current product media
  const getRes = await adminGraphql(`{
    productByHandle(handle: "metallic-silver-anti-rust-renovation-coating") {
      id
      title
      media(first: 50) {
        nodes {
          id
          mediaContentType
        }
      }
    }
  }`);

  const product = getRes.productByHandle;
  console.log(`Product: ${product.title} (${product.id})`);
  const mediaIds = product.media.nodes.map(m => m.id);
  console.log(`Current media count: ${mediaIds.length}`);

  // 2. Add new media first
  const mediaInput = newImages.map(url => ({
    originalSource: url,
    mediaContentType: "IMAGE"
  }));

  console.log('Creating new media...');
  const createRes = await adminGraphql(`
    mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media {
          id
          mediaContentType
          status
        }
        mediaUserErrors {
          field
          message
        }
      }
    }
  `, {
    productId: product.id,
    media: mediaInput
  });

  if (createRes.productCreateMedia.mediaUserErrors?.length > 0) {
    console.error('Create media errors:', createRes.productCreateMedia.mediaUserErrors);
    return;
  }
  console.log(`Successfully created ${createRes.productCreateMedia.media.length} media items.`);

  // 3. Delete old media if any
  if (mediaIds.length > 0) {
    console.log(`Deleting ${mediaIds.length} old media items...`);
    const delRes = await adminGraphql(`
      mutation productDeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
        productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
          deletedMediaIds
          mediaUserErrors {
            field
            message
          }
        }
      }
    `, {
      productId: product.id,
      mediaIds: mediaIds
    });
    console.log('Deleted old media IDs:', delRes.productDeleteMedia.deletedMediaIds?.length);
  }

  // 4. Verify new media list
  const verifyRes = await adminGraphql(`{
    productByHandle(handle: "metallic-silver-anti-rust-renovation-coating") {
      id
      media(first: 20) {
        nodes {
          id
          ... on MediaImage {
            image {
              url
            }
          }
        }
      }
    }
  }`);
  console.log('Final media items in Shopify:');
  verifyRes.productByHandle.media.nodes.forEach((m, idx) => {
    console.log(`${idx + 1}: ${m.image?.url}`);
  });
}

main().catch(console.error);

