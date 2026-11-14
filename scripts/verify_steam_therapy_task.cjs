const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-steam-eye';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';

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
  const port = 9385;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,2400'
  ]);

  const ws = new WebSocket(await getWsUrl(port));
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
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });

  console.log('Navigating to Live PDP: https://trymalora.com/products/eyvelle-steam-therapy ...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/eyvelle-steam-therapy' });
  await new Promise(r => setTimeout(r, 4500));

  // Clear cart
  await send('Runtime.evaluate', {
    expression: `fetch('/cart/clear.js', { method: 'POST' })`
  });
  await new Promise(r => setTimeout(r, 1000));
  await send('Page.reload');
  await new Promise(r => setTimeout(r, 3500));

  // 1. Verify Hero & Buy Box Details
  const heroData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const title = document.querySelector('.zv-pdp-title')?.textContent?.trim();
        const score = document.querySelector('.zv-tp-score')?.textContent?.trim();
        const rating = document.querySelector('.zv-tp-count')?.textContent?.trim();
        const lead = document.querySelector('.zv-pdp-lead')?.textContent?.trim();
        const bullets = Array.from(document.querySelectorAll('.zv-pdp-benefits li span')).map(s => s.textContent.trim());
        const cards = Array.from(document.querySelectorAll('.zv-eye-bundle-card')).map(c => ({
          tier: c.getAttribute('data-bundle-tier'),
          name: c.getAttribute('data-bundle-name'),
          badge: c.querySelector('.zv-bundle-card-badge')?.textContent?.trim() || '',
          title: c.querySelector('.zv-bundle-card-name')?.textContent?.trim(),
          total: c.querySelector('[data-role="bundle-total"]')?.textContent?.trim(),
          unit: c.querySelector('[data-role="bundle-unit"]')?.textContent?.trim(),
          selected: c.classList.contains('selected')
        }));
        const upsell = {
          exists: !!document.getElementById('zvEyeUpsellCheck'),
          title: document.querySelector('#zvEyeUpsellBox .zv-upsell-title')?.textContent?.trim(),
          price: document.querySelector('#zvEyeUpsellBox .zv-upsell-price')?.textContent?.trim(),
          desc: document.querySelector('#zvEyeUpsellBox .zv-upsell-desc')?.textContent?.trim()
        };
        const atc = document.getElementById('zvBtnClaimLabel')?.textContent?.trim();
        return { title, score, rating, lead, bullets, cards, upsell, atc };
      })()
    `,
    returnByValue: true
  });

  console.log('--- [QA 1] HERO & BUY BOX DETAILS ---');
  console.log(JSON.stringify(heroData.result.value, null, 2));

  // Screenshot Desktop Hero
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_desktop_hero.png'), Buffer.from(ss1.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_desktop_hero.png');

  // 2. Interactivity: Tier Selection & Upsell Toggle
  console.log('\n--- [QA 2] TESTING BUNDLE TIERS & UPSELL TOGGLE ---');
  
  // Click Tier 1
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.zv-eye-bundle-card[data-bundle-tier="1"]').click()`
  });
  await new Promise(r => setTimeout(r, 600));
  const t1Res = await send('Runtime.evaluate', {
    expression: `document.getElementById('zvBtnClaimLabel').textContent.trim()`,
    returnByValue: true
  });
  console.log('Tier 1 Click -> CTA Label:', t1Res.result.value);

  // Click Tier 3
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.zv-eye-bundle-card[data-bundle-tier="3"]').click()`
  });
  await new Promise(r => setTimeout(r, 600));
  const t3Res = await send('Runtime.evaluate', {
    expression: `document.getElementById('zvBtnClaimLabel').textContent.trim()`,
    returnByValue: true
  });
  console.log('Tier 3 Click -> CTA Label:', t3Res.result.value);

  // Click Tier 2 (Default selected)
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.zv-eye-bundle-card[data-bundle-tier="2"]').click()`
  });
  await new Promise(r => setTimeout(r, 600));
  const t2Res = await send('Runtime.evaluate', {
    expression: `document.getElementById('zvBtnClaimLabel').textContent.trim()`,
    returnByValue: true
  });
  console.log('Tier 2 Click -> CTA Label:', t2Res.result.value);

  // Click Upsell Checkbox
  await send('Runtime.evaluate', {
    expression: `document.getElementById('zvEyeUpsellCheck').click()`
  });
  await new Promise(r => setTimeout(r, 600));
  const t2UpsellRes = await send('Runtime.evaluate', {
    expression: `document.getElementById('zvBtnClaimLabel').textContent.trim()`,
    returnByValue: true
  });
  console.log('Tier 2 + Upsell Checked -> CTA Label:', t2UpsellRes.result.value);

  const ssUpsell = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_buybox_upsell.png'), Buffer.from(ssUpsell.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_buybox_upsell.png');

  // 3. Add to Cart & Verify Cart Drawer lines
  console.log('\n--- [QA 3] ADD TO CART EXECUTION ---');
  await send('Runtime.evaluate', {
    expression: `document.getElementById('zvBtnClaim').click()`
  });
  await new Promise(r => setTimeout(r, 3000));

  const cartState = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const res = await fetch('/cart.js');
        const cart = await res.json();
        return {
          item_count: cart.item_count,
          total_price_formatted: '$' + (cart.total_price / 100).toFixed(2),
          items: cart.items.map(i => ({
            id: i.id,
            product_title: i.product_title,
            variant_title: i.variant_title,
            price_formatted: '$' + (i.price / 100).toFixed(2),
            quantity: i.quantity,
            properties: i.properties
          }))
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Cart State:', JSON.stringify(cartState.result.value, null, 2));

  const ssCart = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_cart_drawer.png'), Buffer.from(ssCart.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_cart_drawer.png');

  // 4. Test Editorial Sections (Videos, WebP, 3-step setup, FAQ, Reviews)
  console.log('\n--- [QA 4] EDITORIAL SECTIONS (VIDEOS, WEBP, FAQ, REVIEWS) ---');
  
  // Close cart drawer to view page
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.willa-cart-close, .willa-cart-backdrop')?.click()`
  });
  await new Promise(r => setTimeout(r, 1000));

  const editorialData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const videos = Array.from(document.querySelectorAll('video')).map(v => v.src);
        const webps = Array.from(document.querySelectorAll('img[src*=".webp"]')).map(i => i.src);
        const steps = Array.from(document.querySelectorAll('.tm-setup-col')).map(col => ({
          step: col.querySelector('.tm-setup-num')?.textContent?.trim(),
          title: col.querySelector('.tm-setup-step-title')?.textContent?.trim(),
          desc: col.querySelector('.tm-setup-step-desc')?.textContent?.trim(),
          hasImage: !!col.querySelector('img')
        }));
        const faqs = Array.from(document.querySelectorAll('.tm-faq-item')).map(f => f.querySelector('.tm-faq-summary span')?.textContent?.trim());
        const reviews = {
          score: document.querySelector('.tm-rev-big-score')?.textContent?.trim(),
          count: document.querySelector('.tm-rev-count-label')?.textContent?.trim(),
          trust: document.querySelector('.tm-rev-trust-statement')?.textContent?.trim(),
          cardsCount: document.querySelectorAll('.tm-rev-card').length,
          firstReviewAuthor: document.querySelector('.tm-rev-card-author')?.textContent?.trim(),
          firstReviewContent: document.querySelector('.tm-rev-card-content')?.textContent?.trim()
        };
        return { videos, webpsCount: webps.length, steps, faqsCount: faqs.length, faqs, reviews };
      })()
    `,
    returnByValue: true
  });

  console.log('Editorial Data:', JSON.stringify(editorialData.result.value, null, 2));

  // Scroll to how it works and capture
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.tm-hiw-section')?.scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 1000));
  const ssHiw = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_how_it_works.png'), Buffer.from(ssHiw.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_how_it_works.png');

  // Scroll to reviews and capture
  await send('Runtime.evaluate', {
    expression: `document.getElementById('tmCustomerReviews')?.scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 1000));
  const ssReviews = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_reviews.png'), Buffer.from(ssReviews.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_reviews.png');

  // 5. Mobile Viewport Check (390x844)
  console.log('\n--- [QA 5] MOBILE VIEWPORT CHECK (390x844) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 0)` });
  await new Promise(r => setTimeout(r, 1000));

  const ssMobHero = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_mobile_hero.png'), Buffer.from(ssMobHero.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_mobile_hero.png');

  await send('Runtime.evaluate', {
    expression: `document.querySelector('.zv-bundle-cards')?.scrollIntoView({ behavior: 'instant' })`
  });
  await new Promise(r => setTimeout(r, 1000));

  const ssMobBuybox = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(artifactsDir, 'qa_steam_therapy_mobile_buybox.png'), Buffer.from(ssMobBuybox.data, 'base64'));
  console.log('[SAVED] qa_steam_therapy_mobile_buybox.png');

  // 6. Regression Check on ear-cleaner
  console.log('\n--- [QA 6] REGRESSION CHECK ON EAR-CLEANER ---');
  await send('Page.navigate', { url: 'https://trymalora.com/products/ear-cleaner' });
  await new Promise(r => setTimeout(r, 4000));

  const earData = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const title = document.querySelector('.zv-pdp-title')?.textContent?.trim();
        const cards = Array.from(document.querySelectorAll('.zv-ear-bundle-card')).map(c => ({
          name: c.getAttribute('data-bundle-name'),
          total: c.querySelector('[data-role="bundle-total"]')?.textContent?.trim()
        }));
        const subSelected = document.querySelector('#zvSubRecurring.selected') !== null;
        const upsell = document.getElementById('zvEarUpsellCheck') !== null;
        return { title, cards, subSelected, upsell };
      })()
    `,
    returnByValue: true
  });
  console.log('Ear Cleaner Regression:', JSON.stringify(earData.result.value, null, 2));

  console.log('\n=========================================');
  console.log('>>> ALL VERIFICATION CHECKS COMPLETED <<<');
  console.log('=========================================');

  ws.close();
  p.kill();
  process.exit(0);
})();
