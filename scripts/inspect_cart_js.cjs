const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9296',
  '--user-data-dir=C:\\Users\\Admin\\.chrome-headless-pdp-v5-cart',
  'about:blank'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9296/json', res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', async () => {
      const tabs = JSON.parse(raw);
      const tab = tabs.find(t => t.type === 'page');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));

      let id = 1;
      function send(m, p = {}) {
        return new Promise(r => {
          const reqId = id++;
          const h = e => {
            const d = JSON.parse(e.data);
            if (d.id === reqId) {
              ws.removeEventListener('message', h);
              r(d);
            }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method: m, params: p }));
        });
      }

      await send('Page.enable');
      await send('Runtime.enable');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 3000));

      const res = await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const r = await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: [{ id: 67417070174579, quantity: 1 }]
              })
            });
            return { status: r.status, data: await r.json() };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Add upsell response:', JSON.stringify(res.result.result.value, null, 2));

      ws.close();
      chrome.kill();
    });
  });
}, 2000);
