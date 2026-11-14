const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-ear-task';
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
  const port = 9370;
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
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d.result); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  console.log('Navigating to Live PDP: https://trymalora.com/products/ear-cleaner ...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/ear-cleaner' });
  await new Promise(r => setTimeout(r, 4500));

  // 1. Verify Bundle Order & Text
  const bundleOrder = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.zv-ear-bundle-card'));
        return cards.map((c, idx) => ({
          index: idx + 1,
          tier: c.getAttribute('data-bundle-tier'),
          name: c.getAttribute('data-bundle-name'),
          badge: c.querySelector('.zv-bundle-card-badge')?.textContent?.trim() || '',
          title: c.querySelector('.zv-bundle-card-name')?.textContent?.trim() || '',
          sub: c.querySelector('.zv-bundle-card-sub')?.textContent?.trim() || '',
          total: c.querySelector('[data-role="bundle-total"]')?.textContent?.trim() || '',
          unit: c.querySelector('[data-role="bundle-unit"]')?.textContent?.trim() || '',
          selected: c.classList.contains('selected')
        }));
      })()
    `,
    returnByValue: true
  });
  console.log('--- BUNDLE ORDER & DETAILS ---');
  console.log(JSON.stringify(bundleOrder.result.value, null, 2));

  // 2. Verify Subscription Default Selection & Badge
  const subState = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const recur = document.querySelector('#zvSubRecurring');
        const onetime = document.querySelector('#zvSubOneTime');
        return {
          recurringSelected: recur?.classList.contains('selected'),
          recurringBadge: recur?.querySelector('.zv-sub-badge')?.textContent?.trim(),
          recurringTitle: recur?.querySelector('.zv-sub-title')?.textContent?.trim(),
          onetimeSelected: onetime?.classList.contains('selected')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('--- SUBSCRIPTION SELECTOR STATE ---');
  console.log(JSON.stringify(subState.result.value, null, 2));

  // 3. Verify Capacity 100ml (Check for any leftover 120ml)
  const capacityCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const text = document.body.innerText;
        const matches120 = text.match(/120ml/gi) || [];
        const matches100 = text.match(/100ml/gi) || [];
        return {
          count120ml: matches120.length,
          count100ml: matches100.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('--- CAPACITY CHECK (100ml vs 120ml) ---');
  console.log(JSON.stringify(capacityCheck.result.value, null, 2));

  // 4. Test 6 Pricing Matrix Combinations
  console.log('\n--- TESTING 6 PRICING MATRIX COMBINATIONS ---');
  const testCases = [
    { tier: '1', sub: false, expected: '$34.99', label: 'Case 1: Buy 1 + One-time' },
    { tier: '1', sub: true,  expected: '$31.49', label: 'Case 2: Buy 1 + Subscription' },
    { tier: '2', sub: false, expected: '$62.98', label: 'Case 3: Buy 2 Get 2 FREE + One-time' },
    { tier: '2', sub: true,  expected: '$56.68', label: 'Case 4: Buy 2 Get 2 FREE + Subscription' },
    { tier: '3', sub: false, expected: '$111.97', label: 'Case 5: Buy 4 Get 4 FREE + One-time' },
    { tier: '3', sub: true,  expected: '$100.77', label: 'Case 6: Buy 4 Get 4 FREE + Subscription' }
  ];

  for (const tc of testCases) {
    const res = await send('Runtime.evaluate', {
      expression: `
        (() => {
          try {
            // Select tier
            const card = document.querySelector('.zv-ear-bundle-card[data-bundle-tier="${tc.tier}"]');
            if (card) card.click();

            // Select sub or onetime
            const opt = document.querySelector(${tc.sub ? "'#zvSubRecurring'" : "'#zvSubOneTime'"});
            if (opt) opt.click();

            const activePrice = document.querySelector('#zvPriceActive')?.textContent?.trim();
            const ctaPrice = document.querySelector('#zvBtnClaimLabel')?.textContent?.trim();
            return { activePrice, ctaPrice };
          } catch(e) {
            return { error: e.toString() };
          }
        })()
      `,
      returnByValue: true
    });
    if (!res || !res.result) {
      console.log('CDP Evaluate response unexpected:', res);
      continue;
    }
    const val = res.result.value || {};
    if (val.error) {
      console.log('Error inside browser:', val.error);
    }
    const pass = val.activePrice === tc.expected && (val.ctaPrice && val.ctaPrice.includes(tc.expected));
    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${tc.label} => Got Active: ${val.activePrice}, CTA: ${val.ctaPrice} (Expected: ${tc.expected})`);
  }

  // 5. Desktop Screenshot of BuyBox
  console.log('\n--- Capturing Desktop Buybox Screenshot ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        // Return to default state: Tier 2 + Subscription
        document.querySelector('.zv-ear-bundle-card[data-bundle-tier="2"]').click();
        document.querySelector('#zvSubRecurring').click();
        window.scrollTo({ top: 350, behavior: 'instant' });
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1000));
  const snapDesktop = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactsDir + '\\qa_ear_cleaner_task_desktop.png', Buffer.from(snapDesktop.data, 'base64'));
  console.log('Saved qa_ear_cleaner_task_desktop.png');

  // 6. Mobile Emulation & Screenshot
  console.log('--- Capturing Mobile Screenshot ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await send('Runtime.evaluate', {
    expression: `window.scrollTo({ top: 400, behavior: 'instant' });`
  });
  await new Promise(r => setTimeout(r, 1000));
  const snapMobile = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactsDir + '\\qa_ear_cleaner_task_mobile.png', Buffer.from(snapMobile.data, 'base64'));
  console.log('Saved qa_ear_cleaner_task_mobile.png');

  // Reset emulation
  await send('Emulation.clearDeviceMetricsOverride');

  // 7. Add to Cart & Checkout Verification (Buy 2 Get 2 FREE + Subscription: $56.68)
  console.log('\n--- Testing Add to Cart & Checkout (Buy 2 Get 2 FREE + Subscription) ---');
  await send('Runtime.evaluate', {
    expression: `fetch('/cart/clear.js', { method: 'POST' })`,
    awaitPromise: true
  });

  // Ensure Tier 2 and Subscription are selected
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        document.querySelector('.zv-ear-bundle-card[data-bundle-tier="2"]').click();
        document.querySelector('#zvSubRecurring').click();
        const upsell = document.querySelector('#zvEarUpsellCheck');
        if (upsell && upsell.checked) upsell.click(); // keep uncheck to test pure $56.68
      })()
    `
  });
  await new Promise(r => setTimeout(r, 500));

  // Click Add to Cart
  await send('Runtime.evaluate', {
    expression: `document.querySelector('#zvBtnClaim').click()`
  });
  await new Promise(r => setTimeout(r, 3500));

  // Check Cart State
  const cartData = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const res = await fetch('/cart.js');
        return await res.json();
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  const cart = cartData.result.value;
  console.log('Cart Items Count:', cart.items.length);
  console.log('Cart Total Price:', '$' + (cart.total_price / 100).toFixed(2));
  cart.items.forEach((it, idx) => {
    console.log(`[Item #${idx+1}] ${it.title}`);
    console.log(`  Price: $${(it.price / 100).toFixed(2)}`);
    console.log(`  Final Line Price: $${(it.final_line_price / 100).toFixed(2)}`);
    console.log(`  Selling Plan:`, it.selling_plan_allocation?.selling_plan?.name || 'NONE');
    console.log(`  Selling Plan ID:`, it.selling_plan_allocation?.selling_plan?.id || 'NONE');
    console.log(`  Properties:`, it.properties);
  });

  // Capture Cart Drawer Screenshot
  const snapDrawer = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactsDir + '\\qa_ear_cleaner_task_cart_drawer.png', Buffer.from(snapDrawer.data, 'base64'));
  console.log('Saved qa_ear_cleaner_task_cart_drawer.png');

  // Proceed to Checkout
  console.log('\n--- Proceeding to Checkout ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#willaCheckoutBtn') || document.querySelector('.cart-checkout-btn') || document.querySelector('#zvBtnBuyNow');
        if (btn) btn.click();
        else window.location.href = '/checkout';
      })()
    `
  });
  await new Promise(r => setTimeout(r, 5500));

  const checkoutUrl = await send('Runtime.evaluate', {
    expression: `window.location.href`,
    returnByValue: true
  });
  console.log('Checkout Page URL:', checkoutUrl.result.value);

  const snapCheckout = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(artifactsDir + '\\qa_ear_cleaner_task_checkout.png', Buffer.from(snapCheckout.data, 'base64'));
  console.log('Saved qa_ear_cleaner_task_checkout.png');

  ws.close();
  p.kill();
  console.log('\nQA Test Complete!');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
