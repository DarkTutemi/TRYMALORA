const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-live-showroom';

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
  const port = 9345;
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1400'
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

    await new Promise(r => ws.addEventListener('open', r, { once: true }));

    await send('Page.enable');
    await send('DOM.enable');
    await send('Network.enable');

    const targetUrl = 'https://trymalora.com/collections/all';
    console.log('Navigating to:', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Capture desktop showroom
    const snap1 = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_live_showroom_fixed_desktop.png', Buffer.from(snap1.data, 'base64'));
    console.log('Saved qa_live_showroom_fixed_desktop.png');

    // Check if delivery section exists
    const checkDelivery = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('.zv-delivery-section')`
    });
    console.log('Delivery section present on page:', checkDelivery.result.value);

    // Check button style
    const buttonStyle = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('.zv-view-btn.active');
          if (!btn) return null;
          const comp = window.getComputedStyle(btn);
          return {
            text: btn.innerText.trim(),
            bg: comp.backgroundColor,
            color: comp.color
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Active button computed style:', buttonStyle.result.value);

    // Check badge style
    const badgeStyle = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const b = document.querySelector('.zv-tag-badge');
          if (!b) return null;
          const comp = window.getComputedStyle(b);
          return {
            text: b.innerText.trim(),
            bg: comp.backgroundColor,
            color: comp.color,
            fontSize: comp.fontSize
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Tag badge computed style:', badgeStyle.result.value);

    // Check shelf 2 columns
    const shelf2Layout = await send('Runtime.evaluate', {
      expression: `
        (() => {
          const tiers = document.querySelectorAll('.zv-shelf-tier');
          if (tiers.length < 2) return null;
          const tier2Grid = tiers[1].querySelector('.zv-shelf-columns-grid');
          const comp = window.getComputedStyle(tier2Grid);
          return {
            gridColumns: comp.gridTemplateColumns,
            width: comp.width
          };
        })()
      `,
      returnByValue: true
    });
    console.log('Shelf 2 layout computed style:', shelf2Layout.result.value);

    ws.close();
  } catch(e) {
    console.error('Error during verification:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();
