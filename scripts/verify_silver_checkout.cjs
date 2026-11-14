const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-checkout';

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
  const port = 9349;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,2400']);
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

  console.log('Navigating to PDP...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4000));

  // 1. Inspect PDP Bundle cards
  const pdpInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const cards = Array.from(document.querySelectorAll('.zv-silver-bundle-card')).map(c => ({
          type: c.getAttribute('data-bundle-type'),
          variantId: c.getAttribute('data-variant-id'),
          priceCents: c.getAttribute('data-price-cents'),
          badge: c.querySelector('.zv-bundle-card-badge')?.innerText.trim(),
          name: c.querySelector('.zv-bundle-card-name')?.innerText.trim(),
          sub: c.querySelector('.zv-bundle-card-sub')?.innerText.trim(),
          total: c.querySelector('.zv-bundle-card-total')?.innerText.trim(),
          unit: c.querySelector('.zv-bundle-card-unit')?.innerText.trim()
        }));
        const activePrice = document.getElementById('zvPriceActive')?.innerText.trim();
        const atcLabel = document.getElementById('zvBtnClaimLabel')?.innerText.trim();
        return { cards, activePrice, atcLabel };
      })()
    `,
    returnByValue: true
  });
  console.log('PDP Bundle Info:', JSON.stringify(pdpInfo.value, null, 2));

  // 2. Click Add to Cart
  console.log('Clicking Claim / Add to Cart button...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('zvClaimBtn') || document.querySelector('.zv-btn-claim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  // 3. Inspect Cart Drawer
  const cartInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const subtotal = document.getElementById('willaDrawerSubtotal')?.innerText.trim();
        const shippingText = document.getElementById('willaShippingText')?.innerText.trim();
        const items = Array.from(document.querySelectorAll('.willa-cart-item')).map(item => ({
          title: item.querySelector('.cart-item-title')?.innerText.trim(),
          variant: item.querySelector('.cart-item-variant')?.innerText.trim(),
          badge: item.querySelector('div[style*="background:#ecfdf5"]')?.innerText.trim(),
          price: item.querySelector('.cart-item-price')?.innerText.trim()
        }));
        const checkoutHref = document.querySelector('.willa-checkout-btn')?.getAttribute('href');
        return { subtotal, shippingText, items, checkoutHref };
      })()
    `,
    returnByValue: true
  });
  console.log('Cart Drawer Info:', JSON.stringify(cartInfo.value, null, 2));

  // Capture PDP & Cart screenshot
  const cartShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_silver_cart_drawer.png', Buffer.from(cartShot.data, 'base64'));

  // 4. Navigate directly to Checkout
  console.log('Navigating to Checkout...');
  await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
  await new Promise(r => setTimeout(r, 5000));

  const checkoutUrl = await send('Runtime.evaluate', {
    expression: 'window.location.href',
    returnByValue: true
  });
  console.log('Checkout Page URL:', checkoutUrl.value);

  const checkoutInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const total = document.querySelector('[role="status"]')?.innerText || document.querySelector('strong.order-summary__emphasis')?.innerText || Array.from(document.querySelectorAll('*')).find(el => el.textContent && el.textContent.includes('$99.95') || el.textContent.includes('$159.92'))?.innerText;
        const lineItems = Array.from(document.querySelectorAll('.product-table .product, [data-order-summary-section="line-items"] tr, [role="row"]')).map(row => row.innerText.trim()).filter(Boolean);
        const subtotalEl = Array.from(document.querySelectorAll('span, td')).find(el => el.innerText && el.innerText.trim().startsWith('$99.95'))?.innerText;
        return {
          bodySnippet: document.body.innerText.slice(0, 800),
          lineItemsCount: lineItems.length
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Checkout text snippet:', checkoutInfo.value);

  // Capture Checkout screenshot
  const checkoutShot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_silver_checkout_verified.png', Buffer.from(checkoutShot.data, 'base64'));
  console.log('Saved qa_silver_checkout_verified.png');

  ws.close();
  p.kill();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

