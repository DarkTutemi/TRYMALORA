const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-mixmatch';

function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/json`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          clearInterval(interval);
          try {
            const tabs = JSON.parse(data);
            const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
            resolve(pageTab.webSocketDebuggerUrl);
          } catch(e) {
            reject(e);
          }
        });
      }).on('error', () => {
        retries++;
        if (retries > 30) {
          clearInterval(interval);
          reject(new Error('Timeout connecting to Chrome CDP'));
        }
      });
    }, 200);
  });
}

async function run() {
  const port = 9337;
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);

    let idSeq = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const id = idSeq++;
        const handler = e => {
          const d = JSON.parse(e.data);
          if (d.id === id) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(res => ws.addEventListener('open', res));

    await send('Page.enable');
    await send('Runtime.enable');

    const previewUrl = 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747';
    console.log('Navigating to Draft PDP:', previewUrl);
    await send('Page.navigate', { url: previewUrl });
    await new Promise(r => setTimeout(r, 4000));

    // Clear cart first
    await send('Runtime.evaluate', {
      expression: `fetch('/cart/clear.js', { method: 'POST' }).then(r => r.json());`,
      awaitPromise: true
    });

    // Remove preview bars & cookie banner
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"]').forEach(el => el.remove());`
    });

    // TEST 1: Buy 1 (Default: Pure White 100g)
    console.log('--- TEST 1: Buy 1 (Pure White 100g) ---');
    const t1 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const price = document.getElementById('zvPriceActive')?.textContent?.trim();
          const cta = document.getElementById('zvBtnClaimLabel')?.textContent?.trim();
          const box1Visible = document.getElementById('zvMixBox1')?.style.display !== 'none';
          const box2Visible = document.getElementById('zvMixBox2')?.style.display !== 'none';
          const box3Visible = document.getElementById('zvMixBox3')?.style.display !== 'none';
          const b1CardTot = document.getElementById('zvTileB1Total')?.textContent?.trim();
          return { price, cta, b1CardTot, box1Visible, box2Visible, box3Visible };
        })()
      `,
      returnByValue: true
    });
    console.log('Test 1 Result:', t1.result.value);

    // TEST 2: Buy 2 (Box 1: Pure White 100g, Box 2: Modern Gray 300g)
    console.log('--- TEST 2: Buy 2 (Box 1: 100g, Box 2: 300g) ---');
    const t2 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          // Click Buy 2
          document.querySelectorAll('.zv-tile-bundle-card')[1].click();

          // Set Box 2 size to 300g
          const b2Size = document.getElementById('zvBox2Size');
          b2Size.value = '300g';
          b2Size.dispatchEvent(new Event('change'));

          const price = document.getElementById('zvPriceActive')?.textContent?.trim();
          const compare = document.getElementById('zvPriceCompare')?.textContent?.trim();
          const savings = document.getElementById('zvPriceSavings')?.textContent?.trim();
          const cta = document.getElementById('zvBtnClaimLabel')?.textContent?.trim();
          const box1Visible = document.getElementById('zvMixBox1')?.style.display !== 'none';
          const box2Visible = document.getElementById('zvMixBox2')?.style.display !== 'none';
          const box3Visible = document.getElementById('zvMixBox3')?.style.display !== 'none';
          return { price, compare, savings, cta, box1Visible, box2Visible, box3Visible };
        })()
      `,
      returnByValue: true
    });
    console.log('Test 2 Result:', t2.result.value);

    // TEST 3: Buy 3 (Box 1: 100g, Box 2: 300g, Box 3: 500g) -> Subtotal $86.97, Disc 15% ($13.05), Final $73.92
    console.log('--- TEST 3: Buy 3 (Box 1: 100g, Box 2: 300g, Box 3: 500g) ---');
    const t3 = await send('Runtime.evaluate', {
      expression: `
        (function() {
          // Click Buy 3
          document.querySelectorAll('.zv-tile-bundle-card')[2].click();

          // Set Box 3 color to Matte Black, size to 500g
          const b3Color = document.getElementById('zvBox3Color');
          b3Color.value = 'Matte Black';
          b3Color.dispatchEvent(new Event('change'));

          const b3Size = document.getElementById('zvBox3Size');
          b3Size.value = '500g';
          b3Size.dispatchEvent(new Event('change'));

          const price = document.getElementById('zvPriceActive')?.textContent?.trim();
          const compare = document.getElementById('zvPriceCompare')?.textContent?.trim();
          const savings = document.getElementById('zvPriceSavings')?.textContent?.trim();
          const cta = document.getElementById('zvBtnClaimLabel')?.textContent?.trim();
          const shippingBadge = document.getElementById('zvBundleShippingBadge')?.className;
          const shippingText = document.getElementById('zvBundleShippingText')?.textContent?.trim();
          return { price, compare, savings, cta, shippingBadge, shippingText };
        })()
      `,
      returnByValue: true
    });
    console.log('Test 3 Result:', t3.result.value);

    // Capture Buy 3 Desktop Screenshot
    const shotBuy3 = await send('Page.captureScreenshot', { format: 'png' });
    const shotBuy3Path = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_mix_match_buy3_desktop.png';
    fs.writeFileSync(shotBuy3Path, Buffer.from(shotBuy3.data, 'base64'));
    console.log('Saved Buy 3 Desktop screenshot to:', shotBuy3Path);

    // TEST 4: Add to Cart Execution with Buy 3 (3 different variants)
    console.log('--- TEST 4: Add to Cart Execution ---');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('zvBtnClaim').click();`
    });

    await new Promise(r => setTimeout(r, 3000));

    const cartState = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const drawer = document.getElementById('willaCartDrawer');
          const isDrawerActive = drawer?.classList.contains('active');
          const drawerCount = document.getElementById('willaDrawerCount')?.textContent?.trim();
          const items = [];
          document.querySelectorAll('.willa-cart-item').forEach(el => {
            const title = el.querySelector('h4')?.textContent?.trim();
            const variant = el.querySelector('.cart-item-variant')?.textContent?.trim();
            const prop = el.querySelector('.cart-item-prop')?.textContent?.trim();
            const qty = el.querySelector('.cart-qty-ctrl span')?.textContent?.trim();
            const price = el.querySelector('.cart-item-price')?.textContent?.trim();
            items.push({ title, variant, prop, qty, price });
          });
          const subtotal = document.getElementById('willaDrawerSubtotal')?.textContent?.trim();
          const shippingText = document.getElementById('willaShippingText')?.textContent?.trim();
          const checkoutBtnHref = document.querySelector('.willa-checkout-btn')?.getAttribute('href');

          return { isDrawerActive, drawerCount, items, subtotal, shippingText, checkoutBtnHref };
        })()
      `,
      returnByValue: true
    });
    console.log('Cart Drawer State:', JSON.stringify(cartState.result.value, null, 2));

    const shotCart = await send('Page.captureScreenshot', { format: 'png' });
    const shotCartPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_mix_match_cart_drawer.png';
    fs.writeFileSync(shotCartPath, Buffer.from(shotCart.data, 'base64'));
    console.log('Saved Cart Drawer screenshot to:', shotCartPath);

    // TEST 5: Mobile View (390px)
    console.log('--- TEST 5: Mobile Responsive Check (390px) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));

    // Close drawer to capture buybox on mobile
    await send('Runtime.evaluate', {
      expression: `closeWillaCart();`
    });
    await new Promise(r => setTimeout(r, 1000));

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    const shotMobilePath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_mix_match_mobile_390px.png';
    fs.writeFileSync(shotMobilePath, Buffer.from(shotMobile.data, 'base64'));
    console.log('Saved Mobile 390px screenshot to:', shotMobilePath);

    ws.close();
  } catch(e) {
    console.error('Error during QA:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();

