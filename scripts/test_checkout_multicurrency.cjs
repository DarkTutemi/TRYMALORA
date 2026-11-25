const { spawn } = require('child_process');
const http = require('http');

async function testCheckout() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9294',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9294/json', res => {
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

      // 1. Set to Vietnam (VND)
      await send('Page.navigate', { url: 'https://trymalora.com/' });
      await new Promise(r => setTimeout(r, 2500));
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            await fetch('/cart/clear.js', { method: 'POST' });
            const fd = new FormData();
            fd.append('_method', 'PUT');
            fd.append('country_code', 'VN');
            await fetch('/localization', { method: 'POST', body: fd });
          })()
        `,
        awaitPromise: true
      });

      // 2. Add 3 pairs to cart
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4000));
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            const atc = document.querySelector('.uo-pdp-atc-btn');
            if (atc) atc.click();
          })()
        `
      });
      await new Promise(r => setTimeout(r, 3000));

      // 3. Navigate to checkout URL
      console.log('Navigating to checkout...');
      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6000));

      // 4. Inspect checkout url and prices
      const checkoutInfo = await send('Runtime.evaluate', {
        expression: `
          ({
            url: window.location.href,
            title: document.title,
            bodyText: document.body.innerText.substring(0, 1000)
          })
        `,
        returnByValue: true
      });

      console.log('Checkout URL:', checkoutInfo.result?.result?.value?.url);
      console.log('Checkout Title:', checkoutInfo.result?.result?.value?.title);
      
      const snippet = checkoutInfo.result?.result?.value?.bodyText || '';
      console.log('Checkout snippet:', snippet.substring(0, 300));

      ws.close();
      chrome.kill();
      process.exit(0);
    });
  });
}

testCheckout();

