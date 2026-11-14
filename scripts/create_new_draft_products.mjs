import { getCliToken } from './config.mjs';
import fs from 'fs';

const SHOP = 'ikwh1h-fx.myshopify.com';
const API_VERSION = '2026-10';

async function shopifyGql(query, variables = {}) {
  const token = getCliToken();
  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2));
  }
  return json;
}

// 1. Helper to find or create collection
async function getOrCreateCollection(title, handle, description) {
  const checkRes = await shopifyGql(`
    query {
      collections(first: 20) {
        edges {
          node {
            id
            title
            handle
          }
        }
      }
    }
  `);
  const existing = checkRes?.data?.collections?.edges?.find(e => e.node.handle === handle);
  if (existing) {
    console.log(`Collection exists: ${existing.node.title} (${existing.node.id})`);
    return existing.node.id;
  }

  console.log(`Creating collection: ${title} (${handle})...`);
  const createRes = await shopifyGql(`
    mutation createCol($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection {
          id
          title
          handle
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: {
      title,
      handle,
      descriptionHtml: `<p>${description}</p>`,
      sortOrder: 'BEST_SELLING'
    }
  });

  const colId = createRes?.data?.collectionCreate?.collection?.id;
  console.log(`Created collection: ${colId}`);
  return colId;
}

// Load source JSON data
const s1 = JSON.parse(fs.readFileSync('scripts/source_1_data.json', 'utf8'));
const s2 = JSON.parse(fs.readFileSync('scripts/source_2_data.json', 'utf8'));
const s3 = JSON.parse(fs.readFileSync('scripts/source_3_data.json', 'utf8'));
const s4 = JSON.parse(fs.readFileSync('scripts/source_4_data.json', 'utf8'));
const s6 = JSON.parse(fs.readFileSync('scripts/source_6_data.json', 'utf8'));

function formatCdnUrls(urls) {
  return urls.map(u => {
    let clean = u.startsWith('//') ? 'https:' + u : u;
    clean = clean.split('?')[0]; // strip query string for clean ingestion
    return clean;
  });
}

const productsToCreate = [
  {
    key: 'coating',
    title: 'Metallic Silver Anti-Rust Renovation Coating',
    handle: 'metallic-silver-anti-rust-renovation-coating',
    productType: 'Home Improvement',
    collectionHandle: 'home-improvement',
    collectionTitle: 'Home Improvement',
    collectionDesc: 'Premium renovation coatings, waterproof enamels, and architectural surface care.',
    descriptionHtml: `
      <p>Professional water-based metallic silver anti-rust renovation coating (100g) with high-density application brush. Seals metal surfaces, prevents oxidation, and restores gates, railings, outdoor furniture, and steel fixtures with a durable weather-resistant finish.</p>
      <ul>
        <li><strong>Active Anti-Oxidation Shield:</strong> Penetrates metal pores to halt corrosion.</li>
        <li><strong>Water-Based Eco Formula:</strong> Low odor, non-toxic, safe for residential indoor & outdoor application.</li>
        <li><strong>Full Renovation Kit:</strong> Includes 100g compound and specialized detail brush.</li>
      </ul>
    `,
    tags: ['home-improvement', 'anti-rust', 'renovation', 'metal-care', 'trymalora-v4'],
    images: formatCdnUrls(s1.images.slice(0, 8)),
    variants: [
      { title: '1 Can (100g Starter Kit)', price: '19.99', compareAtPrice: '39.99' },
      { title: '2 Cans (Renovation Pack - 10% OFF)', price: '35.99', compareAtPrice: '79.98' },
      { title: '3 Cans (Complete Home Pack - 20% OFF)', price: '47.99', compareAtPrice: '119.97' }
    ]
  },
  {
    key: 'rust-paste',
    title: 'Car Metal Rust Repair Paste',
    handle: 'car-metal-rust-repair-paste',
    productType: 'Automotive Care',
    collectionHandle: 'automotive-care',
    collectionTitle: 'Automotive Care',
    collectionDesc: 'High-performance automotive detailing, metal restoration compounds, and surface protective pastes.',
    descriptionHtml: `
      <p>High-viscosity automotive metal rust repair and neutralizing paste. Creates a durable all-weather moisture barrier that seals micro-pores on car panels, wheel arches, exhaust pipes, and undercarriages to stop rust spread without complex sanding.</p>
      <ul>
        <li><strong>Superior Moisture Barrier:</strong> High-viscosity formula creates an impenetrable seal against rain and road salt.</li>
        <li><strong>All-Weather Flexibility:</strong> Engineered to withstand thermal expansion and freezing winters.</li>
        <li><strong>Color-Matched Selection:</strong> Available in White, Black, Blue, Pink, Red, and Gray.</li>
      </ul>
    `,
    tags: ['automotive', 'car-care', 'rust-repair', 'metal-fix', 'trymalora-v4'],
    images: formatCdnUrls(s2.images.slice(0, 8)),
    variants: [
      { title: 'White (50g)', price: '14.99', compareAtPrice: '29.99' },
      { title: 'Black (50g)', price: '14.99', compareAtPrice: '29.99' },
      { title: 'Blue (50g)', price: '14.99', compareAtPrice: '29.99' },
      { title: 'Pink (50g)', price: '14.99', compareAtPrice: '29.99' },
      { title: 'Red (50g)', price: '14.99', compareAtPrice: '29.99' },
      { title: 'Gray (50g)', price: '14.99', compareAtPrice: '29.99' }
    ]
  },
  {
    key: 'chrome-polish',
    title: 'Metal Chrome Polish & Restorer Paste',
    handle: 'metal-chrome-polish-restorer-paste',
    productType: 'Automotive Care',
    collectionHandle: 'automotive-care',
    collectionTitle: 'Automotive Care',
    collectionDesc: 'High-performance automotive detailing, metal restoration compounds, and surface protective pastes.',
    descriptionHtml: `
      <p>Heavy-duty metal chrome polishing paste with ergonomic applicator brush. Quickly removes surface haze, brake dust oxidation, water spots, and tarnishing from car wheels, chrome trim, exhaust tips, and household chrome fixtures.</p>
      <ul>
        <li><strong>Brilliant Mirror Restoration:</strong> Buffs away road oxidation and restores mirror-like shine in minutes.</li>
        <li><strong>Protective Ceramic Micro-Layer:</strong> Repels water stains and prevents rapid re-oxidation.</li>
        <li><strong>Multi-Surface Safe:</strong> Formulated for chrome, stainless steel, aluminum, and brass.</li>
      </ul>
    `,
    tags: ['automotive', 'chrome-polish', 'metal-trim', 'oxidation-remover', 'trymalora-v4'],
    images: formatCdnUrls(s3.images.slice(0, 8)),
    variants: [
      { title: 'Chrome Silver (100g + Brush)', price: '13.99', compareAtPrice: '27.99' },
      { title: 'Dark Chrome / Black Trim (100g + Brush)', price: '13.99', compareAtPrice: '27.99' }
    ]
  },
  {
    key: 'curling-iron',
    title: 'Mini Dual-Purpose Travel Styling Iron',
    handle: 'mini-dual-purpose-travel-styling-iron',
    productType: 'Beauty & Personal Care',
    collectionHandle: 'beauty-personal-care',
    collectionTitle: 'Beauty & Personal Care',
    collectionDesc: 'Precision personal grooming, compact travel styling tools, and salon-grade daily essentials.',
    descriptionHtml: `
      <p>Ultra-compact dual-purpose ceramic hair iron engineered for both bouncy curls and silky-smooth straightening. Features rapid PTC heating, anti-scald protective exterior, and lightweight travel portability.</p>
      <ul>
        <li><strong>2-in-1 Curling &amp; Straightening:</strong> Smooth ceramic plates glide effortlessly without tugging or heat hot-spots.</li>
        <li><strong>Rapid 30-Second PTC Heating:</strong> Fast temperature stabilization for quick morning touch-ups.</li>
        <li><strong>Travel-Ready Compact Design:</strong> Sleek cylindrical form fits easily into handbags and carry-on luggage.</li>
      </ul>
    `,
    tags: ['beauty', 'hair-care', 'travel', 'styling-iron', 'trymalora-v4'],
    images: formatCdnUrls(s4.images.slice(0, 8)),
    variants: [
      { title: 'Pearl White', price: '19.99', compareAtPrice: '39.99' },
      { title: 'Soft Pink', price: '19.99', compareAtPrice: '39.99' },
      { title: 'Sage Green', price: '19.99', compareAtPrice: '39.99' },
      { title: 'Sky Blue', price: '19.99', compareAtPrice: '39.99' }
    ]
  },
  {
    key: 'tile-paint',
    title: 'Tile Refinishing Paint Restoration Kit',
    handle: 'tile-refinishing-paint-restoration-kit',
    productType: 'Home Improvement',
    collectionHandle: 'home-improvement',
    collectionTitle: 'Home Improvement',
    collectionDesc: 'Premium renovation coatings, waterproof enamels, and architectural surface care.',
    descriptionHtml: `
      <p>Odor-free, high-adhesion tile refinishing paint with custom applicator brush. Renews stained, discolored, or dated ceramic tiles, porcelain sinks, and bathtub surrounds with a durable waterproof enamel gloss finish without the mess of demolition.</p>
      <ul>
        <li><strong>High-Adhesion Enamel Bond:</strong> Locks directly onto non-porous ceramic and porcelain.</li>
        <li><strong>Waterproof &amp; Mildew Resistant:</strong> Formulated for high-humidity bathrooms and kitchen splashbacks.</li>
        <li><strong>Seamless DIY Refresh:</strong> Easy brush-on application with self-leveling finish.</li>
      </ul>
    `,
    tags: ['home-improvement', 'tile-refinishing', 'bathroom', 'paint-kit', 'trymalora-v4'],
    images: formatCdnUrls(s6.images.slice(0, 8)),
    variants: [
      { title: 'Pure White (with Brush)', price: '16.99', compareAtPrice: '34.99' },
      { title: 'Modern Gray (with Brush)', price: '16.99', compareAtPrice: '34.99' },
      { title: 'Matte Black (with Brush)', price: '16.99', compareAtPrice: '34.99' }
    ]
  }
];

async function main() {
  console.log('======================================================');
  console.log('CREATING 5 DRAFT PRODUCTS IN SHOPIFY ADMIN');
  console.log('Safety check: All products will be created in status: DRAFT');
  console.log('======================================================\n');

  // Check existing products first
  const existingProdsRes = await shopifyGql(`
    query {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            status
          }
        }
      }
    }
  `);
  const existingProducts = existingProdsRes?.data?.products?.edges || [];

  for (const item of productsToCreate) {
    console.log(`\n------------------------------------------------------`);
    console.log(`Processing: ${item.title}`);
    console.log(`------------------------------------------------------`);

    // Check if already created
    const found = existingProducts.find(p => p.node.handle === item.handle);
    let productId = found ? found.node.id : null;

    if (found) {
      console.log(`Product already exists: ${found.node.title} (${found.node.id}) [${found.node.status}]`);
    } else {
      console.log(`Creating product in status: DRAFT...`);
      // Prepare media
      const mediaInput = item.images.map(imgUrl => ({
        originalSource: imgUrl,
        alt: item.title,
        mediaContentType: 'IMAGE'
      }));

      const createMutation = `
        mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
          productCreate(product: $product, media: $media) {
            product {
              id
              title
              handle
              status
              variants(first: 10) {
                edges {
                  node {
                    id
                    title
                    price
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const createRes = await shopifyGql(createMutation, {
        product: {
          title: item.title,
          handle: item.handle,
          status: 'DRAFT', // STRICTLY DRAFT
          productType: item.productType,
          vendor: 'TRYMALORA',
          templateSuffix: 'v2',
          tags: item.tags,
          descriptionHtml: item.descriptionHtml.trim()
        },
        media: mediaInput
      });

      if (createRes?.data?.productCreate?.userErrors?.length > 0) {
        console.error('Create errors:', createRes.data.productCreate.userErrors);
        continue;
      }

      const newProduct = createRes?.data?.productCreate?.product;
      productId = newProduct?.id;
      console.log(`[OK] Created Product ID: ${productId} [${newProduct?.status}]`);

      // Update default variant or create additional variants
      const defaultVariant = newProduct?.variants?.edges[0]?.node;
      if (defaultVariant && item.variants.length > 0) {
        const v0 = item.variants[0];
        console.log(`Updating default variant ${defaultVariant.id} to ${v0.title} ($${v0.price})...`);
        await shopifyGql(`
          mutation variantUpdate($input: ProductVariantInput!) {
            productVariantUpdate(input: $input) {
              productVariant {
                id
                title
                price
                inventoryPolicy
              }
              userErrors {
                field
                message
              }
            }
          }
        `, {
          input: {
            id: defaultVariant.id,
            title: v0.title,
            price: v0.price,
            compareAtPrice: v0.compareAtPrice,
            inventoryPolicy: 'CONTINUE'
          }
        });

        // If more variants, create them
        for (let i = 1; i < item.variants.length; i++) {
          const v = item.variants[i];
          console.log(`Creating variant ${v.title} ($${v.price})...`);
          await shopifyGql(`
            mutation variantCreate($input: ProductVariantInput!) {
              productVariantCreate(input: $input) {
                productVariant {
                  id
                  title
                  price
                  inventoryPolicy
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `, {
            input: {
              productId: productId,
              title: v.title,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              inventoryPolicy: 'CONTINUE'
            }
          });
        }
      }
    }

    // Ensure collection exists and product is added to collection
    const colId = await getOrCreateCollection(item.collectionTitle, item.collectionHandle, item.collectionDesc);
    if (colId && productId) {
      console.log(`Adding product to collection ${item.collectionTitle}...`);
      const addColRes = await shopifyGql(`
        mutation collectionAddProducts($id: ID!, $productIds: [ID!]!) {
          collectionAddProducts(id: $id, productIds: $productIds) {
            collection {
              id
              title
              productsCount {
                count
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        id: colId,
        productIds: [productId]
      });
      console.log('Collection add result:', JSON.stringify(addColRes?.data?.collectionAddProducts));
    }
  }

  console.log('\n======================================================');
  console.log('[ALL COMPLETED] 5 Draft products created & organized!');
  console.log('======================================================');
}

main().catch(console.error);

