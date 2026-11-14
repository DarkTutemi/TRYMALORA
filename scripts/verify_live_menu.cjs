const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-livemenu';

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
  const port = 9336;
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900'
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

    console.log('Navigating to Live Store: https://trymalora.com ...');
    await send('Page.navigate', { url: 'https://trymalora.com' });
    await new Promise(r => setTimeout(r, 4000));

    // Remove preview bars & cookie banner
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"]').forEach(el => el.remove());
      `
    });

    const menuEval = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const navLinks = Array.from(document.querySelectorAll('.willa-desktop-nav a')).map(a => ({
            text: a.textContent.trim(),
            href: a.getAttribute('href')
          }));
          const mobileLinks = Array.from(document.querySelectorAll('.willa-drawer-menu a')).map(a => ({
            text: a.textContent.trim(),
            href: a.getAttribute('href')
          }));

          return {
            navLinks,
            mobileLinks
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Live Menu Evaluation:', JSON.stringify(menuEval.result.value, null, 2));

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const shotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\live_menu_updated.png';
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to:', shotPath);

    ws.close();
  } catch(e) {
    console.error('Error during live verification:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();

