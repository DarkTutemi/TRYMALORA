const { spawn } = require('child_process');
const http = require('http');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-test-atc';

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
  const port = 9390;
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

  ws.addEventListener('message', e => {
    const d = JSON.parse(e.data);
    if (d.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', d.params.type, d.params.args.map(a => a.value));
    }
  });
  await send('Runtime.enable');

  console.log('Navigating...');
  await send('Page.navigate', { url: 'https://trymalora.com/products/eyvelle-steam-therapy' });
  await new Promise(r => setTimeout(r, 4500));

  // Check variables in page context
  const evalVars = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const buyBox = document.getElementById('zvPdpBuyBox');
        const cards = buyBox ? buyBox.querySelectorAll('.zv-eye-bundle-card') : [];
        const check = document.getElementById('zvEyeUpsellCheck');
        return {
          buyBoxExists: !!buyBox,
          cardsCount: cards.length,
          selectedCard: document.querySelector('.zv-eye-bundle-card.selected')?.getAttribute('data-bundle-name'),
          checkChecked: check ? check.checked : null,
          hasClaimBtn: !!document.getElementById('zvBtnClaim')
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Eval Vars:', evalVars.result.value);

  // Toggle upsell check programmatically and test updateEyeUI
  const checkToggle = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const check = document.getElementById('zvEyeUpsellCheck');
        check.checked = true;
        check.dispatchEvent(new Event('change', { bubbles: true }));
        return {
          checked: check.checked,
          ctaLabel: document.getElementById('zvBtnClaimLabel')?.textContent?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Check Toggle Result:', checkToggle.result.value);

  // Click ATC button and log result
  console.log('Clicking ATC...');
  const atcClickResult = await send('Runtime.evaluate', {
    expression: `
      (async () => {
        try {
          const btn = document.getElementById('zvBtnClaim');
          btn.click();
          await new Promise(r => setTimeout(r, 3000));
          const res = await fetch('/cart.js');
          const cart = await res.json();
          return {
            itemCount: cart.item_count,
            totalPrice: cart.total_price,
            items: cart.items.map(i => ({ title: i.title, quantity: i.quantity, price: i.price }))
          };
        } catch (err) {
          return { error: err.message, stack: err.stack };
        }
      })()
    `,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('ATC Click Result:', JSON.stringify(atcClickResult.result.value, null, 2));

  ws.close();
  p.kill();
  process.exit(0);
})();

