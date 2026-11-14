const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-ultra';
const DOMAIN = 'ikwh1h-fx.myshopify.com';
const DRAFT_THEME_ID = '197625381235';
const PREVIEW_URL = 'https://x0fgor9atjvavmcs-103245414771.shopifypreview.com/products_preview?preview_key=37862dd919dbb983288cb26033a14ec9';

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
  const port = 9414;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,1200'
  ]);

  const wsUrl = await getWsUrl(port);
  const ws = new WebSocket(wsUrl);

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

  function getVal(res) {
    if (!res) return null;
    if (res.result && res.result.value !== undefined) return res.result.value;
    if (res.value !== undefined) return res.value;
    return res;
  }

  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Testing preview URL with preview_theme_id: ' + PREVIEW_URL + '&preview_theme_id=' + DRAFT_THEME_ID);
  await send('Page.navigate', { url: `${PREVIEW_URL}&preview_theme_id=${DRAFT_THEME_ID}` });
  await new Promise(r => setTimeout(r, 4500));

  const pageInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.title,
          url: window.location.href,
          h1: document.querySelector('h1')?.textContent?.trim(),
          is404: document.body.textContent.includes('404') || document.body.textContent.includes('Page not found'),
          hasBuyBox: document.getElementById('uoBuyBox') !== null,
          hasProductTitle: document.querySelector('.uo-product-title')?.textContent?.trim(),
          swatchesCount: document.querySelectorAll('.uo-color-swatch').length,
          sizePillsCount: document.querySelectorAll('.uo-size-pill').length,
          tierCardsCount: document.querySelectorAll('.uo-tier-card').length,
          atcBtnText: document.querySelector('.uo-pdp-atc-btn')?.textContent?.trim(),
          isAtcDisabled: document.querySelector('.uo-pdp-atc-btn')?.disabled,
          sections: {
            main: document.querySelector('.uo-pdp-section') !== null,
            editorial: document.querySelector('.uo-pdp-editorial') !== null,
            layers: document.querySelector('.uo-layers-section') !== null,
            pillars: document.querySelector('.uo-pillars-section') !== null,
            comfort: document.querySelector('.uo-comfort-section') !== null,
            hiw: document.querySelector('.uo-hiw-section') !== null,
            tabs: document.querySelector('.uo-tabs-section') !== null,
            reviews: document.querySelector('.uo-reviews-section') !== null,
            faq: document.querySelector('.uo-faq-section') !== null,
            closing: document.querySelector('.uo-closing-section') !== null
          }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Admin Preview test result:', JSON.stringify(getVal(pageInfo), null, 2));

  // Also check without preview_theme_id to see what template is used
  console.log('\nTesting preview URL without preview_theme_id: ' + PREVIEW_URL);
  await send('Page.navigate', { url: PREVIEW_URL });
  await new Promise(r => setTimeout(r, 4500));

  const pageInfo2 = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.title,
          url: window.location.href,
          h1: document.querySelector('h1')?.textContent?.trim(),
          hasBuyBox: document.getElementById('uoBuyBox') !== null,
          atcBtnText: document.querySelector('.uo-pdp-atc-btn')?.textContent?.trim() || document.querySelector('button[type="submit"]')?.textContent?.trim()
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Default Admin Preview result:', JSON.stringify(getVal(pageInfo2), null, 2));

  p.kill();
  process.exit(0);
})();
