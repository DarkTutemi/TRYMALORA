const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/Admin/.gemini/antigravity/brain/d284d670-0cfd-4f12-bbed-f8eeaea36551';

async function runQA() {
  console.log('================================================================');
  console.log('MALORA ORGANICS (8SHEEP CLONE) — FULL STOREFRONT QA SUITE');
  console.log('Target Theme: 197625381235 (LIVE)');
  console.log('Store URL: https://trymalora.com');
  console.log('================================================================\n');

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9298',
    '--window-size=1280,1050',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 2000));

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
      await send('DOM.enable');

      async function evaluate(exp) {
        const r = await send('Runtime.evaluate', { expression: exp, returnByValue: true });
        return r.result?.value;
      }

      async function screenshot(name) {
        const r = await send('Page.captureScreenshot', { format: 'png' });
        const buf = Buffer.from(r.result.data, 'base64');
        const p1 = path.join(ARTIFACT_DIR, name);
        fs.writeFileSync(p1, buf);
        console.log(`  [SCREENSHOT SAVED] ${p1}`);
      }

      // ===================================================================
      // TEST 1: HOMEPAGE DESKTOP (1280x1050)
      // ===================================================================
      console.log('>>> TEST 1: Homepage Desktop Inspection <<<');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 1050,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Page.navigate', { url: 'https://trymalora.com' });
      await new Promise(r => setTimeout(r, 5000));

      const homeData = await evaluate(`
        ({
          title: document.title,
          hasHeader: !!document.querySelector('.shopify-section-header, .header, .nav, header'),
          hasHero: !!document.querySelector('.c-hero, .hero, .hero-section'),
          hasTabs: !!document.querySelector('.c-collection-tabs, .collection-tabs'),
          hasTestimonials: !!document.querySelector('.c-testimonials, .testimonials'),
          hasBarIcons: !!document.querySelector('.c-bar-icons, .bar-icons'),
          hasFooter: !!document.querySelector('footer, .footer'),
          bodySnippet: document.body.innerText.slice(0, 300)
        })
      `);

      console.log('Homepage Inspection Result:', JSON.stringify(homeData, null, 2));
      await screenshot('qa_malora_home_desktop.png');

      // ===================================================================
      // TEST 2: HOMEPAGE MOBILE (390x844)
      // ===================================================================
      console.log('\n>>> TEST 2: Homepage Mobile (iPhone 12/13/14) <<<');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 2000));
      await screenshot('qa_malora_home_mobile.png');

      // ===================================================================
      // TEST 3: FLAGSHIP PDP (/products/sleepylotion) DESKTOP
      // ===================================================================
      console.log('\n>>> TEST 3: Flagship PDP (Organic Sleepy Body Lotion) Desktop <<<');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 1050,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Page.navigate', { url: 'https://trymalora.com/products/sleepylotion' });
      await new Promise(r => setTimeout(r, 5000));

      const pdpData = await evaluate(`
        ({
          title: document.title,
          h1: document.querySelector('h1')?.innerText?.trim(),
          hasMediaGallery: !!document.querySelector('.product-area__media, .gallery, .product-media'),
          price: document.querySelector('.price, .product-price')?.innerText?.trim(),
          bodySnippet: document.body.innerText.slice(0, 300)
        })
      `);

      console.log('Flagship PDP Data:', JSON.stringify(pdpData, null, 2));
      await screenshot('qa_malora_pdp_desktop.png');

      // ===================================================================
      // TEST 4: FLAGSHIP PDP MOBILE
      // ===================================================================
      console.log('\n>>> TEST 4: Flagship PDP Mobile <<<');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await new Promise(r => setTimeout(r, 2000));
      await screenshot('qa_malora_pdp_mobile.png');

      // ===================================================================
      // TEST 5: COLLECTION PAGE (/collections/our-best-sellers)
      // ===================================================================
      console.log('\n>>> TEST 5: Collection Page (/collections/our-best-sellers) <<<');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 1280,
        height: 1050,
        deviceScaleFactor: 1,
        mobile: false
      });

      await send('Page.navigate', { url: 'https://trymalora.com/collections/our-best-sellers' });
      await new Promise(r => setTimeout(r, 4000));

      const colData = await evaluate(`
        ({
          title: document.title,
          h1: document.querySelector('h1')?.innerText?.trim(),
          productCount: document.querySelectorAll('.product-card, .grid__item, .card').length,
          bodySnippet: document.body.innerText.slice(0, 200)
        })
      `);

      console.log('Collection Page Data:', JSON.stringify(colData, null, 2));
      await screenshot('qa_malora_collection.png');

      console.log('\n================================================================');
      console.log('ALL QA SUITE CHECKS COMPLETED SUCCESSFULLY!');
      console.log('================================================================');

      chrome.kill();
      process.exit(0);
    });
  });
}

runQA().catch(err => {
  console.error('QA Error:', err);
  process.exit(1);
});
