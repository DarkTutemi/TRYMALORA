import { adminGraphql } from './config.mjs';

const liveImages = [
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173032_fa3f1644adf419e419535a7a56d7b7a2_cadd7957-c46f-4ec7-84a6-568ca94f7d10.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173035_9f0c90c9a1c1660270bac48d0e763a61_9c643d90-452e-404c-935d-02aa2bb9e0ad.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173038_09131ab58b0b44eb13e71ebf5b7b5d14_53904d06-891f-4747-b974-73ffb4e3e184.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173041_19f85ba141910faaa1f177e2cdff2203_fef53aff-cf6c-4665-817e-c9d29d56378b.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173041_1e1b8b3225b47b3ed292636bc6f40805_1419b279-9e61-459f-bacc-09a9557d02b9.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173041_a213aa1d2af3c0de877c7060deef0747_3037eab6-ff0c-4085-8f88-f5058b2ae3b0.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173041_12ec96592ae8ad0a4a53f888570b7267_81d1f546-823c-407d-99f7-6d5648366eb0.png",
  "https://cdn.shopify.com/s/files/1/1032/4541/4771/files/spp_shopify20260924173044_13165fe65eecd4e8bf25cded23bc9eff_0fb57a3e-1baf-4bb3-8b7d-5a7264903be3.jpg"
];

const videoUrl = "https://cdn.shopify.com/videos/c/o/v/22d393cbbfef4b1fa48284f0595279e4.mp4";

const colors = ["Pure White", "Modern Gray", "Matte Black"];
const sizes = [
  { size: "100g", price: "16.99" },
  { size: "300g", price: "29.99" },
  { size: "500g", price: "39.99" }
];

async function main() {
  console.log("Checking if draft product exists...");
  const checkQuery = `
    query {
      products(first: 5, query: "handle:tile-refinishing-paint-restoration-kit-draft") {
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
  `;
  const checkRes = await adminGraphql(checkQuery);
  const existing = checkRes?.products?.edges?.[0]?.node;

  const variants = [];
  for (const c of colors) {
    for (const s of sizes) {
      variants.push({
        optionValues: [
          { optionName: "Color", name: c },
          { optionName: "Size", name: s.size }
        ],
        price: s.price,
        inventoryPolicy: "CONTINUE"
      });
    }
  }

  const productSetInput = {
    title: "Tile Refinishing Paint Restoration Kit - Draft",
    handle: "tile-refinishing-paint-restoration-kit-draft",
    status: "DRAFT", // Strictly DRAFT
    productType: "Home Improvement",
    vendor: "TRYMALORA",
    templateSuffix: "v2",
    tags: ["home-improvement", "tile-refinishing", "bathroom", "paint-kit", "trymalora-v4", "draft-test"],
    descriptionHtml: `
      <p>Odor-free, high-adhesion tile refinishing paint with custom applicator brush. Renews stained, discolored, or dated ceramic tiles, porcelain sinks, and bathtub surrounds with a durable waterproof enamel gloss finish without the mess of demolition.</p>
      <ul>
        <li><strong>High-Adhesion Enamel Bond:</strong> Locks directly onto non-porous ceramic and porcelain.</li>
        <li><strong>Waterproof &amp; Mildew Resistant:</strong> Formulated for high-humidity bathrooms and kitchen splashbacks.</li>
        <li><strong>Seamless DIY Refresh:</strong> Easy brush-on application with self-leveling finish.</li>
      </ul>
    `,
    productOptions: [
      {
        name: "Color",
        values: colors.map(c => ({ name: c }))
      },
      {
        name: "Size",
        values: sizes.map(s => ({ name: s.size }))
      }
    ],
    variants
  };

  if (existing) {
    console.log(`Updating existing draft product: ${existing.id}`);
    productSetInput.id = existing.id;
  }

  const setMutation = `
    mutation productSet($input: ProductSetInput!) {
      productSet(input: $input) {
        product {
          id
          title
          handle
          status
          variants(first: 15) {
            edges {
              node {
                id
                title
                price
                selectedOptions {
                  name
                  value
                }
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

  const res = await adminGraphql(setMutation, { input: productSetInput });
  if (res?.productSet?.userErrors?.length > 0) {
    console.error("Errors:", res.productSet.userErrors);
    return;
  }

  const createdProd = res?.productSet?.product;
  console.log(`Product created/updated successfully! ID: ${createdProd?.id}`);
  console.log(`Variants count: ${createdProd?.variants?.edges?.length}`);
  createdProd?.variants?.edges?.forEach(e => {
    console.log(` - ${e.node.title}: $${e.node.price} (${e.node.id})`);
  });

  // Now attach media (images and video)
  console.log("Attaching media (images + video)...");
  // Check existing media
  const mediaQuery = `
    query {
      product(id: "${createdProd.id}") {
        media(first: 20) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  `;
  const mRes = await adminGraphql(mediaQuery);
  const mediaCount = mRes?.product?.media?.edges?.length || 0;
  if (mediaCount === 0) {
    const mediaInput = [
      // Hero image
      {
        originalSource: liveImages[0],
        alt: "Tile Refinishing Paint Restoration Kit",
        mediaContentType: "IMAGE"
      },
      // Video right after hero image
      {
        originalSource: videoUrl,
        alt: "Tile Refinishing Paint Application Video",
        mediaContentType: "VIDEO"
      },
      // Remaining images
      ...liveImages.slice(1).map(img => ({
        originalSource: img,
        alt: "Tile Refinishing Paint Restoration Kit",
        mediaContentType: "IMAGE"
      }))
    ];

    const mediaMutation = `
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
    `;

    const createMediaRes = await adminGraphql(mediaMutation, {
      productId: createdProd.id,
      media: mediaInput
    });
    console.log("Media create res:", JSON.stringify(createMediaRes, null, 2));
  } else {
    console.log(`Product already has ${mediaCount} media items.`);
  }
}

main();

