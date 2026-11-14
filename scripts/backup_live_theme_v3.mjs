import fs from 'fs';
import path from 'path';
import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

const THEME_ID = '197625381235';
const backupDir = 'docs/backups/shopify_live_theme_197625381235_before_v3';
if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

const filesToBackup = [
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

async function backup() {
  const token = await getAccessToken();
  console.log(`Starting backup of ${filesToBackup.length} files from Live Theme ${THEME_ID}...`);
  for (const f of filesToBackup) {
    const url = `https://${SHOP}/admin/api/${API_VERSION}/themes/${THEME_ID}/assets.json?asset[key]=${encodeURIComponent(f)}`;
    const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': token } });
    if (res.ok) {
      const data = await res.json();
      const targetPath = path.join(backupDir, f);
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.writeFileSync(targetPath, data.asset.value || '', 'utf8');
      console.log(`Backed up: ${f} (${(data.asset.value || '').length} bytes)`);
    } else {
      console.log(`Warning: Failed to fetch ${f} (Status: ${res.status})`);
    }
  }
  console.log('Backup complete. Saved to:', backupDir);
}

backup().catch(err => {
  console.error('Backup error:', err);
  process.exit(1);
});
