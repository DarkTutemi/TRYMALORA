const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-shopall';

function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/json`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          clearInterval(interval);
          try {
            const tabs = JSON.parse(data);
            const pageTab = tabs.find(t => t.type === 'page') || tabs[0];
            resolve(pageTab.webSocketDebuggerUrl);
          } catch(e) {
            reject(e);
          }
        });
      }).on('error', () => {
        retries++;
        if (retries > 30) {
          clearInterval(interval);
          reject(new Error('Timeout connecting to Chrome CDP'));
        }
      });
    }, 200);
  });
}

async function run() {
  const port = 9335;
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,1100'
  ]);

  try {
    const wsUrl = await getWsUrl(port);
    const ws = new WebSocket(wsUrl);

    let idSeq = 1;
    function send(method, params = {}) {
      return new Promise(resolve => {
        const id = idSeq++;
        const handler = e => {
          const d = JSON.parse(e.data);
          if (d.id === id) {
            ws.removeEventListener('message', handler);
            resolve(d.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(res => ws.addEventListener('open', res));

    await send('Page.enable');
    await send('Runtime.enable');

    // 1. VERIFY HOMEPAGE
    console.log('Navigating to Homepage on draft theme...');
    const homeUrl = 'https://ikwh1h-fx.myshopify.com/?preview_theme_id=197144805747';
    await send('Page.navigate', { url: homeUrl });
    await new Promise(r => setTimeout(r, 4000));

    // Remove preview bars & cookie banners
    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"]').forEach(el => el.remove());
      `
    });

    const homeEval = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const navLinks = Array.from(document.querySelectorAll('.willa-desktop-nav a')).map(a => a.textContent.trim());
          const heroBtns = Array.from(document.querySelectorAll('.zv-hero-section a')).map(a => a.textContent.trim());
          const hasCategories = document.querySelector('.tm-category-cards, [id*="categories"]') !== null;
          const hasShowroomBanner = document.querySelector('.tm-showroom-banner, [id*="showroom"]') !== null;

          return {
            navLinks,
            heroBtns,
            hasCategories,
            hasShowroomBanner
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Homepage Evaluation:', homeEval.result.value);

    const homeShot = await send('Page.captureScreenshot', { format: 'png' });
    const homeShotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_homepage_no_showroom.png';
    fs.writeFileSync(homeShotPath, Buffer.from(homeShot.data, 'base64'));
    console.log('Saved Homepage screenshot to:', homeShotPath);

    // 2. VERIFY SHOP ALL (/collections/all)
    console.log('Navigating to Shop All (/collections/all)...');
    const shopAllUrl = 'https://ikwh1h-fx.myshopify.com/collections/all?preview_theme_id=197144805747';
    await send('Page.navigate', { url: shopAllUrl });
    await new Promise(r => setTimeout(r, 4000));

    await send('Runtime.evaluate', {
      expression: `
        document.querySelectorAll('.shopify-policy-banner, #preview-bar-iframe, iframe[src*="preview"]').forEach(el => el.remove());
      `
    });

    const shopAllEval = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const title = document.querySelector('.tm-catalog-title')?.textContent?.trim();
          const countBadge = document.querySelector('.tm-catalog-count-badge')?.textContent?.trim();
          const productCards = Array.from(document.querySelectorAll('.tm-catalog-card')).map(card => {
            const cardTitle = card.querySelector('.tm-catalog-card-title')?.textContent?.trim();
            const price = card.querySelector('.tm-catalog-price-curr')?.textContent?.trim();
            const btn = card.querySelector('.tm-catalog-btn-primary')?.textContent?.trim();
            return { cardTitle, price, btn };
          });
          const has2dShelves = document.querySelector('.zv-showroom-wrapper, .shelf-theme-wood') !== null;

          return {
            title,
            countBadge,
            totalCards: productCards.length,
            productCards,
            has2dShelves
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Shop All Evaluation:', JSON.stringify(shopAllEval.result.value, null, 2));

    const shopAllShot = await send('Page.captureScreenshot', { format: 'png' });
    const shopAllShotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_shop_all_catalog.png';
    fs.writeFileSync(shopAllShotPath, Buffer.from(shopAllShot.data, 'base64'));
    console.log('Saved Shop All screenshot to:', shopAllShotPath);

    // 3. VERIFY MOBILE SHOP ALL
    console.log('Testing Mobile Shop All...');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true
    });
    await new Promise(r => setTimeout(r, 1000));
    const mobileShot = await send('Page.captureScreenshot', { format: 'png' });
    const mobileShotPath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551\\qa_shop_all_mobile.png';
    fs.writeFileSync(mobileShotPath, Buffer.from(mobileShot.data, 'base64'));
    console.log('Saved Mobile Shop All screenshot to:', mobileShotPath);

    ws.close();
  } catch(e) {
    console.error('Error during verification:', e);
  } finally {
    chromeProcess.kill();
  }
}

run();
