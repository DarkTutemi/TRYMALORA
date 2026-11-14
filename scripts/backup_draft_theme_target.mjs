import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';

async function backup() {
  const token = await getAccessToken();
  const backupDir = path.resolve('docs/backups/shopify_draft_theme_197625381235_phase1_audit');
  fs.mkdirSync(backupDir, { recursive: true });

  const targetFiles = [
    'templates/product.ultra-overnight.json',
    'templates/index.json',
    'templates/page.about-us.json',
    'templates/page.track-order.json',
    'templates/page.faq.json',
    'templates/page.contact.json',
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
    'sections/ultra-header.liquid',
    'sections/ultra-hero.liquid',
    'sections/ultra-footer.liquid',
    'sections/ultra-about-story.liquid',
    'sections/ultra-track-order.liquid',
    'sections/ultra-contact.liquid',
    'sections/willa-header.liquid',
    'sections/willa-footer.liquid',
    'sections/willa-cart-drawer.liquid',
    'assets/ultra-overnight.css',
    'assets/ultra-overnight.js',
    'assets/ultra-logo.svg',
    'assets/ultra-logo-white.svg',
    'layout/theme.liquid'
  ];

  console.log(`Backing up ${targetFiles.length} key assets from Draft Theme 197625381235...`);

  let count = 0;
  for (const key of targetFiles) {
    try {
      const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/themes/197625381235/assets.json?asset[key]=${encodeURIComponent(key)}`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.asset && data.asset.value) {
          const dest = path.join(backupDir, key);
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.writeFileSync(dest, data.asset.value, 'utf8');
          count++;
          console.log(`  [BACKED UP] ${key}`);
        }
      } else {
        console.warn(`  [NOT ON THEME YET] ${key}`);
      }
    } catch(e) {
      console.error(`  [ERROR] ${key}:`, e.message);
    }
  }

  console.log(`\nSuccessfully backed up ${count} / ${targetFiles.length} target files to ${backupDir}`);
}

backup();

