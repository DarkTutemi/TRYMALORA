const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

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
  const port = 9334;
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

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747';
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4000));

    // Clear cart first
    await send('Runtime.evaluate', {
      expression: `fetch('/cart/clear.js', { method: 'POST' }).then(r => r.json());`,
      awaitPromise: true
    });
    await new Promise(r => setTimeout(r, 1000));

    // Select 100g and Buy 3
    console.log('Testing 100g Buy 3...');
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const sizePills = document.querySelectorAll('#zvSizePills .zv-option-pill');
          sizePills.forEach(p => {
            if (p.getAttribute('data-size') === '100g') p.click();
          });
          const cards = document.querySelectorAll('.zv-tile-bundle-card');
          cards.forEach(c => {
            if (c.getAttribute('data-bundle-tier') === '3') c.click();
          });
          document.getElementById('zvBtnClaim').click();
        })()
      `
    });

    await new Promise(r => setTimeout(r, 2500));

    const res100g = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const item = document.querySelector('.willa-cart-item');
          const variant = item?.querySelector('.cart-item-variant')?.textContent?.trim();
          const price = item?.querySelector('.cart-item-price')?.textContent?.trim();
          const shipping = document.getElementById('willaShippingText')?.textContent?.trim();
          return { variant, price, shipping };
        })()
      `,
      returnByValue: true
    });

    console.log('100g Buy 3 Result:', res100g.result.value);
    ws.close();
  } catch(e) {
    console.error('Error during test:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();

