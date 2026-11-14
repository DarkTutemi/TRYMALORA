const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const THEME_ID = '197144805747';

async function diagnose() {
  console.log('Starting Chrome for diagnosis...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9268',
    '--window-size=1280,1000',
    'https://trymalora.com/password?preview_theme_id=' + THEME_ID
  ]);

  await new Promise(r => setTimeout(r, 2000));
  http.get('http://127.0.0.1:9268/json', res => {
    let raw = ''; res.on('data', c => raw += c);
    res.on('end', async () => {
      const tabs = JSON.parse(raw);
      const tab = tabs.find(t => t.type === 'page');
      const ws = new WebSocket(tab.webSocketDebuggerUrl);
      await new Promise(r => ws.addEventListener('open', r));
      let id = 1;
      function send(method, params = {}) {
        return new Promise(r => {
          const reqId = id++;
          const h = e => {
            const data = JSON.parse(e.data);
            if (data.id === reqId) { ws.removeEventListener('message', h); r(data); }
          };
          ws.addEventListener('message', h);
          ws.send(JSON.stringify({ id: reqId, method, params }));
        });
      }

      await send('Page.enable');
      await send('Runtime.enable');

      const consoleLogs = [];
      ws.addEventListener('message', e => {
        const d = JSON.parse(e.data);
        if (d.method === 'Runtime.consoleAPICalled') {
          consoleLogs.push({ type: d.params.type, args: d.params.args.map(a => a.value) });
        }
      });

      // Enter password
      console.log('Entering password...');
      await send('Runtime.evaluate', {
        expression: `
          const pass = document.getElementById('password') || document.querySelector('input[type="password"]');
          if (pass) {
            pass.value = ${JSON.stringify(STORE_PASSWORD)};
            const form = pass.closest('form');
            if (form) form.submit();
          }
        `
      });

      await new Promise(r => setTimeout(r, 3000));

      // Test 1: Visit Live Product
      console.log('Navigating to Live product...');
      await send('Page.navigate', {
        url: 'https://trymalora.com/products/kids-infrared-battle-blaster-set-with-target-projector?preview_theme_id=' + THEME_ID
      });
      await new Promise(r => setTimeout(r, 4000));

      let state1 = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          url: window.location.href,
          title: document.title,
          h1: document.querySelector('h1')?.innerText,
          bodyText: document.body?.innerText?.slice(0, 400),
          hasMain: !!document.querySelector('.zv-pdp-section, .zavelyn-v4-pdp-main, #tmFeaturedProducts'),
          is404: document.body.innerText.includes('404') || document.title.includes('404') || document.title.includes('Not Found')
        })`
      });
      console.log('State 1 (Live product):', JSON.parse(state1.result.value || '{}'));

      let shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_live_product.png'), Buffer.from(shot1.result.data, 'base64'));

      // Test 2: Visit Draft product 1
      console.log('Navigating to Draft product: car-metal-rust-repair-paste...');
      await send('Page.navigate', {
        url: 'https://trymalora.com/products/car-metal-rust-repair-paste?preview_theme_id=' + THEME_ID
      });
      await new Promise(r => setTimeout(r, 4000));

      let state2 = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
          url: window.location.href,
          title: document.title,
          h1: document.querySelector('h1')?.innerText,
          bodyText: document.body?.innerText?.slice(0, 400),
          is404: document.body.innerText.includes('404') || document.title.includes('404') || document.title.includes('Page Not Found') || document.title.includes('Not Found')
        })`
      });
      console.log('State 2 (Draft product):', JSON.parse(state2.result.value || '{}'));

      let shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'debug_draft_product.png'), Buffer.from(shot2.result.data, 'base64'));

      // Test 3: What does the user see when clicking from homepage?
      console.log('Navigating to Draft homepage...');
      await send('Page.navigate', {
        url: 'https://trymalora.com/?preview_theme_id=' + THEME_ID
      });
      await new Promise(r => setTimeout(r, 3000));

      let links = await send('Runtime.evaluate', {
        expression: `Array.from(document.querySelectorAll('a')).map(a => a.href).filter(h => h.includes('/products/'))`
      });
      console.log('Product links on homepage:', links.result.value);

      console.log('Console logs:', consoleLogs.slice(-10));
      chrome.kill();
      process.exit(0);
    });
  });
}

diagnose();
