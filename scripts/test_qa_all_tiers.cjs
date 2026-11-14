const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-checkout3';

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
  const port = 9351;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,1800']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  // Test 1: Clear cart, select Buy 3 Get 1 FREE, verify checkout = $59.97
  console.log('Testing Buy 3 Get 1 FREE...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4000));

  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        await fetch('/cart/clear.js', { method: 'POST' });
        const card2 = document.querySelectorAll('.zv-silver-bundle-card')[1];
        if (card2) card2.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('zvBtnClaim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.willa-checkout-btn');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 5500));

  const shot2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_live_checkout_buy3get1.png', Buffer.from(shot2.result.data, 'base64'));
  console.log('Saved qa_live_checkout_buy3get1.png');

  // Test 2: Clear cart, select 1 Can, verify checkout = $19.99
  console.log('Testing 1 Can (50g Starter Kit)...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4000));

  await send('Runtime.evaluate', {
    expression: `
      (async () => {
        await fetch('/cart/clear.js', { method: 'POST' });
        const card3 = document.querySelectorAll('.zv-silver-bundle-card')[2];
        if (card3) card3.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 1500));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('zvBtnClaim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.querySelector('.willa-checkout-btn');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 5500));

  const shot3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551/qa_live_checkout_1can.png', Buffer.from(shot3.result.data, 'base64'));
  console.log('Saved qa_live_checkout_1can.png');

  ws.close();
  p.kill();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

