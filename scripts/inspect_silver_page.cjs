const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-silver';

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
  const port = 9347;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,1400']);
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
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4000));

  // 1. Initial State Check (Buy 5 Get 3 FREE default)
  const initCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.zv-bundle-card')).map((c, i) => ({
          idx: i + 1,
          selected: c.classList.contains('selected'),
          type: c.getAttribute('data-bundle-type'),
          name: c.querySelector('.zv-bundle-card-name')?.innerText.trim(),
          sub: c.querySelector('.zv-bundle-card-sub')?.innerText.trim(),
          badge: c.querySelector('.zv-bundle-card-badge')?.innerText.trim(),
          total: c.querySelector('.zv-bundle-card-total')?.innerText.trim(),
          unit: c.querySelector('.zv-bundle-card-unit')?.innerText.trim(),
          paidQty: c.getAttribute('data-paid-qty'),
          receiveQty: c.getAttribute('data-receive-qty'),
          priceCents: c.getAttribute('data-price-cents')
        }));
        const activePrice = document.getElementById('zvPriceActive')?.innerText.trim();
        const ctaPrice = document.getElementById('zvCtaPrice')?.innerText.trim();
        const shipBadge = document.getElementById('zvGiftStatusBadge')?.innerText.trim();
        const shipTitle = document.getElementById('zvGiftTitle')?.innerText.trim();
        return { cards, activePrice, ctaPrice, shipBadge, shipTitle };
      })()
    `,
    returnByValue: true
  });
  console.log('--- 1. INITIAL BUNDLE CARDS (DEFAULT BUY 5 GET 3 FREE) ---');
  console.log(JSON.stringify(initCheck.result.value, null, 2));

  // 2. Click Buy 3 Get 1 FREE
  const clickBuy3 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const c = document.querySelector('.zv-silver-bundle-card[data-bundle-type="buy3get1"]');
        if (c) c.click();
        return {
          activePrice: document.getElementById('zvPriceActive')?.innerText.trim(),
          ctaPrice: document.getElementById('zvCtaPrice')?.innerText.trim(),
          shipBadge: document.getElementById('zvGiftStatusBadge')?.innerText.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('\n--- 2. CLICK BUY 3 GET 1 FREE ---');
  console.log(JSON.stringify(clickBuy3.result.value, null, 2));

  // 3. Click 1 Can (50g Starter Kit)
  const clickBuy1 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const c = document.querySelector('.zv-silver-bundle-card[data-bundle-type="single"]');
        if (c) c.click();
        return {
          activePrice: document.getElementById('zvPriceActive')?.innerText.trim(),
          ctaPrice: document.getElementById('zvCtaPrice')?.innerText.trim(),
          shipBadge: document.getElementById('zvGiftStatusBadge')?.innerText.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('\n--- 3. CLICK 1 CAN (STARTER KIT) ---');
  console.log(JSON.stringify(clickBuy1.result.value, null, 2));

  // 4. Click back to Buy 5 Get 3 FREE & Add to Cart
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const c = document.querySelector('.zv-silver-bundle-card[data-bundle-type="buy5get3"]');
        if (c) c.click();
        const btn = document.getElementById('zvBtnClaim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3500));

  // 5. Drawer Verification
  const drawerCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const drawer = document.getElementById('willaCartDrawer');
        const isActive = drawer?.classList.contains('active');
        const count = document.getElementById('willaDrawerCount')?.innerText.trim();
        const subtotal = document.getElementById('willaDrawerSubtotal')?.innerText.trim();
        const checkoutLink = document.querySelector('.willa-checkout-btn')?.getAttribute('href');
        const items = Array.from(document.querySelectorAll('.willa-cart-item')).map(item => ({
          title: item.querySelector('h4')?.innerText.trim(),
          badge: item.querySelector('.cart-item-bundle-badge, div[style*="background:#ecfdf5"]')?.innerText.trim(),
          qty: item.querySelector('.cart-qty-ctrl span')?.innerText.trim(),
          price: item.querySelector('.cart-item-price')?.innerText.trim()
        }));
        return { isActive, count, subtotal, checkoutLink, items };
      })()
    `,
    returnByValue: true
  });
  console.log('\n--- 4. WILLA CART DRAWER STATE ---');
  console.log(JSON.stringify(drawerCheck.result.value, null, 2));

  // Capture screenshot of page
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const artDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
  fs.writeFileSync(path.join(artDir, 'qa_silver_bundle_verified.png'), Buffer.from(screenshot.data, 'base64'));
  console.log('\nScreenshot saved to qa_silver_bundle_verified.png');

  ws.close();
  p.kill();
})();
