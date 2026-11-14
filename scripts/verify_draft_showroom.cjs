const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-showroom';

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
  const port = 9342;
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1200'
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

    console.log('--- TEST 1: Draft Showroom Collection at /collections/all ---');
    const previewUrl = 'https://ikwh1h-fx.myshopify.com/collections/all?preview_theme_id=197144805747';
    await send('Page.navigate', { url: previewUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Clear preview bars & banners
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"], #shopify-pc__banner').forEach(el => el.remove());`
    });

    const showroomCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const stage = document.querySelector('#zvShowroomStage');
        const tiers = document.querySelectorAll('.zv-shelf-tier');
        const shelfItems = document.querySelectorAll('.zv-shelf-item');
        const priceTags = document.querySelectorAll('.zv-shelf-clip-tag');
        const deliveryFooter = document.querySelector('.zv-delivery-section');

        const products = Array.from(shelfItems).map(item => {
          const title = item.getAttribute('aria-label');
          const cutout = item.getAttribute('data-cutout-src');
          return { title, hasCutout: !!cutout };
        });

        return {
          stageFound: !!stage,
          tiersCount: tiers.length,
          shelfItemsCount: shelfItems.length,
          priceTagsCount: priceTags.length,
          deliveryFooterFound: !!deliveryFooter,
          products: products
        };
      })()`,
      returnByValue: true
    });
    console.log('Draft Showroom Verification:', JSON.stringify(showroomCheck.result.value, null, 2));

    const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
    const deskPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_draft_showroom_desktop.png';
    fs.writeFileSync(deskPath, Buffer.from(shotDesktop.data, 'base64'));
    console.log('Saved Draft Showroom Desktop Screenshot to:', deskPath);

    console.log('--- TEST 2: Mobile Viewport (390px) ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1200));

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"], #shopify-pc__banner').forEach(el => el.remove());
        const stage = document.querySelector('#zvShowroomStage');
        if (stage) stage.scrollIntoView();
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    const mobPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_draft_showroom_mobile.png';
    fs.writeFileSync(mobPath, Buffer.from(shotMobile.data, 'base64'));
    console.log('Saved Draft Showroom Mobile Screenshot to:', mobPath);

    console.log('--- TEST 3: Click Product to Test Spatial Inspection Bay ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 1000));

    const clickRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const firstItem = document.querySelector('.zv-shelf-item');
        if (firstItem) {
          firstItem.click();
          return true;
        }
        return false;
      })()`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 1200));

    const inspectCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const bay = document.querySelector('#zvSpatialInspectBay');
        const title = document.querySelector('#zvInspectTitle')?.textContent;
        const price = document.querySelector('#zvInspectPriceCurr')?.textContent;
        const active = bay ? bay.classList.contains('active') : false;
        return { inspectActive: active, title: title, price: price };
      })()`,
      returnByValue: true
    });
    console.log('Spatial Inspect Bay Check:', inspectCheck.result.value);

    const shotInspect = await send('Page.captureScreenshot', { format: 'png' });
    const inspectPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_draft_showroom_inspect.png';
    fs.writeFileSync(inspectPath, Buffer.from(shotInspect.data, 'base64'));
    console.log('Saved Draft Showroom Inspect Screenshot to:', inspectPath);

    // Close inspect bay first, then scroll to delivery section & capture
    await send('Runtime.evaluate', {
      expression: `
        const closeBtn = document.querySelector('#zvInspectCloseBtn');
        if (closeBtn) closeBtn.click();
        const del = document.querySelector('.zv-delivery-section');
        if (del) del.scrollIntoView();
      `
    });
    await new Promise(r => setTimeout(r, 1200));
    const shotDelivery = await send('Page.captureScreenshot', { format: 'png' });
    const delPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_draft_showroom_delivery_footer.png';
    fs.writeFileSync(delPath, Buffer.from(shotDelivery.data, 'base64'));
    console.log('Saved Delivery Footer Screenshot to:', delPath);

    ws.close();
  } catch(e) {
    console.error('Error during QA:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();
