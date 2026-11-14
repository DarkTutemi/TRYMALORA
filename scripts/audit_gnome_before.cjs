const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-audit-before';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\43d9c775-1dab-4bdb-8d9b-3c1d86fa5c71';

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
          } catch (e) { reject(e); }
        });
      }).on('error', () => { if (++retries > 30) reject(new Error('WS timeout')); });
    }, 200);
  });
}

(async () => {
  const port = 9391;
  const p = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + port,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,900'
  ]);

  try {
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

    await new Promise(r => ws.addEventListener('open', r, { once: true }));
    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

    const targetUrl = 'https://ikwh1h-fx.myshopify.com/products/christmas-lantern-welcome-gnome?preview_theme_id=197144805747';
    await send('Page.navigate', { url: targetUrl });
    await new Promise(r => setTimeout(r, 4500));

    // Dismiss cookie banner for clean screenshot inspection
    await send('Runtime.evaluate', {
      expression: `(() => {
        document.querySelectorAll('#shopify-pc__banner, .shopify-policy__banner').forEach(el => el.remove());
      })()`
    });
    await new Promise(r => setTimeout(r, 300));

    const desktopAudit = await send('Runtime.evaluate', {
      expression: `(() => {
        const imgs = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src.slice(0, 90),
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          width: img.clientWidth,
          height: img.clientHeight
        }));
        const brokenImgs = imgs.filter(i => !i.complete || i.naturalWidth === 0);
        const h1 = document.querySelector('h1');
        const h1Style = h1 ? getComputedStyle(h1) : null;
        const bodyStyle = getComputedStyle(document.body);
        const livePill = document.querySelector('.zv-live-pill, .zv-viewing-pill, [class*="live"], [class*="viewer"]');
        const ratingRow = document.querySelector('.zv-rating-row, .zv-trustpilot-row');
        const reviewHeading = document.querySelector('#zvReviewsHeading, .zv-reviews-header, .zv-reviews-summary');
        const mainImg = document.querySelector('.zv-main-img, #zvMainImg');
        const stickyAtc = document.querySelector('.zv-sticky-atc, #zvStickyAtc');
        const accordions = Array.from(document.querySelectorAll('.zv-acc-header, .zv-faq-q, details summary')).map(el => el.innerText.trim());
        const bundleCards = Array.from(document.querySelectorAll('.zv-gnome-bundle-card')).map(el => ({
          tier: el.getAttribute('data-bundle-tier'),
          selected: el.classList.contains('selected'),
          text: el.innerText.replace(/\\s+/g, ' ').trim()
        }));
        const qtySelector = document.querySelector('input[name="quantity"], .zv-qty-input, .zv-qty-selector');
        return {
          title: document.title,
          scrollHeight: document.body.scrollHeight,
          overflowsDesktop: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          brokenImagesCount: brokenImgs.length,
          brokenImgs,
          totalImgs: imgs.length,
          fonts: {
            h1Font: h1Style ? h1Style.fontFamily + ' @ ' + h1Style.fontSize : null,
            bodyFont: bodyStyle.fontFamily + ' @ ' + bodyStyle.fontSize
          },
          livePillText: livePill ? livePill.innerText.trim() : null,
          ratingRowText: ratingRow ? ratingRow.innerText.replace(/\\s+/g, ' ').trim() : null,
          reviewSectionText: reviewHeading ? reviewHeading.innerText.replace(/\\s+/g, ' ').trim().slice(0, 150) : null,
          mainGalleryHasZoom: !!document.querySelector('.zv-gallery-zoom-btn, .zv-main-zoom'),
          hasQuantitySelector: !!qtySelector,
          hasStickyAtc: !!stickyAtc,
          stickyVisibleAtTop: stickyAtc ? getComputedStyle(stickyAtc).display + ' / ' + getComputedStyle(stickyAtc).opacity : null,
          accordions,
          bundleCards,
          sectionsCount: document.querySelectorAll('.shopify-section').length,
          sectionIds: Array.from(document.querySelectorAll('.shopify-section')).map(s => s.id)
        };
      })()`,
      returnByValue: true
    });
    console.log('=== BEFORE DESKTOP AUDIT ===\n', JSON.stringify(desktopAudit.result?.value, null, 2));

    const desktopShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'before_desktop_above_fold.png'), Buffer.from(desktopShot.data, 'base64'));

    // Mobile check (390x844)
    await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 800));

    const mobileAudit = await send('Runtime.evaluate', {
      expression: `(() => {
        window.scrollTo(0, 0);
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          overflowsMobile: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          bodyHeight: document.body.scrollHeight
        };
      })()`,
      returnByValue: true
    });
    const mobTopShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'before_mobile_top.png'), Buffer.from(mobTopShot.data, 'base64'));

    // Scroll down on mobile to check sticky ATC
    await send('Runtime.evaluate', { expression: `window.scrollTo(0, 1200);` });
    await new Promise(r => setTimeout(r, 700));
    const mobScrollAudit = await send('Runtime.evaluate', {
      expression: `(() => {
        const sticky = document.querySelector('.zv-sticky-atc, #zvStickyAtc');
        return {
          stickyExists: !!sticky,
          stickyClasses: sticky ? sticky.className : null,
          stickyRect: sticky ? sticky.getBoundingClientRect() : null,
          stickyVisible: sticky ? (sticky.getBoundingClientRect().height > 0 && getComputedStyle(sticky).visibility !== 'hidden') : false
        };
      })()`,
      returnByValue: true
    });
    console.log('=== BEFORE MOBILE AUDIT ===\n', JSON.stringify({ ...mobileAudit.result?.value, ...mobScrollAudit.result?.value }, null, 2));

    const mobScrollShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(artifactsDir, 'before_mobile_scrolled.png'), Buffer.from(mobScrollShot.data, 'base64'));

    ws.close();
  } catch (err) {
    console.error('Audit Error:', err);
  } finally {
    p.kill();
  }
})();

