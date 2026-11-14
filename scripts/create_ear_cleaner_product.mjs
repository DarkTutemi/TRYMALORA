import { adminGraphql, SHOP } from './config.mjs';

const EAR_CLEANER_IMAGES = [
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/v2.webp?v=1790421304',
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/02-symptomes_1cf315a3-8e50-4c36-9b12-9effd76ba003.png?v=1786814766',
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/1790493902567-ign9e2stjj.webp?v=1790506526',
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/04-avant-apres_47705026-32a0-4ae3-be3b-bebe7f33aabc.png?v=1786815043',
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/05-etapes_0b488b6d-6e18-4b02-8a73-2b2d26c08411.png?v=1786814764',
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/06-chiffre_f622d1e6-c52b-4539-9c0d-990e433df211.png?v=1786814766',
  'https://cdn.shopify.com/s/files/1/1043/6630/9718/files/07-chiens-et-chats_f10e42b1-eeac-49d0-b615-2d13d91d9f91.png?v=1786814766'
];

async function main() {
  console.log('--- Step 1: Checking if product already exists ---');
  const existing = await adminGraphql(`{
    productByHandle(handle: "ear-cleaner") {
      id
      title
      handle
      variants(first: 10) {
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
    console.log('Creating product "Ear Cleaner for Dogs & Cats"...');
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
        title: "Ear Cleaner for Dogs & Cats",
        handle: "ear-cleaner",
        productType: "Pet Care",
        vendor: "Trymalora",
        tags: ["Ear Cleaner", "Pet Care", "Dogs", "Cats", "Bestseller"],
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

  // 2. Add Media if not present
  const mediaCheck = await adminGraphql(`{
    product(id: "${productId}") {
      media(first: 10) {
        nodes {
          id
        }
      }
    }
  }`);

  if ((mediaCheck.product?.media?.nodes?.length || 0) === 0) {
    console.log('Uploading 7 media images...');
    const mediaInput = EAR_CLEANER_IMAGES.map(url => ({
      originalSource: url,
      mediaContentType: "IMAGE"
    }));
    const mediaRes = await adminGraphql(`
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
      media: mediaInput
    });
    console.log('Media upload result:', mediaRes.productCreateMedia.media?.length, 'images created.');
  } else {
    console.log('Media already present:', mediaCheck.product.media.nodes.length, 'images.');
  }

  // 3. Configure Option & Variants
  // Base price $34.99
  // Buy 2 Get 2 Free: 2 * 34.99 = 69.98 - 10% = 62.98
  // Buy 4 Get 4 Free: 4 * 34.99 = 139.96 - 20% = 111.97
  const desiredVariants = [
    { title: "Buy 1", price: "34.99", compareAt: "69.99" },
    { title: "Buy 2 Get 2 FREE (4 Bottles Total · Extra 10% OFF)", price: "62.98", compareAt: "139.96" },
    { title: "Buy 4 Get 4 FREE (8 Bottles Total · Extra 20% OFF)", price: "111.97", compareAt: "279.92" }
  ];

  // Inspect current options
  const optCheck = await adminGraphql(`{
    product(id: "${productId}") {
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
        }
      }
    }
  }`);

  const currentOption = optCheck.product.options[0];
  if (currentOption && currentOption.name !== 'Package') {
    console.log('Updating option name to "Package"...');
    await adminGraphql(`
      mutation productOptionUpdate($productId: ID!, $id: ID!, $option: OptionUpdateInput!) {
        productOptionUpdate(productId: $productId, id: $id, option: $option) {
          userErrors { field message }
        }
      }
    `, {
      productId: productId,
      id: currentOption.id,
      option: { name: "Package" }
    });
  }

  // Update/Create the 3 variants using productVariantsBulkUpdate
  const curVars = optCheck.product.variants.nodes;
  console.log('Current variants count:', curVars.length);

  // Variant 1
  const v1 = curVars[0];
  const updatePayload = [
    {
      id: v1.id,
      price: desiredVariants[0].price,
      compareAtPrice: desiredVariants[0].compareAt,
      optionValues: [{ optionName: "Package", name: desiredVariants[0].title }]
    }
  ];

  if (curVars[1]) {
    updatePayload.push({
      id: curVars[1].id,
      price: desiredVariants[1].price,
      compareAtPrice: desiredVariants[1].compareAt,
      optionValues: [{ optionName: "Package", name: desiredVariants[1].title }]
    });
  }
  if (curVars[2]) {
    updatePayload.push({
      id: curVars[2].id,
      price: desiredVariants[2].price,
      compareAtPrice: desiredVariants[2].compareAt,
      optionValues: [{ optionName: "Package", name: desiredVariants[2].title }]
    });
  }

  console.log('Updating existing variants with bulk update...');
  const bulkRes = await adminGraphql(`
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
    variants: updatePayload
  });
  console.log('Bulk update result:', JSON.stringify(bulkRes, null, 2));

  // If we need to create variant 2 or variant 3 (if current count < 3)
  if (curVars.length < 3) {
    for (let i = curVars.length; i < 3; i++) {
      console.log(`Creating variant #${i+1}: ${desiredVariants[i].title}...`);
      const createVarRes = await adminGraphql(`
        mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkCreate(productId: $productId, variants: $variants) {
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
          price: desiredVariants[i].price,
          compareAtPrice: desiredVariants[i].compareAt,
          optionValues: [{ optionName: "Package", name: desiredVariants[i].title }]
        }]
      });
      console.log(`Create variant #${i+1} result:`, JSON.stringify(createVarRes, null, 2));
    }
  }

  // Also publish to Online Store Sales Channel
  console.log('Publishing product to channels...');
  const pubRes = await adminGraphql(`{
    publications(first: 10) {
      nodes {
        id
        name
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

  // Verify final product
  const finalCheck = await adminGraphql(`{
    product(id: "${productId}") {
      id
      title
      handle
      status
      variants(first: 10) {
        nodes {
          id
          title
          price
          compareAtPrice
        }
      }
    }
  }`);
  console.log('\n[SUCCESS] Final Product:', JSON.stringify(finalCheck.product, null, 2));
}

main().catch(console.error);

