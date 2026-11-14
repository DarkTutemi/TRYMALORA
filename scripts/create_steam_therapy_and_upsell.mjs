import { adminGraphql, SHOP } from './config.mjs';

const UPSELL_IMAGE = 'https://ae-pic-a1.aliexpress-media.com/kf/Sa2036508456e4e449020a5de57fd474cU.jpg';

const MAIN_PRODUCT_IMAGES = [
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/MY_EYES_WENT_FROM_DESERT_DRY_TO_PERFECTLY_NORMAL_IN_5_MINUTES_LIFE_CHANGING_2_-min.png?v=1759987199',
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/Woman_Eyvelle_Steam_5.webp?v=1760066939',
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/eyvelle-steam-therapy-4983838.png?v=1760066939',
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/Woman_Eyvelle_Steam_6.webp?v=1760066939',
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/eyvelle-steam-therapy-4853939.png?v=1760066939',
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/eyvelle-steam-therapy-6406794.png?v=1760066939',
  'https://cdn.shopify.com/s/files/1/0759/4072/4979/files/eyvelle-steam-therapy-9040353.png?v=1760066939'
];

async function main() {
  console.log('==============================================');
  console.log('STEP 1: CREATING UP-SALE PRODUCT: LuminaLift Wand');
  console.log('==============================================');

  const upsellHandle = 'luminalift-eye-massager';
  let upsellExisting = await adminGraphql(`{
    productByHandle(handle: "${upsellHandle}") {
      id
      title
      handle
      variants(first: 5) {
        nodes { id title price compareAtPrice sku }
      }
    }
  }`);

  let upsellProdId = upsellExisting.productByHandle?.id;

  if (upsellProdId) {
    console.log('[OK] Upsell product already exists:', upsellProdId);
  } else {
    console.log('Creating new upsell product...');
    const createRes = await adminGraphql(`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product { id handle title }
          userErrors { field message }
        }
      }
    `, {
      input: {
        title: "Trymalora™ LuminaLift Pro Red-Light Eye Rejuvenator & Thermal Vibration Sculptor",
        handle: upsellHandle,
        productType: "Beauty & Eye Care",
        vendor: "Trymalora",
        tags: ["Red Light", "Eye Massager", "Facial Sculpting", "Anti-Puffiness", "Upsell"],
        status: "ACTIVE",
        templateSuffix: "v2",
        descriptionHtml: "<p>Dual-action 630nm red-light phototherapy combined with 12,000 RPM gentle thermal micro-vibrations to visibly depuff morning eye bags, fade stubborn dark circles, and lift fine lines around the delicate peri-orbital area.</p>"
      }
    });

    if (createRes.productCreate.userErrors?.length > 0) {
      console.error('Error creating upsell product:', createRes.productCreate.userErrors);
      process.exit(1);
    }
    upsellProdId = createRes.productCreate.product.id;
    console.log('[OK] Created upsell product:', upsellProdId);
  }

  // Add media to upsell product if empty
  const upsellMediaCheck = await adminGraphql(`{
    product(id: "${upsellProdId}") {
      media(first: 5) { nodes { id } }
      variants(first: 5) { nodes { id inventoryItem { id } } }
    }
  }`);

  if (upsellMediaCheck.product.media.nodes.length === 0) {
    console.log('Attaching image to upsell product...');
    const mediaRes = await adminGraphql(`
      mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id }
          mediaUserErrors { field message }
        }
      }
    `, {
      productId: upsellProdId,
      media: [{
        originalSource: UPSELL_IMAGE,
        mediaContentType: "IMAGE",
        alt: "Trymalora LuminaLift Pro Red-Light Eye Rejuvenator"
      }]
    });
    console.log('[OK] Media attached to upsell:', mediaRes.productCreateMedia.media.length);
  }

  // Update variant price to 29.99 and compareAt 59.99
  const upsellVar = upsellMediaCheck.product.variants.nodes[0];
  if (upsellVar) {
    console.log('Updating upsell variant price to $29.99, compareAt $59.99...');
    await adminGraphql(`
      mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          productVariants { id price compareAtPrice inventoryPolicy }
          userErrors { field message }
        }
      }
    `, {
      productId: upsellProdId,
      variants: [{
        id: upsellVar.id,
        price: "29.99",
        compareAtPrice: "59.99",
        inventoryPolicy: "CONTINUE",
        inventoryItem: { sku: "LL-REDLIGHT-WAND" }
      }]
    });
  }

  console.log('\n==============================================');
  console.log('STEP 2: CREATING MAIN PRODUCT: eyvelle-steam-therapy');
  console.log('==============================================');

  const mainHandle = 'eyvelle-steam-therapy';
  let mainExisting = await adminGraphql(`{
    productByHandle(handle: "${mainHandle}") {
      id
      title
      handle
      variants(first: 10) {
        nodes { id title price compareAtPrice sku }
      }
    }
  }`);

  let mainProdId = mainExisting.productByHandle?.id;

  if (mainProdId) {
    console.log('[OK] Main product already exists:', mainProdId);
  } else {
    console.log('Creating main product Trymalora Nano Steam Eye Relief Therapy Wand...');
    const createRes = await adminGraphql(`
      mutation productCreate($input: ProductInput!) {
        productCreate(input: $input) {
          product { id handle title }
          userErrors { field message }
        }
      }
    `, {
      input: {
        title: "Trymalora™ Nano Steam Eye Relief Therapy Wand",
        handle: mainHandle,
        productType: "Eye Care & Wellness",
        vendor: "Trymalora",
        tags: ["Steam Therapy", "Eye Wand", "Dry Eyes", "Eye Care", "Bestseller"],
        status: "ACTIVE",
        templateSuffix: "v2",
        descriptionHtml: "<p>Ophthalmologist-recommended ultrasonic warm nano-steam therapy that gently unblocks meibomian oil glands, restores the natural tear lipid film, and relieves chronic dry, itchy, tired eyes in just 5 minutes.</p>"
      }
    });

    if (createRes.productCreate.userErrors?.length > 0) {
      console.error('Error creating main product:', createRes.productCreate.userErrors);
      process.exit(1);
    }
    mainProdId = createRes.productCreate.product.id;
    console.log('[OK] Created main product:', mainProdId);
  }

  // Attach gallery images
  const mainMediaCheck = await adminGraphql(`{
    product(id: "${mainProdId}") {
      media(first: 10) { nodes { id } }
    }
  }`);

  if (mainMediaCheck.product.media.nodes.length === 0) {
    console.log('Attaching 7 gallery images to main product...');
    const mediaRes = await adminGraphql(`
      mutation productCreateMedia($productId: ID!, $media: [CreateMediaInput!]!) {
        productCreateMedia(productId: $productId, media: $media) {
          media { id }
          mediaUserErrors { field message }
        }
      }
    `, {
      productId: mainProdId,
      media: MAIN_PRODUCT_IMAGES.map((src, i) => ({
        originalSource: src,
        mediaContentType: "IMAGE",
        alt: `Trymalora Nano Steam Eye Relief Therapy Wand - Image ${i+1}`
      }))
    });
    console.log('[OK] Attached media:', mediaRes.productCreateMedia.media?.length);
  }

  // Check Option Name
  const optCheck = await adminGraphql(`{
    product(id: "${mainProdId}") {
      options { id name values }
      variants(first: 10) {
        nodes { id title price compareAtPrice inventoryPolicy sku }
      }
    }
  }`);

  const currentOption = optCheck.product.options[0];
  if (currentOption && currentOption.name !== 'Package') {
    console.log('Updating option name to "Package"...');
    await adminGraphql(`
      mutation productOptionUpdate($productId: ID!, $option: OptionUpdateInput!) {
        productOptionUpdate(productId: $productId, option: $option) {
          userErrors { field message }
        }
      }
    `, {
      productId: mainProdId,
      option: {
        id: currentOption.id,
        name: "Package"
      }
    });
  }

  const desiredVariants = [
    {
      title: "Buy 1 — Single Starter Kit",
      price: "39.99",
      compareAtPrice: "85.00",
      sku: "ST-EYE-1PK"
    },
    {
      title: "Buy 2 Wands (Couple Care Pack · Save Extra $10)",
      price: "69.98",
      compareAtPrice: "170.00",
      sku: "ST-EYE-2PK"
    },
    {
      title: "Buy 3 Wands (Family Set · Free Shipping · Save Extra $25)",
      price: "94.97",
      compareAtPrice: "255.00",
      sku: "ST-EYE-3PK"
    }
  ];

  const curVars = optCheck.product.variants.nodes;
  console.log('Current variants count:', curVars.length);

  // Update existing variants
  const updatePayload = curVars.map((v, i) => ({
    id: v.id,
    price: desiredVariants[i].price,
    compareAtPrice: desiredVariants[i].compareAtPrice,
    inventoryPolicy: "CONTINUE",
    inventoryItem: { sku: desiredVariants[i].sku },
    optionValues: [{ optionName: "Package", name: desiredVariants[i].title }]
  }));

  console.log('Updating existing variants with bulk update...');
  await adminGraphql(`
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants { id title price }
        userErrors { field message }
      }
    }
  `, {
    productId: mainProdId,
    variants: updatePayload
  });

  // Create missing variants if less than 3
  if (curVars.length < 3) {
    for (let i = curVars.length; i < 3; i++) {
      console.log(`Creating variant #${i+1}: ${desiredVariants[i].title}...`);
      await adminGraphql(`
        mutation productVariantsBulkCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkCreate(productId: $productId, variants: $variants) {
            productVariants { id title price }
            userErrors { field message }
          }
        }
      `, {
        productId: mainProdId,
        variants: [{
          price: desiredVariants[i].price,
          compareAtPrice: desiredVariants[i].compareAtPrice,
          inventoryPolicy: "CONTINUE",
          inventoryItem: { sku: desiredVariants[i].sku },
          optionValues: [{ optionName: "Package", name: desiredVariants[i].title }]
        }]
      });
    }
  }

  // Ensure inventory policy CONTINUE on all variants
  const freshMain = await adminGraphql(`{
    product(id: "${mainProdId}") {
      variants(first: 10) {
        nodes { id title price compareAtPrice sku inventoryPolicy }
      }
    }
  }`);

  await adminGraphql(`
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }
  `, {
    productId: mainProdId,
    variants: freshMain.product.variants.nodes.map(v => ({
      id: v.id,
      inventoryPolicy: "CONTINUE"
    }))
  });

  // Publish both products to all channels
  console.log('\nPublishing products to all sales channels...');
  const pubQuery = await adminGraphql(`{
    publications(first: 20) {
      nodes { id name }
    }
  }`);

  const pubIds = pubQuery.publications.nodes.map(p => p.id);
  console.log('Sales channels:', pubQuery.publications.nodes.map(p => p.name));

  for (const pid of [upsellProdId, mainProdId]) {
    for (const pubId of pubIds) {
      await adminGraphql(`
        mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
          publishablePublish(id: $id, input: $input) {
            userErrors { field message }
          }
        }
      `, {
        id: pid,
        input: [{ publicationId: pubId }]
      }).catch(() => {});
    }
  }
  console.log('[OK] All products published successfully!');

  // Print final IDs
  const upsellFinal = await adminGraphql(`{
    product(id: "${upsellProdId}") {
      id title handle variants(first: 5) { nodes { id price compareAtPrice sku } }
    }
  }`);
  const mainFinal = await adminGraphql(`{
    product(id: "${mainProdId}") {
      id title handle variants(first: 10) { nodes { id title price compareAtPrice sku } }
    }
  }`);

  console.log('\n==============================================');
  console.log('CREATION COMPLETE:');
  console.log('MAIN PRODUCT:', mainFinal.product.id);
  console.log('Handle:', mainFinal.product.handle);
  console.log('Variants:');
  mainFinal.product.variants.nodes.forEach(v => {
    console.log(` - ${v.id.split('/').pop()} | ${v.title} | $${v.price} (Compare: $${v.compareAtPrice}) | ${v.sku}`);
  });
  console.log('\nUPSELL PRODUCT:', upsellFinal.product.id);
  console.log('Handle:', upsellFinal.product.handle);
  console.log('Variant ID:', upsellFinal.product.variants.nodes[0]?.id.split('/').pop());
  console.log('Price:', `$${upsellFinal.product.variants.nodes[0]?.price}`);
  console.log('==============================================');
}

main().catch(console.error);
