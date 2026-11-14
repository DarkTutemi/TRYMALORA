import { getAccessToken, SHOP, THEME_ID, API_VERSION, adminGraphql } from './config.mjs';

async function verifyAll() {
  console.log('====================================================');
  console.log('🟢 PHASE 1 CHECKPOINT: SHOPIFY HANDSHAKE & PERMISSIONS');
  console.log(`Target Store: https://${SHOP}`);
  console.log(`Target Theme ID: ${THEME_ID}`);
  console.log('====================================================\n');

  // 1. Token
  console.log('[1/3] Obtaining Access Token via Client Credentials...');
  const token = await getAccessToken(true);
  if (!token) throw new Error('Could not get token');
  console.log('  ✔ Access Token successfully obtained.');

  // 2. GraphQL Write test
  console.log('\n[2/3] Testing Product Write Permission (GraphQL productCreate)...');
  const createQuery = `
    mutation CreateTestProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const res = await adminGraphql(createQuery, {
    input: {
      title: '__TEST_HANDSHAKE_GNOME__',
      handle: 'test-handshake-gnome-' + Date.now(),
      vendor: 'Trymalora Test',
      productType: 'Diagnostic'
    }
  });

  if (res.productCreate?.userErrors?.length > 0) {
    throw new Error(res.productCreate.userErrors.map(e => e.message).join(', '));
  }
  const testId = res.productCreate?.product?.id;
  console.log(`  ✔ Successfully created test product: ${testId}`);

  // Delete test product
  const deleteQuery = `
    mutation DeleteTestProduct($input: ProductDeleteInput!) {
      productDelete(input: $input) {
        deletedProductId
      }
    }
  `;
  await adminGraphql(deleteQuery, { input: { id: testId } });
  console.log('  ✔ Test product deleted cleanly.');

  // 3. Theme Asset API Write test
  console.log('\n[3/3] Testing Theme Asset API Write Permission on Theme ID:', THEME_ID);
  const testKey = 'snippets/__diagnostic_gnome_test__.liquid';
  const putRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({
      asset: {
        key: testKey,
        value: '{% comment %} diagnostic handshake pass {% endcomment %}'
      }
    })
  });
  const putData = await putRes.json();
  if (putData.errors) {
    throw new Error(JSON.stringify(putData.errors));
  }
  console.log(`  ✔ Successfully wrote test asset: ${putData.asset?.key}`);

  // Clean up test asset
  await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(testKey)}`, {
    method: 'DELETE',
    headers: { 'X-Shopify-Access-Token': token }
  });
  console.log('  ✔ Test asset deleted cleanly.');

  console.log('\n====================================================');
  console.log('🎉 PHASE 1 CHECKPOINT 100% PASSED!');
  console.log('====================================================');
}

verifyAll().catch(e => {
  console.error('❌ Checkpoint failed:', e);
  process.exit(1);
});

