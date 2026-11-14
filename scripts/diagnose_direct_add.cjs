const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-test-atc-2';

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
  const port = 9395;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,1200'
  ]);

  const ws = new WebSocket(await getWsUrl(port));
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

  ws.addEventListener('message', e => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', d.params.type, d.params.args.map(a => a.value));
    }
    if (d.method === 'Runtime.exceptionThrown') {
      console.log('[EXCEPTION]', JSON.stringify(d.params.exceptionDetails));
    }
  });

  console.log('Navigating...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/eyvelle-steam-therapy' });
  await new Promise(r => setTimeout(r, 4500));

  // Run direct test in page
  const result = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        // 1. Check getEyeBundlePayload
        const selectedCard = document.querySelector('.zv-eye-bundle-card.selected');
        const vId = selectedCard?.getAttribute('data-variant-id');
        const name = selectedCard?.getAttribute('data-bundle-name');
        console.log('Selected card:', name, 'Variant ID:', vId);

        const check = document.getElementById('zvEyeUpsellCheck');
        console.log('Upsell check element:', !!check, 'upsell checked:', check?.checked);

        // Try direct fetch /cart/add.js
        console.log('Testing direct fetch /cart/add.js with variant:', vId);
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              { id: parseInt(vId, 10), quantity: 1, properties: { 'Package': name } }
            ]
          })
        });
        const status = res.status;
        const json = await res.json().catch(() => ({}));
        console.log('Add response status:', status, json);

        const cartRes = await fetch('/cart.js');
        const cart = await cartRes.json();
        return {
          status,
          json,
          itemCount: cart.item_count,
          cartItems: cart.items.map(i => ({ title: i.title, quantity: i.quantity, price: i.price }))
        };
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Direct Test Result:', JSON.stringify(result.result.value, null, 2));

  ws.close();
  p.kill();
  process.exit(0);
})();

