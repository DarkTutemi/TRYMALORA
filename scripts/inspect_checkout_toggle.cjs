const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-checkout-toggle';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--window-size=390,920',
    `--user-data-dir=${userDataDir}`,
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2500));

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

      await send('Page.navigate', { url: 'https://trymalora.com/checkout' });
      await new Promise(r => setTimeout(r, 6000));

      const buttons = await send('Runtime.evaluate', {
        expression: `
          Array.from(document.querySelectorAll('button, [role="button"], summary')).map(b => ({
            tag: b.tagName,
            id: b.id,
            className: b.className,
            text: b.innerText,
            ariaExpanded: b.getAttribute('aria-expanded'),
            ariaControls: b.getAttribute('aria-controls')
          }))
        `,
        returnByValue: true
      });
      console.log('Buttons on checkout:', JSON.stringify(buttons.result?.result?.value, null, 2));

      // Click the button that controls order summary
      await send('Runtime.evaluate', {
        expression: `
          const btn = Array.from(document.querySelectorAll('button, summary')).find(b => 
            (b.getAttribute('aria-controls') && b.getAttribute('aria-controls').includes('summary')) ||
            (b.innerText && b.innerText.includes('Order summary'))
          );
          if (btn) btn.click();
        `
      });
      await new Promise(r => setTimeout(r, 1500));

      const shotSummary = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_live_v3_checkout_summary_open.png'), Buffer.from(shotSummary.result.data, 'base64'));
      console.log('Saved qa_live_v3_checkout_summary_open.png');

      ws.close();
      chrome.kill();
    });
  });
}

main().catch(console.error);

