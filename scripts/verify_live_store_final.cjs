const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-live';

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
  const port = 9339;
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

    console.log('--- TEST 1: Live Tile Paint PDP ---');
    const liveTileUrl = 'https://trymalora.com/products/tile-refinishing-paint-restoration-kit';
    await send('Page.navigate', { url: liveTileUrl });
    await new Promise(r => setTimeout(r, 4000));

    // Clear banners
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"], #shopify-pc__banner').forEach(el => el.remove());`
    });

    const livePdpCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('.zv-pdp-rating-row');
        const bundleCards = document.querySelectorAll('.zv-bundle-card');
        const customizeSet = document.querySelector('#zvMixCustomizeWrap');
        const price = document.querySelector('#zvActivePrice')?.textContent.trim();
        return {
          ratingRowFound: !!row,
          ratingRowText: row?.textContent.trim(),
          bundleCardsCount: bundleCards.length,
          customizeSetFound: !!customizeSet,
          price: price
        };
      })()`,
      returnByValue: true
    });
    console.log('Live Tile Paint PDP Check:', livePdpCheck.result.value);

    const shotPdp = await send('Page.captureScreenshot', { format: 'png' });
    const pdpPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_live_tile_paint_pdp.png';
    fs.writeFileSync(pdpPath, Buffer.from(shotPdp.data, 'base64'));
    console.log('Saved Live Tile PDP Screenshot to:', pdpPath);

    console.log('--- TEST 2: Live Mobile Viewport (390px) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"], #shopify-pc__banner').forEach(el => el.remove());
        const row = document.querySelector('.zv-pdp-rating-row');
        if (row) row.scrollIntoView({ block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    const mobPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_live_tile_mobile.png';
    fs.writeFileSync(mobPath, Buffer.from(shotMobile.data, 'base64'));
    console.log('Saved Live Mobile Screenshot to:', mobPath);

    console.log('--- TEST 3: Live Shop All Catalog (/collections/all) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await send('Page.navigate', { url: 'https://trymalora.com/collections/all' });
    await new Promise(r => setTimeout(r, 3500));

    const shotShopAll = await send('Page.captureScreenshot', { format: 'png' });
    const shopAllPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_live_shop_all.png';
    fs.writeFileSync(shopAllPath, Buffer.from(shotShopAll.data, 'base64'));
    console.log('Saved Live Shop All Screenshot to:', shopAllPath);

    ws.close();
  } catch(e) {
    console.error('Error in QA:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();

