const { spawn } = require('child_process');
const http = require('http');

async function testVariantSwitch() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9293',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9293/json', res => {
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

      // Set to Vietnam (VND)
      await send('Page.navigate', { url: 'https://trymalora.com/' });
      await new Promise(r => setTimeout(r, 2500));
      await send('Runtime.evaluate', {
        expression: `
          (async function() {
            const fd = new FormData();
            fd.append('_method', 'PUT');
            fd.append('country_code', 'VN');
            await fetch('/localization', { method: 'POST', body: fd });
          })()
        `,
        awaitPromise: true
      });

      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4000));

      // Check initial price in VND
      const before = await send('Runtime.evaluate', {
        expression: `
          ({
            tier1: document.querySelector('.uo-tier-card[data-tier="1-pair"] .uo-tier-final-price')?.textContent?.trim(),
            tier3: document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-final-price')?.textContent?.trim(),
            tier5: document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-final-price')?.textContent?.trim()
          })
        `,
        returnByValue: true
      });
      console.log('Before variant switch (VND):', before.result?.result?.value);

      // Click color Orange
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            const orangeBtn = document.querySelector('.uo-color-swatch[data-color-name="Orange"]');
            if (orangeBtn) orangeBtn.click();
          })()
        `
      });
      await new Promise(r => setTimeout(r, 500));

      // Click size XL
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            const xlBtn = document.querySelector('.uo-size-pill[data-size="XL"]');
            if (xlBtn) xlBtn.click();
          })()
        `
      });
      await new Promise(r => setTimeout(r, 500));

      // Check after variant switch
      const after = await send('Runtime.evaluate', {
        expression: `
          ({
            tier1: document.querySelector('.uo-tier-card[data-tier="1-pair"] .uo-tier-final-price')?.textContent?.trim(),
            tier3: document.querySelector('.uo-tier-card[data-tier="3-pairs"] .uo-tier-final-price')?.textContent?.trim(),
            tier5: document.querySelector('.uo-tier-card[data-tier="5-pairs"] .uo-tier-final-price')?.textContent?.trim(),
            selectedSize: window.uoState?.selectedSize,
            selectedColor: window.uoState?.selectedColor,
            stickySummary: document.getElementById('uoStickySummary')?.textContent?.trim()
          })
        `,
        returnByValue: true
      });
      console.log('After variant switch (Orange / XL in VND):', after.result?.result?.value);

      ws.close();
      chrome.kill();
      process.exit(0);
    });
  });
}

testVariantSwitch();

