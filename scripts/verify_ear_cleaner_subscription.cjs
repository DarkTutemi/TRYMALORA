const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-sub';

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
  const port = 9360;
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

  console.log('--- Navigating to PDP ---');
  await send('Page.navigate', { url: 'https://trymalora.com/products/ear-cleaner' });
  await new Promise(r => setTimeout(r, 4000));

  // Clear cart
  await send('Runtime.evaluate', {
    expression: `fetch('/cart/clear.js', { method: 'POST' })`,
    awaitPromise: true
  });

  // Select 30-Day Subscription
  console.log('--- Selecting 30-Day Subscription option ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const sub = document.querySelector('#zvSubRecurring');
        if (sub) sub.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 800));

  // Click Add to Cart
  console.log('--- Clicking Add to Cart with Subscription ---');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('#zvBtnClaim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  // Check Cart state
  const cartState = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        const res = await fetch('/cart.js');
        const cart = await res.json();
        return cart;
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Cart Items count:', cartState.result.value.items.length);
  cartState.result.value.items.forEach((it, i) => {
    console.log(`[Item #${i+1}] Title:`, it.title);
    console.log(`  Price: $${(it.price / 100).toFixed(2)}`);
    console.log(`  Selling Plan:`, it.selling_plan_allocation);
    console.log(`  Properties:`, it.properties);
  });

  // Proceed to Checkout
  console.log('--- Navigating to Checkout with Subscription ---');
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
  console.log('Subscription Checkout URL:', checkoutUrl.result.value);

  const shot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_ear_cleaner_subscription_checkout.png', Buffer.from(shot.data, 'base64'));
  console.log('[OK] Saved qa_ear_cleaner_subscription_checkout.png');

  p.kill();
  process.exit(0);
})();

