import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';

const DRAFT_THEME_ID = '197625381235';
const PRODUCT_ID = '15664431104371';

async function main() {
  const token = await getAccessToken();

  // 1. Fetch Flagship Product Details from Shopify Admin
  console.log(`\n=== 1. FETCHING FLAGSHIP PRODUCT (${PRODUCT_ID}) ===`);
  const prodRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products/${PRODUCT_ID}.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (prodRes.ok) {
    const prodData = await prodRes.json();
    const p = prodData.product;
    console.log(`Product Found! Title: "${p.title}", Handle: "${p.handle}", Status: "${p.status}", Template: "${p.template_suffix}"`);
    console.log(`Variants count: ${p.variants?.length || 0}`);
    if (p.variants) {
      p.variants.forEach((v, i) => {
        console.log(`  [${i+1}] ID: ${v.id} | SKU: ${v.sku} | Title: "${v.title}" | Price: ${v.price} | Inv: ${v.inventory_quantity}`);
      });
    }
    fs.mkdirSync('docs/run_reports', { recursive: true });
    fs.writeFileSync('docs/run_reports/flagship_product_admin_data.json', JSON.stringify(prodData, null, 2));
    console.log('Saved product data to docs/run_reports/flagship_product_admin_data.json');
  } else {
    console.error(`Failed to fetch product ${PRODUCT_ID}:`, await prodRes.text());
  }

  // 2. Fetch Theme Info
  console.log(`\n=== 2. FETCHING THEME INFO (${DRAFT_THEME_ID}) ===`);
  const themeRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (themeRes.ok) {
    const themeData = await themeRes.json();
    console.log(`Theme: "${themeData.theme.name}", Role: "${themeData.theme.role}", Updated: "${themeData.theme.updated_at}"`);
  }

  // 3. List Assets from Draft Theme and Backup Key Files
  console.log(`\n=== 3. BACKING UP DRAFT THEME ASSETS ===`);
  const assetsRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json`, {
    headers: { 'X-Shopify-Access-Token': token }
  });
  if (assetsRes.ok) {
    const assetsData = await assetsRes.json();
    console.log(`Total assets on theme: ${assetsData.assets.length}`);

    const backupDir = 'docs/backups/shopify_draft_theme_197625381235';
    fs.mkdirSync(backupDir, { recursive: true });

    const keyAssets = assetsData.assets.filter(a => 
      a.key.startsWith('sections/ultra-') || 
      a.key.startsWith('templates/product.ultra') ||
      a.key.startsWith('assets/ultra-') ||
      a.key === 'templates/index.json' ||
      a.key === 'sections/willa-cart-drawer.liquid'
    );

    console.log(`Downloading ${keyAssets.length} key assets to ${backupDir}...`);
    for (const a of keyAssets) {
      const singleRes = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/${DRAFT_THEME_ID}/assets.json?asset[key]=${encodeURIComponent(a.key)}`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      if (singleRes.ok) {
        const singleData = await singleRes.json();
        const asset = singleData.asset;
        const targetPath = path.join(backupDir, asset.key);
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        if (asset.value) {
          fs.writeFileSync(targetPath, asset.value, 'utf8');
        } else if (asset.attachment) {
          fs.writeFileSync(targetPath, Buffer.from(asset.attachment, 'base64'));
        }
        console.log(`  [BACKUP] ${asset.key}`);
      }
    }
  }
}

main().catch(err => console.error(err));

