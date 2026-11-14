import { adminGraphql } from './config.mjs';

async function setTemplateSuffix() {
  const productId = "gid://shopify/Product/15650950283635";
  console.log('Setting templateSuffix to "christmas-lantern-welcome-gnome"...');

  const updateMutation = `
    mutation setSuffix($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
          templateSuffix
          onlineStoreUrl
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const res = await adminGraphql(updateMutation, {
    input: {
      id: productId,
      templateSuffix: "christmas-lantern-welcome-gnome"
    }
  });

  if (res.productUpdate?.userErrors?.length > 0) {
    console.error('Errors:', res.productUpdate.userErrors);
  } else {
    console.log('✔ Product templateSuffix updated:', res.productUpdate.product);
  }
}

setTemplateSuffix().catch(console.error);

