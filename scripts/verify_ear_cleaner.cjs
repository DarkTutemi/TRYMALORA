const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-ear2';

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
  const port = 9358;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,2600']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d.result); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  console.log('--- Step 1: Navigating to Ear Cleaner PDP ---');
  await send('Page.navigate', { url: 'https://trymalora.com/products/ear-cleaner' });
  await new Promise(r => setTimeout(r, 4000));

  // 1. Inspect PDP Info
  const pdpInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const title = document.querySelector('.zv-pdp-title')?.innerText.trim();
        const badge = document.querySelector('.zv-pdp-save-badge')?.innerText.trim();
        const rating = document.querySelector('.zv-pdp-rating-row')?.innerText.replace(/\\s+/g, ' ').trim();
        const activePrice = document.querySelector('.zv-price-active')?.innerText.trim();
        const comparePrice = document.querySelector('.zv-price-compare')?.innerText.trim();
        const savings = document.querySelector('.zv-price-save-pill')?.innerText.trim();
        const shippingBadge = document.querySelector('#zvBundleShippingBadge')?.innerText.trim();

        const cards = Array.from(document.querySelectorAll('.zv-ear-bundle-card')).map(c => ({
          tier: c.getAttribute('data-bundle-tier'),
          name: c.getAttribute('data-bundle-name'),
          priceCents: c.getAttribute('data-price-cents'),
          selected: c.classList.contains('selected'),
          badge: c.querySelector('.zv-bundle-card-badge')?.innerText.trim(),
          title: c.querySelector('.zv-bundle-card-name')?.innerText.trim(),
          sub: c.querySelector('.zv-bundle-card-sub')?.innerText.trim(),
          total: c.querySelector('.zv-bundle-card-total')?.innerText.trim(),
          unit: c.querySelector('.zv-bundle-card-unit')?.innerText.replace(/\\s+/g, ' ').trim()
        }));

        const subOptions = Array.from(document.querySelectorAll('.zv-sub-option')).map(o => ({
          type: o.getAttribute('data-sub-type'),
          sellingPlanId: o.getAttribute('data-selling-plan-id'),
          selected: o.classList.contains('selected'),
          title: o.querySelector('.zv-sub-title')?.innerText.trim(),
          desc: o.querySelector('.zv-sub-desc')?.innerText.trim()
        }));

        const upsell = {
          title: document.querySelector('.zv-upsell-title')?.innerText.trim(),
          price: document.querySelector('.zv-upsell-price')?.innerText.trim(),
          desc: document.querySelector('.zv-upsell-desc')?.innerText.trim(),
          checked: document.querySelector('#zvEarUpsellCheck')?.checked
        };

        const thumbsCount = document.querySelectorAll('.zv-pdp-thumb').length;

        return {
          title, badge, rating, activePrice, comparePrice, savings, shippingBadge,
          cards, subOptions, upsell, thumbsCount
        };
      })()
    `,
    returnByValue: true
  });

  console.log('PDP Info:', JSON.stringify(pdpInfo.result.value, null, 2));

  // Clear cart first
  await send('Runtime.evaluate', {
    expression: `fetch('/cart/clear.js', { method: 'POST' })`,
    awaitPromise: true
  });

  // Toggle Upsell Checkbox
  console.log('\n--- Step 2: Checking Upsell Checkbox (Add 60 Finger Wipes) ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const chk = document.querySelector('#zvEarUpsellCheck');
        if (chk) {
          chk.checked = true;
          chk.dispatchEvent(new Event('change'));
        }
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Add to Cart
  console.log('\n--- Step 3: Clicking ADD TO CART ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#zvBtnClaim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  // Inspect Cart Drawer
  const cartInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const drawerActive = document.querySelector('#willaCartDrawer')?.classList.contains('active');
        const count = document.querySelector('#willaDrawerCount')?.innerText.trim();
        const subtotal = document.querySelector('.subtotal-val')?.innerText.trim();
        const shippingBar = document.querySelector('#willaShippingText')?.innerText.trim();
        const items = Array.from(document.querySelectorAll('.willa-cart-item')).map(it => ({
          title: it.querySelector('h4')?.innerText.trim(),
          variant: it.querySelector('.cart-item-variant')?.innerText.trim(),
          badge: it.querySelector('[style*="background"]')?.innerText.trim(),
          price: it.querySelector('.cart-item-price')?.innerText.replace(/\\s+/g, ' ').trim()
        }));
        return { drawerActive, count, subtotal, shippingBar, items };
      })()
    `,
    returnByValue: true
  });
  console.log('\n[CART DRAWER VERIFICATION]:', JSON.stringify(cartInfo.result.value, null, 2));

  // Take Cart Drawer Screenshot
  const shot1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_ear_cleaner_cart_drawer.png', Buffer.from(shot1.data, 'base64'));
  console.log('[OK] Saved qa_ear_cleaner_cart_drawer.png');

  // Proceed to Checkout
  console.log('\n--- Step 4: Navigating to Checkout ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const checkoutBtn = document.querySelector('.willa-checkout-btn');
        if (checkoutBtn) checkoutBtn.click();
        else window.location.href = '/checkout';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 6000));

  const checkoutUrl = await send('Runtime.evaluate', {
    expression: 'window.location.href',
    returnByValue: true
  });
  console.log('Checkout URL:', checkoutUrl.result.value);

  const checkoutSummary = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const lines = Array.from(document.querySelectorAll('[data-checkout-subtotal-price-target], [role="row"], .product, div[data-line-item]')).map(el => el.innerText.replace(/\\s+/g, ' ').trim()).filter(t => t.length > 0 && t.length < 200);
        const prices = Array.from(document.body.innerText.match(/\\$\\d+\\.\\d{2}/g) || []);
        return {
          bodySnippet: document.body.innerText.slice(0, 1200),
          detectedPrices: Array.from(new Set(prices))
        };
      })()
    `,
    returnByValue: true
  });
  console.log('\n[CHECKOUT SUMMARY]:\n', checkoutSummary.result.value.bodySnippet.slice(0, 500));
  console.log('Detected Prices at Checkout:', checkoutSummary.result.value.detectedPrices);

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_ear_cleaner_checkout.png', Buffer.from(shot2.data, 'base64'));
  console.log('[OK] Saved qa_ear_cleaner_checkout.png');

  p.kill();
  process.exit(0);
})();
