const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-test';

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
  const port = 9333;
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,900'
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
    await send('DOM.enable');

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747';
    console.log('Navigating to:', targetUrl);
    await send('Page.navigate', { url: targetUrl });

    await new Promise(r => setTimeout(r, 4000));

    // Clear cart first
    console.log('Clearing existing cart...');
    await send('Runtime.evaluate', {
      expression: `
        fetch('/cart/clear.js', { method: 'POST' }).then(r => r.json());
      `,
      awaitPromise: true
    });

    await new Promise(r => setTimeout(r, 1000));

    // Dismiss cookie banners & preview bars
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"]').forEach(el => el.remove());
      `
    });

    console.log('Selecting 500g and Buy 3...');
    const selectRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          // Click 500g pill
          const sizePills = document.querySelectorAll('#zvSizePills .zv-option-pill');
          let sizeClicked = false;
          sizePills.forEach(p => {
            if (p.getAttribute('data-size') === '500g') {
              p.click();
              sizeClicked = true;
            }
          });

          // Click Buy 3 bundle card
          const cards = document.querySelectorAll('.zv-tile-bundle-card');
          let cardClicked = false;
          cards.forEach(c => {
            if (c.getAttribute('data-bundle-tier') === '3') {
              c.click();
              cardClicked = true;
            }
          });

          const priceActive = document.getElementById('zvPriceActive')?.textContent;
          const ctaLabel = document.getElementById('zvBtnClaimLabel')?.textContent;

          return {
            sizeClicked,
            cardClicked,
            priceActive,
            ctaLabel
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Selection evaluation:', selectRes.result.value);

    console.log('Clicking ADD TO CART...');
    await send('Runtime.evaluate', {
      expression: `
        document.getElementById('zvBtnClaim').click();
      `
    });

    // Wait for Cart API and Cart Drawer
    await new Promise(r => setTimeout(r, 3000));

    // Inspect Cart Drawer contents
    const cartRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const drawer = document.getElementById('willaCartDrawer');
          const isDrawerActive = drawer?.classList.contains('active');
          const drawerCount = document.getElementById('willaDrawerCount')?.textContent;
          const items = [];
          document.querySelectorAll('.willa-cart-item').forEach(item => {
            const title = item.querySelector('.cart-item-title')?.textContent?.trim();
            const variant = item.querySelector('.cart-item-variant')?.textContent?.trim();
            const qty = item.querySelector('.willa-qty-val')?.textContent?.trim();
            const price = item.querySelector('.cart-item-price')?.textContent?.trim();
            items.push({ title, variant, qty, price });
          });
          const subtotal = document.getElementById('willaDrawerSubtotal')?.textContent?.trim();
          const shippingText = document.getElementById('willaShippingText')?.textContent?.trim();

          return {
            isDrawerActive,
            drawerCount,
            items,
            subtotal,
            shippingText
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Cart Drawer State:', JSON.stringify(cartRes.result.value, null, 2));

    // Take screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_tile_500g_buy3_cart_fixed.png';
    fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
    console.log('Saved screenshot to:', outPath);

    ws.close();
  } catch(e) {
    console.error('Error during test:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();
