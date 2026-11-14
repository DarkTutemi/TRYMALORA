import { adminGraphql } from './config.mjs';

const WIPES_IMAGE = 'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/packshot-v2-a.png?v=1787735386';

async function main() {
  console.log('--- Checking if Pet Ear Finger Wipes product exists ---');
  const existing = await adminGraphql(`{
    productByHandle(handle: "ear-finger-wipes") {
      id
      title
      handle
      variants(first: 5) {
        nodes {
          id
          title
          price
        }
      }
    }
  }`);

  let productId = existing.productByHandle?.id;

  if (productId) {
    console.log('Product already exists:', productId, existing.productByHandle.title);
  } else {
    console.log('Creating product "Pet Ear Finger Wipes (60 Wipes)"...');
    const createRes = await adminGraphql(`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            handle
            title
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      input: {
        title: "Pet Ear Finger Wipes (60 Wipes)",
        handle: "ear-finger-wipes",
        productType: "Pet Care",
        vendor: "Trymalora",
        tags: ["Ear Wipes", "Pet Care", "Dogs", "Cats", "Upsell"],
        status: "ACTIVE",
        templateSuffix: "v2"
      }
    });

    if (createRes.productCreate.userErrors?.length > 0) {
      console.error('Error creating product:', createRes.productCreate.userErrors);
      process.exit(1);
    }
    productId = createRes.productCreate.product.id;
    console.log('Created product:', productId);
  }

  // Check media
  const mediaCheck = await adminGraphql(`{
    product(id: "${productId}") {
      media(first: 5) {
        nodes {
          id
        }
      }
    }
  }`);

  if ((mediaCheck.product?.media?.nodes?.length || 0) === 0) {
    console.log('Uploading media image for wipes...');
    await adminGraphql(`
      mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media {
            id
            status
          }
          mediaUserErrors {
            field
            message
          }
        }
      }
    `, {
      productId: productId,
      media: [{
        originalSource: WIPES_IMAGE,
        mediaContentType: "IMAGE"
      }]
    });
  }

  // Update variant price to $14.99
  const varCheck = await adminGraphql(`{
    product(id: "${productId}") {
      variants(first: 5) {
        nodes {
          id
          title
          price
        }
      }
    }
  }`);

  const v = varCheck.product.variants.nodes[0];
  console.log('Updating wipes variant price to $14.99...');
  await adminGraphql(`
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          price
        }
        userErrors { field message }
      }
    }
  `, {
    productId: productId,
    variants: [{
      id: v.id,
      price: "14.99",
      compareAtPrice: "24.99"
    }]
  });

  // Publish to channels
  console.log('Publishing wipes to sales channels...');
  const pubRes = await adminGraphql(`{
    publications(first: 10) {
      nodes {
        id
      }
    }
  }`);
  for (const pub of pubRes.publications.nodes) {
    await adminGraphql(`
      mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
        publishablePublish(id: $id, input: $input) {
          userErrors { field message }
        }
      }
    `, {
      id: productId,
      input: [{ publicationId: pub.id }]
    });
  }

  const finalCheck = await adminGraphql(`{
    product(id: "${productId}") {
      id
      title
      handle
      variants(first: 5) {
        nodes {
          id
          title
          price
        }
      }
    }
  }`);
  console.log('\n[SUCCESS] Final Wipes Product:', JSON.stringify(finalCheck.product, null, 2));
}

main().catch(console.error);

