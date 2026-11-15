const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9291',
  'about:blank'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9291/json', res => {
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
      await new Promise(r => setTimeout(r, 4000));

      const cartInfo = await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const res = await fetch('/cart.js');
            const c = await res.json();
            return {
              currency: c.currency,
              total_price: c.total_price,
              items: c.items.map(i => ({
                id: i.id,
                price: i.price,
                line_price: i.line_price,
                original_line_price: i.original_line_price,
                final_line_price: i.final_line_price
              }))
            };
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });

      console.log('Cart Currency & Prices:', JSON.stringify(cartInfo.result?.result?.value, null, 2));

      ws.close();
      chrome.kill();
    });
  });
}, 2000);
