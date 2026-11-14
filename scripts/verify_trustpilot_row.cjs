const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-tp';

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
  const port = 9338;
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

    console.log('Navigating to Tile Paint PDP on Draft Theme...');
    await send('Page.navigate', {
      url: 'https://ikwh1h-fx.myshopify.com/products/tile-refinishing-paint-restoration-kit?preview_theme_id=197144805747'
    });
    await new Promise(r => setTimeout(r, 4000));

    // Remove preview bars
    await send('Runtime.evaluate', {
      expression: `document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"]').forEach(el => el.remove());`
    });

    // Desktop Check
    const evalDesktop = await send('Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('.zv-pdp-rating-row');
        if (!row) return { error: 'Row not found' };
        const rect = row.getBoundingClientRect();
        const children = Array.from(row.children).map(c => {
          const r = c.getBoundingClientRect();
          return { tag: c.tagName, class: c.className, top: Math.round(r.top), height: Math.round(r.height), text: c.textContent.trim() };
        });
        const tops = [...new Set(children.map(c => c.top))];
        return {
          rowWidth: rect.width,
          rowHeight: rect.height,
          tops: tops,
          isSingleLine: tops.length <= 1,
          children: children
        };
      })()`,
      returnByValue: true
    });
    console.log('Desktop Rating Result:', JSON.stringify(evalDesktop.result.value, null, 2));

    const shotDesktop = await send('Page.captureScreenshot', { format: 'png' });
    const deskPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_trustpilot_single_line_desktop.png';
    fs.writeFileSync(deskPath, Buffer.from(shotDesktop.data, 'base64'));
    console.log('Desktop Screenshot saved to:', deskPath);

    // Mobile Check (390px)
    console.log('--- Checking Mobile 390px ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));

    // Remove banners again and scroll to rating row
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"], #shopify-pc__banner').forEach(el => el.remove());
        const row = document.querySelector('.zv-pdp-rating-row');
        if (row) row.scrollIntoView({ block: 'center' });
      `
    });
    await new Promise(r => setTimeout(r, 1000));

    const evalMobile = await send('Runtime.evaluate', {
      expression: `(() => {
        const row = document.querySelector('.zv-pdp-rating-row');
        if (!row) return { error: 'Row not found' };
        const rect = row.getBoundingClientRect();
        const children = Array.from(row.children).map(c => {
          const r = c.getBoundingClientRect();
          return { tag: c.tagName, class: c.className, top: Math.round(r.top), height: Math.round(r.height), text: c.textContent.trim() };
        });
        const tops = [...new Set(children.map(c => c.top))];
        return {
          rowWidth: rect.width,
          rowHeight: rect.height,
          tops: tops,
          isSingleLine: tops.length <= 1,
          children: children
        };
      })()`,
      returnByValue: true
    });
    console.log('Mobile 390px Rating Result:', JSON.stringify(evalMobile.result.value, null, 2));

    const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
    const mobPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_trustpilot_single_line_mobile.png';
    fs.writeFileSync(mobPath, Buffer.from(shotMobile.data, 'base64'));
    console.log('Mobile Screenshot saved to:', mobPath);

    ws.close();
  } catch(e) {
    console.error('Error during QA:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();
