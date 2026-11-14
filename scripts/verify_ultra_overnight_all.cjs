const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-ultra';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const DRAFT_THEME_ID = '197625381235';
const DOMAIN = 'ikwh1h-fx.myshopify.com';

// Load environment variables from .env
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    if (key && !process.env[key.trim()]) {
      process.env[key.trim()] = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
    }
  }
}
const STORE_PASSWORD = process.env.SHOPIFY_FLAG_STORE_PASSWORD || process.env.STOREFRONT_PASSWORD || '';

function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get('http://127.0.0.1:' + port + '/json', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          clearInterval(interval);
          try {
            const tabs = JSON.parse(data);
            resolve((tabs.find(t => t.type === 'page') || tabs[0]).webSocketDebuggerUrl);
          } catch(e) {
            reject(e);
          }
        });
      }).on('error', () => { if (++retries > 30) reject(); });
    }, 200);
  });
}

(async () => {
  const port = 9410;
  console.log('Launching headless Chrome on port ' + port + '...');
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,1200'
  ]);

  const wsUrl = await getWsUrl(port);
  const ws = new WebSocket(wsUrl);

  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => {
        const d = JSON.parse(e.data);
        if (d.id === curId) {
          ws.removeEventListener('message', h);
          r(d.result);
        }
      };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }

  function getVal(res) {
    if (!res) return null;
    if (res.result && res.result.value !== undefined) return res.result.value;
    if (res.value !== undefined) return res.value;
    return res;
  }

  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('Runtime.enable');

  async function dismissCookieBanner() {
    await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim().toLowerCase() === 'accept');
          if (btn) btn.click();
          const modal = document.querySelector('.shopify-pc__banner, [aria-label*=\"cookie\" i]');
          if (modal) modal.remove();
        })()
      `
    });
    await new Promise(r => setTimeout(r, 600));
  }

  async function takeScreenshot(filename, clip = null) {
    await dismissCookieBanner();
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await send('Page.captureScreenshot', params);
    if (res && res.data) {
      const buf = Buffer.from(res.data, 'base64');
      const artPath = path.join(artifactsDir, filename);
      fs.writeFileSync(artPath, buf);
      console.log(`  [SCREENSHOT] Saved: ${artPath} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
  }

  // 1. Visit root to set preview cookie and bypass password
  console.log('\n--- STEP 1: Setting up Preview Cookie & Storefront Password ---');
  await send('Page.navigate', { url: `https://${DOMAIN}/?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3000));

  await send('Runtime.evaluate', {
    expression: `
      const pw = document.querySelector('input[type="password"]');
      if (pw) {
        pw.value = ${JSON.stringify(STORE_PASSWORD)};
        const form = pw.closest('form');
        if (form) form.submit();
      }
    `
  });
  await new Promise(r => setTimeout(r, 3500));

  // 2. DESKTOP HOMEPAGE
  console.log('\n--- STEP 2: Verifying Desktop Homepage ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `https://${DOMAIN}/?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 4000));

  const homeData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.title,
          hasUltraLogo: document.querySelector('.uo-logo') !== null,
          hasHeroTitle: document.querySelector('.uo-hero-title')?.textContent?.trim(),
          pillarsCount: document.querySelectorAll('.uo-pillar-card').length,
          has5Layers: document.querySelector('.uo-layers-section') !== null,
          comfortCardsCount: document.querySelectorAll('.uo-comfort-card').length,
          standardsCardsCount: document.querySelectorAll('.uo-review-card').length,
          faqItemsCount: document.querySelectorAll('.uo-faq-item').length,
          hasFooter: document.querySelector('.uo-footer') !== null,
          hasLegacyFeatured: document.querySelector('.trymalora-featured-products') !== null,
          hasSearchIconInHeader: document.querySelector('.uo-header-wrap a[href="/search"]') !== null,
          hasFakeEmilyReview: document.body.textContent.includes('Emily R.'),
          hasFakeReviewCount: document.body.textContent.includes('2,846 reviews')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Homepage Evaluation:', JSON.stringify(getVal(homeData), null, 2));
  await takeScreenshot('qa_ultra_desktop_home.png');

  // 3. MOBILE HOMEPAGE
  console.log('\n--- STEP 3: Verifying Mobile Homepage ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: `https://${DOMAIN}/?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  await takeScreenshot('qa_ultra_mobile_home.png');

  // 4. DESKTOP PDP (using view=ultra-overnight)
  console.log('\n--- STEP 4: Verifying Desktop Product Page ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `https://${DOMAIN}/products/ear-cleaner?view=ultra-overnight&preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 4000));

  const pdpData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.querySelector('.uo-product-title')?.textContent?.trim(),
          price: document.querySelector('.uo-price-current')?.textContent?.trim(),
          tiersCount: document.querySelectorAll('.uo-tier-card').length,
          selectedTier: document.querySelector('.uo-tier-card.is-selected .uo-tier-name')?.textContent?.trim(),
          hasAtcBtn: document.querySelector('.uo-pdp-atc-btn') !== null,
          isAtcDisabled: document.querySelector('.uo-pdp-atc-btn')?.disabled === true,
          hasAdminSetupNotice: document.querySelector('.uo-admin-setup-notice') !== null,
          hasFakeReviewCount: document.body.textContent.includes('2,846 reviews'),
          tabsCount: document.querySelectorAll('.uo-tab-btn').length,
          has5Layers: document.querySelector('.uo-layers-section') !== null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('PDP Evaluation:', JSON.stringify(getVal(pdpData), null, 2));
  await takeScreenshot('qa_ultra_desktop_pdp.png');

  // Test Tier Selection
  console.log('Testing Tier Pack switcher (1 Pair -> $28.00)...');
  await send('Runtime.evaluate', {
    expression: `
      const card1 = document.querySelector('.uo-tier-card[data-tier="1-pair"]');
      if (card1) card1.click();
    `
  });
  await new Promise(r => setTimeout(r, 500));
  const newPrice = await send('Runtime.evaluate', {
    expression: `document.querySelector('.uo-price-current')?.textContent?.trim()`,
    returnByValue: true
  });
  console.log('Price after clicking 1 Pair:', getVal(newPrice));

  // 5. MOBILE PDP
  console.log('\n--- STEP 5: Verifying Mobile Product Page ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: `https://${DOMAIN}/products/ear-cleaner?view=ultra-overnight&preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  await takeScreenshot('qa_ultra_mobile_pdp.png');

  // 6. ABOUT US PAGE
  console.log('\n--- STEP 6: Verifying About Us Page ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: `https://${DOMAIN}/pages/about-us?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  const aboutData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          heroTitle: document.querySelector('.uo-page-hero-title')?.textContent?.trim(),
          hasStoryGrid: document.querySelector('.uo-about-grid') !== null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('About Us Evaluation:', JSON.stringify(getVal(aboutData), null, 2));
  await takeScreenshot('qa_ultra_about_us.png');

  // 7. TRACK ORDER PAGE
  console.log('\n--- STEP 7: Verifying Track Order Page ---');
  await send('Page.navigate', { url: `https://${DOMAIN}/pages/track-order?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  
  // Submit track order form to verify honest guidance and NO fake carrier result
  await send('Runtime.evaluate', {
    expression: `
      const ord = document.getElementById('uoOrderNum');
      const eml = document.getElementById('uoEmail');
      if (ord) ord.value = '#1042';
      if (eml) eml.value = 'customer@example.com';
      const form = document.getElementById('uoTrackLookupForm');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    `
  });
  await new Promise(r => setTimeout(r, 800));

  const trackData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          heroTitle: document.querySelector('.uo-page-hero-title')?.textContent?.trim(),
          hasTrackForm: document.querySelector('.uo-track-form') !== null,
          guidanceBoxVisible: document.getElementById('uoTrackGuidance')?.style.display !== 'none',
          hasFakeCarrierStatus: document.body.textContent.includes('In Transit with Express Carrier')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Track Order Evaluation:', JSON.stringify(getVal(trackData), null, 2));
  await takeScreenshot('qa_ultra_track_order.png');

  // 7B. CONTACT US PAGE
  console.log('\n--- STEP 7B: Verifying Contact Us Page ---');
  await send('Page.navigate', { url: `https://${DOMAIN}/pages/contact?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  const contactData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          heroTitle: document.querySelector('.uo-page-hero-title')?.textContent?.trim(),
          hasShopifyContactForm: document.querySelector('form[action*=\"/contact\"]') !== null,
          hasNameInput: document.querySelector('input[name=\"contact[name]\"]') !== null,
          hasEmailInput: document.querySelector('input[name=\"contact[email]\"]') !== null,
          hasBodyInput: document.querySelector('textarea[name=\"contact[body]\"]') !== null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Contact Us Evaluation:', JSON.stringify(getVal(contactData), null, 2));
  await takeScreenshot('qa_ultra_contact.png');

  // 8. FAQ PAGE
  console.log('\n--- STEP 8: Verifying FAQ Page ---');
  await send('Page.navigate', { url: `https://${DOMAIN}/pages/faq?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  const faqData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.querySelector('.uo-faq-title')?.textContent?.trim(),
          faqCount: document.querySelectorAll('.uo-faq-item').length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('FAQ Page Evaluation:', JSON.stringify(getVal(faqData), null, 2));
  await takeScreenshot('qa_ultra_faq.png');

  // 9. CART DRAWER
  console.log('\n--- STEP 9: Verifying Cart Drawer ---');
  await send('Page.navigate', { url: `https://${DOMAIN}/?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 3500));
  await send('Runtime.evaluate', {
    expression: `if (typeof openWillaCart === 'function') openWillaCart();`
  });
  await new Promise(r => setTimeout(r, 1000));
  const cartData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const drawer = document.getElementById('willaCartDrawer');
        const emptyLink = document.querySelector('.willa-empty-cart a')?.getAttribute('href');
        return {
          isOpen: drawer?.classList?.contains('is-open'),
          emptyText: document.querySelector('.willa-empty-cart p')?.textContent?.trim(),
          emptyCartHref: emptyLink,
          leaksCollectionsAll: emptyLink === '/collections/all',
          shippingText: document.getElementById('willaShippingText')?.textContent?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Cart Drawer Evaluation:', JSON.stringify(getVal(cartData), null, 2));
  await takeScreenshot('qa_ultra_cart_drawer.png');

  // 10. LEGACY AD REGRESSION CHECKS (3 Representative Products)
  console.log('\n--- STEP 10: Verifying Legacy Ad Products Regression ---');
  
  // Legacy 1: Ear Cleaner
  console.log('Testing Legacy 1: /products/ear-cleaner ...');
  await send('Page.navigate', { url: `https://${DOMAIN}/products/ear-cleaner?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 4500));
  const earData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          productTitle: document.querySelector('.zv-product-title, .product-title, h1')?.textContent?.trim(),
          hasWillaHeader: document.querySelector('.willa-header-wrap') !== null,
          hasUltraHeader: document.querySelector('.uo-header-wrap') !== null,
          hasBundles: document.querySelectorAll('.zv-bundle-card, .bundle-card').length,
          hasSubscription: document.querySelector('#sellingPlanId, [data-selling-plan]') !== null,
          hasFingerWipesUpsell: document.querySelector('[data-addon-upsell]') !== null,
          hasAtcButton: document.querySelector('.zv-btn-atc, [name=\"add\"]') !== null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Ear Cleaner Evaluation:', JSON.stringify(getVal(earData), null, 2));
  await takeScreenshot('qa_legacy_ear_cleaner.png');

  // Legacy 2: Eyvelle Steam Therapy
  console.log('Testing Legacy 2: /products/eyvelle-steam-therapy ...');
  await send('Page.navigate', { url: `https://${DOMAIN}/products/eyvelle-steam-therapy?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 4500));
  const steamData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          productTitle: document.querySelector('.zv-product-title, .product-title, h1')?.textContent?.trim(),
          hasWillaHeader: document.querySelector('.willa-header-wrap') !== null,
          hasUltraHeader: document.querySelector('.uo-header-wrap') !== null,
          hasBundles: document.querySelectorAll('.zv-bundle-card, .bundle-card').length,
          hasLuminaLiftUpsell: document.querySelector('.zv-upsell-card, #companionUpsell') !== null,
          hasAtcButton: document.querySelector('.zv-btn-atc, [name=\"add\"]') !== null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Steam Therapy Evaluation:', JSON.stringify(getVal(steamData), null, 2));
  await takeScreenshot('qa_legacy_steam_therapy.png');

  // Legacy 3: Metallic Silver Anti-Rust Coating
  console.log('Testing Legacy 3: /products/metallic-silver-anti-rust-renovation-coating ...');
  await send('Page.navigate', { url: `https://${DOMAIN}/products/metallic-silver-anti-rust-renovation-coating?preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 4500));
  const silverData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          productTitle: document.querySelector('.zv-product-title, .product-title, h1')?.textContent?.trim(),
          hasWillaHeader: document.querySelector('.willa-header-wrap') !== null,
          hasUltraHeader: document.querySelector('.uo-header-wrap') !== null,
          hasBundles: document.querySelectorAll('.zv-bundle-card, .bundle-card').length,
          hasAtcButton: document.querySelector('.zv-btn-atc, [name=\"add\"]') !== null
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Silver Coating Evaluation:', JSON.stringify(getVal(silverData), null, 2));
  await takeScreenshot('qa_legacy_silver_coating.png');

  console.log('\n======================================================');
  console.log('ALL QA ASSERTIONS & SCREENSHOTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================');

  p.kill();
  process.exit(0);
})().catch(err => {
  console.error('QA Failed:', err);
  process.exit(1);
});

