const { spawn } = require('child_process');
const http = require('http');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-pixel';

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
  const port = 9354;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,1800']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  const pixelRequests = [];

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
  await send('Network.enable');

  ws.addEventListener('message', e => {
    const msg = JSON.parse(e.data);
    if (msg.method === 'Network.requestWillBeSent') {
      const u = msg.params.request.url;
      if (u.includes('facebook.com/tr') || u.includes('fbevents.js')) {
        pixelRequests.push(u);
      }
    }
  });

  console.log('Navigating to live PDP...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' });
  await new Promise(r => setTimeout(r, 4500));

  const fbqCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          hasFbq: typeof window.fbq === 'function',
          loaded: window._fbq && window._fbq.loaded,
          version: window.fbq && window.fbq.version,
          pixelIdPresentInSource: document.documentElement.innerHTML.includes('767056089767666')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Window FBQ check:', JSON.stringify(fbqCheck.result.value, null, 2));

  console.log('Clicking Add to Cart...');
  await send('Runtime.evaluate', {
    expression: `
      (() => {
        const btn = document.getElementById('zvBtnClaim');
        if (btn) btn.click();
      })()
    `
  });
  await new Promise(r => setTimeout(r, 3000));

  console.log('Total Pixel Network Requests captured:', pixelRequests.length);
  pixelRequests.forEach(req => console.log(' ->', req.slice(0, 160)));

  ws.close();
  p.kill();
  process.exit(0);
})().catch(err => {
  console.error(err);
  process.exit(1);
});

