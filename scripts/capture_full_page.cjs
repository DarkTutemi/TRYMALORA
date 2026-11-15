const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-pdp-v3-sections2';

async function main() {
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9294',
    '--window-size=1440,1200',
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

      await send('Emulation.setDeviceMetricsOverride', {
        width: 1440,
        height: 1000,
        deviceScaleFactor: 2,
        mobile: false
      });

      console.log('Navigating to live PDP...');
      await send('Page.navigate', { url: 'https://trymalora.com/products/full-spine-ultra-overnight' });
      await new Promise(r => setTimeout(r, 4500));

      const sections = [
        { sel: '#ultra-protection-story', name: 'qa_sec_editorial.png' },
        { sel: '.uo-layers-section', name: 'qa_sec_layers.png' },
        { sel: '#ultra-lifestyle-comfort', name: 'qa_sec_comfort.png' },
        { sel: '#ultra-fabric-experience', name: 'qa_sec_fabric.png' },
        { sel: '#ultra-product-details', name: 'qa_sec_tabs_specs.png' },
        { sel: '#ultra-closing-reminder', name: 'qa_sec_closing_reminder.png' }
      ];

      for (const s of sections) {
        const evalRes = await send('Runtime.evaluate', {
          expression: `
            (() => {
              const el = document.querySelector('${s.sel}');
              if (!el) return { found: false };
              const rect = el.getBoundingClientRect();
              const y = window.pageYOffset + rect.top;
              window.scrollTo({ top: Math.max(0, y - 60), behavior: 'instant' });
              return { found: true, y };
            })()
          `,
          returnByValue: true
        });
        console.log(`Section ${s.sel}:`, evalRes.result?.value);
        await new Promise(r => setTimeout(r, 800));
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, s.name), Buffer.from(shot.result.data, 'base64'));
        console.log(`Saved ${s.name}`);
      }

      ws.close();
      chrome.kill();
      console.log('Done capturing sections!');
    });
  });
}

main().catch(console.error);

