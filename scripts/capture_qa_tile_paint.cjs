const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const previewUrl = 'https://shfc473g83902f70-103245414771.shopifypreview.com/products_preview?preview_key=787b94bf6ecb38207d44b9c3d4f7edd3&preview_theme_id=197144805747';

async function main() {
  console.log('Launching Headless Chrome for Tile Refinishing QA...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9274',
    '--window-size=1440,1100',
    previewUrl
  ]);

  await new Promise(r => setTimeout(r, 2500));

  http.get('http://127.0.0.1:9274/json', res => {
    let raw = '';
    res.on('data', c => raw += c);
    res.on('end', async () => {
      const tabs = JSON.parse(raw);
      const tab = tabs.find(t => t.type === 'page');
      if (!tab) {
        console.error('No page tab found');
        chrome.kill();
        process.exit(1);
      }

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

      console.log('Waiting for page render...');
      await new Promise(r => setTimeout(r, 4500));

      // 1. Remove preview bar and banners
      await send('Runtime.evaluate', {
        expression: `
          const bar = document.getElementById('preview-bar-iframe');
          if (bar) bar.remove();
          const cookie = document.querySelector('.shopify-policy-banner, [aria-label*="Cookie"]');
          if (cookie) cookie.remove();
        `
      });

      // 2. Evaluate DOM structure
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (() => {
            const title = document.querySelector('.zv-pdp-title')?.textContent?.trim();
            const colors = Array.from(document.querySelectorAll('#zvColorPills .zv-option-pill')).map(p => p.textContent.trim());
            const sizes = Array.from(document.querySelectorAll('#zvSizePills .zv-option-pill')).map(p => p.textContent.trim());
            const activePrice = document.querySelector('#zvPriceActive')?.textContent?.trim();
            const ctaMain = document.querySelector('#zvBtnClaimLabel')?.textContent?.trim();
            const ctaSub = document.querySelector('.zv-atc-sub')?.textContent?.trim();
            const shippingText = document.querySelector('#zvBundleShippingText')?.textContent?.trim();
            const shippingClass = document.querySelector('#zvBundleShippingBadge')?.className;
            const b1 = document.querySelector('#zvTileB1Total')?.textContent?.trim();
            const b2 = document.querySelector('#zvTileB2Total')?.textContent?.trim();
            const b3 = document.querySelector('#zvTileB3Total')?.textContent?.trim();
            const videoThumb = document.querySelector('.zv-pdp-thumb.video-thumb') !== null;
            const highlightText = document.querySelector('.zv-pdp-highlight-box')?.textContent?.trim();
            const hasLaserBattle = document.body.innerText.includes('The kids put down their tablets immediately');
            const hiwCards = Array.from(document.querySelectorAll('.tm-setup-img-card h4')).map(h => h.textContent.trim());

            return JSON.stringify({
              title,
              colors,
              sizes,
              activePrice,
              ctaMain,
              ctaSub,
              shippingText,
              shippingClass,
              b1,
              b2,
              b3,
              videoThumb,
              highlightText,
              hasLaserBattle,
              hiwCards
            }, null, 2);
          })()
        `
      });

      console.log('--- PDP DOM EVALUATION ---');
      console.log(evalRes?.result?.value);

      // 3. Capture Desktop Buybox
      const shot1 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_desktop_buybox.png'), Buffer.from(shot1.result.data, 'base64'));
      console.log('Saved qa_tile_desktop_buybox.png');

      // 4. Test selecting 300g and Buy 3 (Price $80.97 >= $70 -> Free Shipping)
      console.log('Testing 300g + Buy 3 tier selection...');
      await send('Runtime.evaluate', {
        expression: `
          const p300 = Array.from(document.querySelectorAll('#zvSizePills .zv-option-pill')).find(p => p.textContent.includes('300g'));
          if (p300) p300.click();
          const b3 = Array.from(document.querySelectorAll('.zv-tile-bundle-card')).find(c => c.getAttribute('data-bundle-tier') === '3');
          if (b3) b3.click();
        `
      });

      await new Promise(r => setTimeout(r, 800));

      const evalTier3 = await send('Runtime.evaluate', {
        expression: `
          (() => {
            return JSON.stringify({
              activePrice: document.querySelector('#zvPriceActive')?.textContent?.trim(),
              ctaMain: document.querySelector('#zvBtnClaimLabel')?.textContent?.trim(),
              shippingText: document.querySelector('#zvBundleShippingText')?.textContent?.trim(),
              shippingClass: document.querySelector('#zvBundleShippingBadge')?.className,
              b3Total: document.querySelector('#zvTileB3Total')?.textContent?.trim(),
              b3Unit: document.querySelector('#zvTileB3Unit')?.textContent?.trim()
            }, null, 2);
          })()
        `
      });
      console.log('--- 300g Buy 3 State ($80.97 >= $70) ---');
      console.log(evalTier3?.result?.value);

      const shot2 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_300g_freeship.png'), Buffer.from(shot2.result.data, 'base64'));
      console.log('Saved qa_tile_300g_freeship.png');

      // 5. Scroll down to How It Works & screenshot
      console.log('Scrolling to How It Works...');
      await send('Runtime.evaluate', {
        expression: `
          const hiw = document.querySelector('.tm-hiw-section');
          if (hiw) hiw.scrollIntoView();
        `
      });
      await new Promise(r => setTimeout(r, 800));
      const shot3 = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_how_it_works.png'), Buffer.from(shot3.result.data, 'base64'));
      console.log('Saved qa_tile_how_it_works.png');

      // 6. Test Mobile Viewport 390px
      console.log('Testing Mobile Viewport 390px...');
      await send('Emulation.setDeviceMetricsOverride', {
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        mobile: true
      });
      await send('Runtime.evaluate', { expression: 'window.scrollTo(0, 0);' });
      await new Promise(r => setTimeout(r, 800));
      const shotMobile = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'qa_tile_mobile.png'), Buffer.from(shotMobile.result.data, 'base64'));
      console.log('Saved qa_tile_mobile.png');

      console.log('All QA screenshots saved successfully!');
      chrome.kill();
      process.exit(0);
    });
  });
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

