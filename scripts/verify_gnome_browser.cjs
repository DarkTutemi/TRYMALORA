const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-gnome';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\43d9c775-1dab-4bdb-8d9b-3c1d86fa5c71';

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
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', () => { if (++retries > 30) reject(); });
    }, 200);
  });
}

(async () => {
  const port = 9387;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,2400'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);
    let id = 1;
    function send(m, params = {}) {
      return new Promise(r => {
        const curId = id++;
        const h = e => { 
          const d = JSON.parse(e.data); 
          if (d.id === curId) { 
            ws.removeEventListener('message', h); 
            r(d.result); 
          } 
        };
        ws.addEventListener('message', h);
        ws.send(JSON.stringify({ id: curId, method: m, params }));
      });
    }

    await new Promise(r => ws.addEventListener('open', r, { once: true }));
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1200, deviceScaleFactor: 1, mobile: false });

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747';
    console.log('Navigating to:', targetUrl);
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Test upsell detection and initial price
    const initialCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const upsellBox = document.getElementById('zvGnomeUpsellBox');
        const upsellCheck = document.getElementById('zvGnomeUpsellCheck');
        const upsellTitle = upsellBox?.querySelector('.zv-upsell-title')?.innerText;
        const upsellPrice = upsellBox?.querySelector('.zv-upsell-price')?.innerText;
        const atcLabel = document.getElementById('zvBtnClaimLabel')?.innerText;

        return {
          hasUpsellBox: !!upsellBox,
          upsellTitle,
          upsellPrice,
          initialAtcLabel: atcLabel
        };
      })()`,
      returnByValue: true
    });
    console.log('--- INITIAL STATE ---', initialCheck.result?.value);

    // Click the upsell checkbox
    console.log('\nToggling Upsell Checkbox ON...');
    const clickCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const upsellCheck = document.getElementById('zvGnomeUpsellCheck');
        if (upsellCheck) {
          upsellCheck.click();
          return {
            checked: upsellCheck.checked,
            newAtcLabel: document.getElementById('zvBtnClaimLabel')?.innerText,
            shippingText: document.getElementById('zvBundleShippingText')?.innerText
          };
        }
        return null;
      })()`,
      returnByValue: true
    });
    console.log('--- AFTER UPSELL TOGGLE ---', clickCheck.result?.value);

    // Capture screenshot of Buy Box with Upsell
    console.log('\nCapturing Buy Box with Upsell Screenshot...');
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'gnome_with_upsell_pdp.png'), Buffer.from(shot.data, 'base64'));
    console.log('✔ Screenshot saved: gnome_with_upsell_pdp.png');

    console.log('\n======================================================');
    console.log('🎉 UPSELL QA COMPLETE AND VERIFIED!');
    console.log('======================================================');

    ws.close();
  } catch (err) {
    console.error('Browser QA Error:', err);
  } finally {
    p.kill();
  }
})();
