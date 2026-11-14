import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import crypto from 'crypto';

const TARGET_THEME_ID = '197625381235';

function sha256(str) {
  const normalized = str.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

const filesToDeploy = [
  'sections/ultra-product-main.liquid',
  'sections/ultra-pdp-problem.liquid',
  'sections/ultra-pdp-editorial.liquid',
  'sections/ultra-five-layers.liquid',
  'sections/ultra-lifestyle-comfort.liquid',
  'sections/ultra-fabric-experience.liquid',
  'sections/ultra-choose-pack.liquid',
  'sections/ultra-hiw-steps.liquid',
  'sections/ultra-pdp-tabs.liquid',
  'sections/ultra-reviews.liquid',
  'sections/ultra-faq.liquid',
  'assets/ultra-overnight.css',
  'assets/ultra-overnight.js',
  'templates/product.ultra-overnight.json'
];

async function main() {
  console.log('================================================================');
  console.log('TRYMALORA — ULTRA OVERNIGHT PDP V3 LIVE THEME DEPLOYMENT & VERIFICATION');
  console.log(`Store: ${SHOP} | Target Live Theme ID: ${TARGET_THEME_ID}`);
  console.log('================================================================\n');

  const token = await getAccessToken();

  // 1. Verify Theme Role
  console.log('--- Step 1: Pre-Flight Live Theme Verification ---');
  const tRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (!tRes.ok) {
    console.error(`FATAL: Could not fetch theme ${TARGET_THEME_ID}! HTTP ${tRes.status}`);
    process.exit(1);
  }
  const tData = await tRes.json();
  console.log(`  Theme Name: "${tData.theme.name}"`);
  console.log(`  Theme Role: ${tData.theme.role}`);
  console.log(`  Updated At: ${tData.theme.updated_at}`);

  // 2. Deploy Files to Theme 197625381235
  console.log('\n--- Step 2: Uploading PDP V3 Assets to Theme ' + TARGET_THEME_ID + ' ---');
  const uploadResults = [];

  for (const f of filesToDeploy) {
    const localContent = fs.readFileSync(f, 'utf8');
    const localHash = sha256(localContent);

    const putRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}/assets.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token
      },
      body: JSON.stringify({
        asset: {
          key: f,
          value: localContent
        }
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      console.error(`  [FAIL] Upload failed for ${f}: HTTP ${putRes.status} - ${errText}`);
      process.exit(1);
    }

    const putData = await putRes.json();
    console.log(`  [UPLOADED] ${f} (${localContent.length} bytes, SHA: ${localHash.substring(0, 10)}...)`);
    uploadResults.push({ file: f, localHash, localLength: localContent.length });
  }

  // 3. Read-After-Write Cryptographic Audit
  console.log('\n--- Step 3: Read-After-Write Cryptographic Verification ---');
  let auditPassed = true;
  const verifiedList = [];

  for (const item of uploadResults) {
    const getRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${TARGET_THEME_ID}/assets.json?asset[key]=${encodeURIComponent(item.file)}`, {
      headers: { 'X-Shopify-Access-Token': token }
    });

    if (!getRes.ok) {
      console.error(`  [FAIL] Failed to re-read ${item.file} from Shopify Admin API! HTTP ${getRes.status}`);
      auditPassed = false;
      continue;
    }

    const getData = await getRes.json();
    const remoteValue = getData.asset?.value || '';
    const remoteHash = sha256(remoteValue);

    if (remoteHash === item.localHash) {
      console.log(`  [VERIFIED ✓] ${item.file}: HASH MATCH (${remoteHash.substring(0, 10)}...)`);
      verifiedList.push({ file: item.file, hash: remoteHash, length: remoteValue.length, status: 'MATCH' });
    } else {
      console.error(`  [MISMATCH ✗] ${item.file}: Local ${item.localHash.substring(0, 10)} !== Remote ${remoteHash.substring(0, 10)}`);
      auditPassed = false;
      verifiedList.push({ file: item.file, localHash: item.localHash, remoteHash, status: 'MISMATCH' });
    }
  }

  console.log('\n================================================================');
  if (auditPassed) {
    console.log('✓ 100% READ-AFTER-WRITE AUDIT PASSED: ALL 14 PDP V3 ASSETS VERIFIED ON SHOPIFY LIVE THEME ' + TARGET_THEME_ID);
  } else {
    console.error('✗ AUDIT FAILED! SOME ASSETS DID NOT MATCH REMOTE SHOPIFY CONTENT');
    process.exit(1);
  }
  console.log('================================================================\n');
}

main().catch(err => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
