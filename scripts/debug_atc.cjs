const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9299',
  '--window-size=390,844',
  'about:blank'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9299/json', res => {
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
      ws.addEventListener('message', e => {
        const d = JSON.parse(e.data);
        if (d.method === 'Runtime.consoleAPICalled') {
          console.log('[BROWSER CONSOLE]', d.params.type, d.params.args.map(a => a.value || a.description));
        }
      });

      console.log('Navigating to PDP...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      const payload = await send('Runtime.evaluate', {
        expression: 'computeGroupedCartPayload()',
        returnByValue: true
      });
      console.log('Computed Cart Payload:', JSON.stringify(payload.result?.result?.value, null, 2));

      const atcResult = await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const btn = document.querySelector('.uo-pdp-atc-btn');
            console.log('Btn found:', !!btn);
            const errEl = document.querySelector('.uo-pdp-error-msg');
            
            // Check direct fetch
            const p = computeGroupedCartPayload();
            console.log('Direct payload items:', JSON.stringify(p.items));
            const addRes = await fetch('/cart/add.js', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(p)
            });
            const addJson = await addRes.json();
            console.log('Direct /cart/add.js response:', JSON.stringify(addJson));

            const res = await fetch('/cart.js');
            return await res.json();
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });
      console.log('Cart after direct ATC:', JSON.stringify(atcResult.result?.result?.value, null, 2));

      ws.close();
      chrome.kill();
    });
  });
}, 2500);

