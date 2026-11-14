const { spawn } = require('child_process');
const http = require('http');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-reg';

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
  const port = 9366;
  const p = spawn(chromePath, ['--headless=new', '--remote-debugging-port=' + port, '--user-data-dir=' + userDataDir, '--window-size=1440,2400']);
  const ws = new WebSocket(await getWsUrl(port));
  let id = 1;
  function send(m, params = {}) {
    return new Promise(r => {
      const curId = id++;
      const h = e => { const d = JSON.parse(e.data); if (d.id === curId) { ws.removeEventListener('message', h); r(d.result); } };
      ws.addEventListener('message', h);
      ws.send(JSON.stringify({ id: curId, method: m, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');

  const productsToTest = [
    { name: 'Metallic Silver Coating', url: 'https://trymalora.com/products/metallic-silver-anti-rust-renovation-coating' },
    { name: 'Tile Refinishing Paint', url: 'https://trymalora.com/products/tile-refinishing-paint-restoration-kit' },
    { name: 'Car Metal Rust Repair', url: 'https://trymalora.com/products/car-metal-rust-repair-paste' }
  ];

  for (const prod of productsToTest) {
    console.log(`\nVerifying ${prod.name}...`);
    await send('Page.navigate', { url: prod.url });
    await new Promise(r => setTimeout(r, 3500));

    const check = await send('Runtime.evaluate', {
      expression: `
        (() => ({
          title: document.querySelector('.zv-pdp-title')?.innerText.trim(),
          badge: document.querySelector('.zv-pdp-save-badge')?.innerText.trim(),
          price: document.querySelector('.zv-price-active')?.innerText.trim(),
          bundlesCount: document.querySelectorAll('.zv-bundle-card').length,
          hasSubscription: document.querySelector('#zvEarSubBox') !== null,
          hasUpsell: document.querySelector('#zvEarUpsellBox') !== null
        }))()
      `,
      returnByValue: true
    });
    console.log(`${prod.name} result:`, check.result.value);
  }

  p.kill();
  process.exit(0);
})();

