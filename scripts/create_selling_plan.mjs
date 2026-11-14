import { adminGraphql } from './config.mjs';

async function main() {
  const earCleaner = await adminGraphql(`{
    productByHandle(handle: "ear-cleaner") {
      id
      title
      variants(first: 5) {
        nodes {
          id
          title
        }
      }
    }
  }`);

  const productId = earCleaner.productByHandle.id;
  const variantIds = earCleaner.productByHandle.variants.nodes.map(v => v.id);

  console.log('Creating SellingPlanGroup for product:', productId, variantIds);

  const mutation = `
    mutation sellingPlanGroupCreate($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput) {
      sellingPlanGroupCreate(input: $input, resources: $resources) {
        sellingPlanGroup {
          id
          name
          sellingPlans(first: 5) {
            nodes {
              id
              name
              description
              category
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

  const input = {
    name: "Subscribe & Save (Every 30 Days)",
    merchantCode: "auto-delivery-30-days",
    description: "Delivered automatically every 30 days. Cancel or pause anytime.",
    options: ["Delivery Frequency"],
    sellingPlansToCreate: [
      {
        name: "Delivery Every 30 Days",
        description: "Billed and delivered every 30 days. Easy 1-click cancel anytime.",
        options: ["Every 30 Days"],
        category: "SUBSCRIPTION",
        billingPolicy: {
          recurring: {
            interval: "DAY",
            intervalCount: 30
          }
        },
        deliveryPolicy: {
          recurring: {
            interval: "DAY",
            intervalCount: 30
          }
        }
      }
    ]
  };

  const resources = {
    productIds: [productId],
    productVariantIds: variantIds
  };

  const res = await adminGraphql(mutation, { input, resources });
  console.log('sellingPlanGroupCreate result:', JSON.stringify(res, null, 2));
}

main().catch(console.error);

