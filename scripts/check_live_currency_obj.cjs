const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9298',
  'about:blank'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9298/json', res => {
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

      // Test switching localization to US
      console.log('Switching localization to US...');
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const fd = new FormData();
            fd.append('_method', 'PUT');
            fd.append('country_code', 'US');
            await fetch('/localization', { method: 'POST', body: fd });
          })()
        `,
        awaitPromise: true
      });

      // Reload page to see new currency
      console.log('Navigating to PDP after US switch...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4000));

      const resUS = await send('Runtime.evaluate', {
        expression: `
          ({
            shopifyCurrency: window.Shopify?.currency,
            uoCurrency: window.uoCurrency,
            firstVariant: (function() {
              const el = document.getElementById('uo-product-variants-json');
              if (!el) return null;
              const vars = JSON.parse(el.textContent);
              return vars[0];
            })()
          })
        `,
        returnByValue: true
      });
      console.log('US Result:', JSON.stringify(resUS.result?.result?.value, null, 2));

      ws.close();
      chrome.kill();
    });
  });
}, 2000);
