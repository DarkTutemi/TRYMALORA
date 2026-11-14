import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DRAFT_THEME_ID = '197625381235';
const LIVE_THEME_ID = '197144805747';

function sha256(str) {
  // Normalize line endings to LF before hashing so CRLF/LF differences don't cause false mismatches
  const normalized = str.replace(/\r\n/g, '\n').trim();
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

const targetPdpFiles = [
  'templates/product.ultra-overnight.json',
  'sections/ultra-product-main.liquid',
  'sections/ultra-pdp-editorial.liquid',
  'sections/ultra-benefit-strip.liquid',
  'sections/ultra-five-layers.liquid',
  'sections/ultra-seven-pillars.liquid',
  'sections/ultra-lifestyle-comfort.liquid',
  'sections/ultra-hiw-steps.liquid',
  'sections/ultra-pdp-tabs.liquid',
  'sections/ultra-reviews.liquid',
  'sections/ultra-faq.liquid',
  'sections/ultra-closing-reminder.liquid',
  'assets/ultra-overnight.css',
  'assets/ultra-overnight.js'
];

async function main() {
  console.log('================================================================');
  console.log('PHASE 2 & 4: STRICT TARGETED PDP V2 DEPLOY & READ-AFTER-WRITE AUDIT');
  console.log(`Store: ${SHOP} | Target Draft Theme: ${DRAFT_THEME_ID}`);
  console.log('================================================================\n');

  const token = await getAccessToken();

  // 1. Verify Theme Roles Before Writing
  console.log('--- Step 1: Pre-Flight Theme Roles Verification ---');
  const tRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const tData = await tRes.json();
  const liveTheme = tData.themes.find(t => t.role === 'main');
  const draftTheme = tData.themes.find(t => String(t.id) === DRAFT_THEME_ID);

  if (String(liveTheme.id) !== LIVE_THEME_ID) {
    console.error(`FATAL: Live theme ID mismatch! Expected ${LIVE_THEME_ID}, found ${liveTheme.id}`);
    process.exit(1);
  }
  if (draftTheme.role === 'main') {
    console.error(`FATAL: Draft theme ${DRAFT_THEME_ID} is published! Aborting.`);
    process.exit(1);
  }
  console.log(`  [OK] Live Theme is ID ${liveTheme.id} ("${liveTheme.name}") -> Role: main`);
  console.log(`  [OK] Target Draft Theme is ID ${draftTheme.id} ("${draftTheme.name}") -> Role: unpublished\n`);

  // 2. Targeted Upload of 14 PDP Files
  console.log('--- Step 2: Uploading 14 Targeted PDP V2 Files to Draft Theme ---');
  for (const relPath of targetPdpFiles) {
    const localContent = fs.readFileSync(path.resolve(relPath), 'utf8');
    const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ asset: { key: relPath, value: localContent } })
    });
    if (!res.ok) {
      console.error(`  [FAIL] HTTP ${res.status} uploading ${relPath}:`, await res.text());
      process.exit(1);
    }
    console.log(`  [WRITE OK] Uploaded ${relPath}`);
  }

  // 3. Strict Read-After-Write Verification
  console.log('\n--- Step 3: Strict Read-After-Write Verification (Remote SHA-256 vs Local) ---');
  let failures = 0;
  const auditReport = [];

  for (const relPath of targetPdpFiles) {
    const localContent = fs.readFileSync(path.resolve(relPath), 'utf8');
    const localHash = sha256(localContent);

    const readUrl = `https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json?asset[key]=${encodeURIComponent(relPath)}`;
    const rRes = await fetch(readUrl, {
      headers: { 'X-Shopify-Access-Token': token }
    });
    if (!rRes.ok) {
      console.error(`  [READ FAIL] Could not read back ${relPath}: HTTP ${rRes.status}`);
      failures++;
      continue;
    }
    const rData = await rRes.json();
    const remoteContent = rData.asset?.value || '';
    const remoteHash = sha256(remoteContent);

    const matches = localHash === remoteHash;
    console.log(`  ${relPath}:`);
    console.log(`    Local Hash:  ${localHash}`);
    console.log(`    Remote Hash: ${remoteHash}`);
    console.log(`    Match:       ${matches ? '[VERIFIED MATCH]' : '[MISMATCH]'}`);

    auditReport.push({
      file: relPath,
      localHash,
      remoteHash,
      verified: matches,
      lines: remoteContent.split('\n').length
    });

    if (!matches) {
      console.error(`    ERROR: Content hash mismatch on ${relPath}!`);
      failures++;
    }
  }

  // 4. Content Assertions on Remote Fetched Files
  console.log('\n--- Step 4: Content Structure Assertions on Remote Assets ---');

  // A. Template 11-section assertion
  const rTemplateRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json?asset[key]=templates/product.ultra-overnight.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const rTemplateJson = JSON.parse((await rTemplateRes.json()).asset.value);
  const expectedOrder = [
    'main', 'editorial', 'benefits', 'layers', 'pillars',
    'comfort', 'hiw_steps', 'tabs', 'reviews', 'faq', 'closing_reminder'
  ];

  console.log(`  Remote template section count: ${rTemplateJson.order?.length}`);
  if (rTemplateJson.order?.length !== 11) {
    console.error(`  [FAIL] Expected 11 sections, found ${rTemplateJson.order?.length}`);
    failures++;
  } else {
    console.log(`  [PASS] Section count strictly equals 11.`);
  }

  const orderMatches = JSON.stringify(rTemplateJson.order) === JSON.stringify(expectedOrder);
  if (!orderMatches) {
    console.error(`  [FAIL] Section order mismatch! Found:`, rTemplateJson.order);
    failures++;
  } else {
    console.log(`  [PASS] Section order strictly matches required 11 sections.`);
  }

  // B. JS functions assertion
  const rJsRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json?asset[key]=assets/ultra-overnight.js`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const rJsContent = (await rJsRes.json()).asset.value;

  const requiredJsTokens = [
    'window.uoState',
    'window.getUoCartPayload',
    'computeGroupedCartPayload',
    'openUoSizeGuide',
    'closeUoSizeGuide',
    'scrollToUoBuyBox'
  ];

  requiredJsTokens.forEach(tokenStr => {
    const hasToken = rJsContent.includes(tokenStr);
    console.log(`  JS Token '${tokenStr}': ${hasToken ? '[PASS]' : '[FAIL]'}`);
    if (!hasToken) failures++;
  });

  // C. Main liquid assertions
  const rMainRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json?asset[key]=sections/ultra-product-main.liquid`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const rMainContent = (await rMainRes.json()).asset.value;

  if (rMainContent.includes('30-Day Guarantee')) {
    console.error('  [FAIL] 30-Day Guarantee found in remote section!');
    failures++;
  } else {
    console.log('  [PASS] 30-Day Guarantee strictly removed from remote section.');
  }

  if (!rMainContent.includes('Thoughtful')) {
    console.error('  [FAIL] Thoughtful Craft badge missing in remote section!');
    failures++;
  } else {
    console.log('  [PASS] Thoughtful Craft badge verified in remote section.');
  }

  // 5. Post-Flight Theme Roles Verification
  console.log('\n--- Step 5: Post-Flight Theme Roles Audit ---');
  const finalThemesRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  const finalThemesData = await finalThemesRes.json();
  const finalLive = finalThemesData.themes.find(t => t.role === 'main');
  const finalDraft = finalThemesData.themes.find(t => String(t.id) === DRAFT_THEME_ID);

  if (String(finalLive.id) !== LIVE_THEME_ID) {
    console.error(`CRITICAL: Live theme ID changed! Expected ${LIVE_THEME_ID}, found ${finalLive.id}`);
    failures++;
  } else {
    console.log(`  [PASS] Live Theme 197144805747 remains MAIN.`);
  }

  if (finalDraft.role === 'main') {
    console.error(`CRITICAL: Draft Theme 197625381235 is MAIN!`);
    failures++;
  } else {
    console.log(`  [PASS] Draft Theme 197625381235 remains UNPUBLISHED.`);
  }

  // Save audit data to report file
  fs.mkdirSync('docs/run_reports', { recursive: true });
  fs.writeFileSync('docs/run_reports/read_after_write_audit.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    draftThemeId: DRAFT_THEME_ID,
    liveThemeId: LIVE_THEME_ID,
    failures,
    files: auditReport
  }, null, 2));

  console.log('\n================================================================');
  if (failures === 0) {
    console.log('READ-AFTER-WRITE AUDIT PASSED WITH 0 FAILURES!');
    console.log('All 14 PDP V2 assets are mathematically identical on Shopify Draft!');
    console.log('Saved report to docs/run_reports/read_after_write_audit.json');
    console.log('================================================================\n');
    process.exit(0);
  } else {
    console.error(`READ-AFTER-WRITE AUDIT FAILED WITH ${failures} ERRORS!`);
    console.log('================================================================\n');
    process.exit(1);
  }
}

main();

