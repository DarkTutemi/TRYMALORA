import { adminGraphql } from './config.mjs';

async function main() {
  const productId = "gid://shopify/Product/15647463735667";

  const desired = [
    {
      id: "gid://shopify/ProductVariant/67346128470387",
      title: "Buy 1 (1 × 100ml)",
      sku: "EC-100ML-1PK",
      price: "34.99",
      compareAtPrice: "69.99"
    },
    {
      id: "gid://shopify/ProductVariant/67346169725299",
      title: "Buy 2 Get 2 FREE (4 × 100ml · Extra 10% OFF)",
      sku: "EC-100ML-4PK",
      price: "62.98",
      compareAtPrice: "139.96"
    },
    {
      id: "gid://shopify/ProductVariant/67346169758067",
      title: "Buy 4 Get 4 FREE (8 × 100ml · Extra 20% OFF)",
      sku: "EC-100ML-8PK",
      price: "111.97",
      compareAtPrice: "279.92"
    }
  ];

  console.log('Updating variant option values and SKUs...');
  const res = await adminGraphql(`
    mutation productVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        productVariants {
          id
          title
          sku
          price
          compareAtPrice
          inventoryPolicy
        }
        userErrors { field message }
      }
    }
  `, {
    productId,
    variants: desired.map(v => ({
      id: v.id,
      inventoryItem: { sku: v.sku },
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      optionValues: [{ optionName: "Package", name: v.title }]
    }))
  });

  console.log('Update result:', JSON.stringify(res, null, 2));

  // Verify
  const fresh = await adminGraphql(`{
    product(id: "${productId}") {
      id
      title
      options {
        name
        values
      }
      variants(first: 10) {
        nodes {
          id
          title
          sku
          price
          compareAtPrice
          inventoryPolicy
        }
      }
    }
  }`);
  console.log('Fresh product:', JSON.stringify(fresh.product, null, 2));
}

main().catch(console.error);
