const { spawn } = require('child_process');
const http = require('http');

const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new',
  '--remote-debugging-port=9290',
  'about:blank'
]);

setTimeout(() => {
  http.get('http://127.0.0.1:9290/json', res => {
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

      // Test changing localization to US / USD
      await send('Page.navigate', { url: 'https://trymalora.com/localization?country_code=US&currency_code=USD' });
      await new Promise(r => setTimeout(r, 3000));

      const cartInfo = await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const res = await fetch('/cart.js');
            return await res.json();
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });

      console.log('Cart after US localization:', cartInfo.result?.result?.value?.currency);

      ws.close();
      chrome.kill();
    });
  });
}, 2000);
