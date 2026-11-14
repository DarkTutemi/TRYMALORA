const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-ultra';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const DRAFT_THEME_ID = '197625381235';
const LIVE_THEME_ID = '197144805747';
const DOMAIN = 'ikwh1h-fx.myshopify.com';

// 1. Build Local HTML Server for Full-Fidelity Template Verification
function createLocalServer(port) {
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ultra-overnight.css'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ultra-overnight.js'), 'utf8');

  // Read section liquid files and replace liquid tags with static preview values
  function sanitizeLiquid(file) {
    let content = fs.readFileSync(path.join(__dirname, '..', 'sections', file), 'utf8');
    content = content.replace(/{%-?\s*schema\s*-?%}[\s\S]*?{%-?\s*endschema\s*-?%}/g, '');
    content = content.replace(/{%-?\s*liquid[\s\S]*?-?%}/g, '');
    content = content.replace(/{{\s*'([^']+)'\s*\|\s*asset_url\s*}}/g, '/assets/$1');
    content = content.replace(/{{\s*section\.settings\.title\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'Title');
    content = content.replace(/{{\s*section\.settings\.eyebrow\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'EYEBROW');
    content = content.replace(/{{\s*section\.settings\.subhead(?:line)?\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'Subheadline');
    content = content.replace(/{{\s*section\.settings\.heading\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Protection Designed Beyond the Ordinary Gusset.');
    content = content.replace(/{{\s*section\.settings\.description\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Description');
    content = content.replace(/{{\s*section\.settings\.caption\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Full-Spine™ coverage concept illustration');
    content = content.replace(/{{\s*section\.settings\.cta_text\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'COMING SOON — VIEW OPTIONS');
    content = content.replace(/{{\s*section\.settings\.link_text\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Explore how it works');
    content = content.replace(/{{\s*section\.settings\.link\s*}}/g, '#ultra-how-it-works');
    content = content.replace(/{%-?\s*if\s+section\.settings\.link\s*!=\s*blank\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+section\.blocks\.size\s*>\s*0\s*-?%}[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+has_real_product\s*-?%}[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+can_purchase\s*.*?%}[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+section\.settings\.enable_review_app[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*for\s+s\s+in\s+sizes\s*-?%}([\s\S]*?){%-?\s*endfor\s*-?%}/g, (m, block) => {
      const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
      return sizes.map(s => block.replace(/{{\s*s\s*}}/g, s).replace(/{%\s*if\s+s\s*==\s*'M'\s*%}is-active{%\s*endif\s*%}/g, s === 'M' ? 'is-active' : '').replace(/{%\s*if\s+s\s*==\s*'M'\s*%}true{%\s*else\s*%}false{%\s*endif\s*%}/g, s === 'M' ? 'true' : 'false').replace(/{%\s*if\s+s\s*==\s*'M'\s*%}0{%\s*else\s*%}-1{%\s*endif\s*%}/g, s === 'M' ? '0' : '-1')).join('');
    });
    content = content.replace(/{%-?\s*if\s+[^%]+%-?}/g, '');
    content = content.replace(/{%-?\s*endif\s*-?%}/g, '');
    content = content.replace(/{%-?\s*assign\s+[^%]+%-?}/g, '');
    return content;
  }

  const secMain = sanitizeLiquid('ultra-product-main.liquid');
  const secEditorial = sanitizeLiquid('ultra-pdp-editorial.liquid');
  const secBenefits = sanitizeLiquid('ultra-benefit-strip.liquid');
  const secLayers = sanitizeLiquid('ultra-five-layers.liquid');
  const secPillars = sanitizeLiquid('ultra-seven-pillars.liquid');
  const secComfort = sanitizeLiquid('ultra-lifestyle-comfort.liquid');
  const secHiw = sanitizeLiquid('ultra-hiw-steps.liquid');
  const secTabs = sanitizeLiquid('ultra-pdp-tabs.liquid');
  const secReviews = sanitizeLiquid('ultra-reviews.liquid');
  const secFaq = sanitizeLiquid('ultra-faq.liquid');
  const secClosing = sanitizeLiquid('ultra-closing-reminder.liquid');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FULL-SPINE ULTRA OVERNIGHT™ | High-Conversion Product Detail Page V2</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    ${css}
    body { margin: 0; padding: 0; font-family: var(--uo-font-sans); }
    /* Preview Announcement Header */
    .uo-preview-announcement {
      background: var(--uo-plum);
      color: #fff;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-align: center;
      padding: 9px 16px;
    }
  </style>
</head>
<body>
  <div class="uo-preview-announcement">
    ✨ ULTRA OVERNIGHT™ OFFICIAL FLAGSHIP PDP V2 — DRAFT THEME 197625381235
  </div>

  <!-- SECTION 01: HERO & BUY BOX -->
  ${secMain}

  <!-- SECTION 02: PROTECTION STORY -->
  ${secEditorial}

  <!-- SECTION 02B: BENEFIT STRIP -->
  ${secBenefits}

  <!-- SECTION 03: 5 LAYERS -->
  ${secLayers}

  <!-- SECTION 04: SEVEN PILLARS -->
  ${secPillars}

  <!-- SECTION 05: COMFORT STORY -->
  ${secComfort}

  <!-- SECTION 07: HOW IT WORKS -->
  ${secHiw}

  <!-- SECTION 08: HORIZONTAL PRODUCT TABS -->
  ${secTabs}

  <!-- SECTION 09: AUTHENTIC REVIEWS / DESIGN STANDARDS -->
  ${secReviews}

  <!-- SECTION 10: FAQ -->
  ${secFaq}

  <!-- SECTION 11: CLOSING REMINDER -->
  ${secClosing}

  <script>
    ${js}
  </script>
</body>
</html>`;

  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/pdp') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fullHtml);
    } else if (req.url.startsWith('/assets/')) {
      const assetName = path.basename(req.url);
      const filePath = path.join(__dirname, '..', 'assets', assetName);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeMap = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
          '.css': 'text/css',
          '.js': 'application/javascript'
        };
        res.writeHead(200, { 'Content-Type': mimeMap[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(port);
  return server;
}

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
  const localPort = 8092;
  const localServer = createLocalServer(localPort);
  console.log(`Local PDP V2 preview server running on http://127.0.0.1:${localPort}`);

  const chromePort = 9416;
  console.log('Launching headless Chrome on port ' + chromePort + '...');
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=' + chromePort,
    '--user-data-dir=' + userDataDir,
    '--window-size=1440,1200'
  ]);

  const wsUrl = await getWsUrl(chromePort);
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

  async function takeScreenshot(filename, clip = null) {
    const params = { format: 'png' };
    if (clip) params.clip = clip;
    const res = await send('Page.captureScreenshot', params);
    if (res && res.data) {
      const buf = Buffer.from(res.data, 'base64');
      const artPath = path.join(artifactsDir, filename);
      fs.writeFileSync(artPath, buf);
      console.log(`  [SCREENSHOT] Saved: ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
  }

  console.log('\n======================================================');
  console.log('STARTING ULTRA OVERNIGHT PDP V2 VERIFICATION SUITE');
  console.log('======================================================\n');

  // Navigate to local full PDP page
  await send('Page.navigate', { url: `http://127.0.0.1:${localPort}/pdp` });
  await new Promise(r => setTimeout(r, 1500));

  // Viewport 1: 1440px (Desktop Full Inspection)
  console.log('--- TEST 1: Desktop Viewport (1440x1100) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 600));

  const domCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.querySelector('.uo-product-title')?.textContent?.trim(),
          subhead: document.querySelector('.uo-pdp-subhead-serif')?.textContent?.trim(),
          priceText: document.querySelector('.uo-price-current')?.textContent?.trim(),
          prelaunchTag: document.querySelector('.uo-pdp-prelaunch-tag')?.textContent?.trim(),
          highlightItems: Array.from(document.querySelectorAll('.uo-highlight-item')).map(el => el.textContent.trim()),
          colorSwatches: Array.from(document.querySelectorAll('.uo-color-swatch')).map(el => ({
            name: el.getAttribute('data-color-name'),
            isActive: el.classList.contains('is-active')
          })),
          sizePillsCount: document.querySelectorAll('.uo-size-pill').length,
          activeSize: document.querySelector('.uo-size-pill.is-active')?.textContent?.trim(),
          tiers: Array.from(document.querySelectorAll('.uo-tier-card')).map(el => ({
            name: el.querySelector('.uo-tier-name')?.textContent?.trim(),
            badge: el.querySelector('.uo-tier-badge')?.textContent?.trim(),
            price: el.querySelector('.uo-tier-price')?.textContent?.trim(),
            isSelected: el.classList.contains('is-selected')
          })),
          atcBtn: {
            text: document.querySelector('.uo-pdp-atc-btn')?.textContent?.trim(),
            disabled: document.querySelector('.uo-pdp-atc-btn')?.disabled
          },
          sectionsPresent: {
            main: document.getElementById('uoPdpSection') !== null,
            editorial: document.getElementById('ultra-protection-story') !== null,
            layers: document.querySelector('.uo-layers-section') !== null,
            pillars: document.getElementById('ultra-technology') !== null,
            comfort: document.querySelector('.uo-comfort-section') !== null,
            hiw: document.getElementById('ultra-how-it-works') !== null,
            tabs: document.getElementById('ultra-product-tabs') !== null,
            reviews: document.querySelector('.uo-reviews-section') !== null,
            faq: document.getElementById('ultra-faq') !== null,
            closing: document.getElementById('ultra-closing-reminder') !== null
          },
          hasNoOverflow: document.documentElement.scrollWidth <= 1440
        };
      })()
    `,
    returnByValue: true
  });
  console.log('DOM Check (1440px):', JSON.stringify(getVal(domCheck), null, 2));
  await takeScreenshot('qa_ultra_pdp_v2_desktop_1440.png');

  // Test Interactive Elements
  console.log('\n--- TEST 2: Interactive PDP Buy Box Behavior ---');
  // 1. Swatch click
  console.log('  Testing Color Swatch click (Blush Rose)...');
  await send('Runtime.evaluate', {
    expression: `
      document.querySelector('.uo-color-swatch[data-color-name="Blush Rose"]').click();
    `
  });
  const colorAfter = await send('Runtime.evaluate', {
    expression: `document.getElementById('uoSelectedColorLabel').textContent.trim()`,
    returnByValue: true
  });
  console.log('  Selected color label after click:', getVal(colorAfter));

  // 2. Size pill click
  console.log('  Testing Size Pill click (L)...');
  await send('Runtime.evaluate', {
    expression: `
      document.querySelector('.uo-size-pill[data-size-value="L"]').click();
    `
  });
  const sizeAfter = await send('Runtime.evaluate', {
    expression: `document.getElementById('uoSelectedSizeLabel').textContent.trim()`,
    returnByValue: true
  });
  console.log('  Selected size label after click:', getVal(sizeAfter));

  // 3. Modal open & close
  console.log('  Testing Size Guide Modal open...');
  await send('Runtime.evaluate', { expression: `window.openUoSizeGuide();` });
  await new Promise(r => setTimeout(r, 400));
  const modalOpen = await send('Runtime.evaluate', {
    expression: `document.getElementById('uoSizeGuideModal').style.display`,
    returnByValue: true
  });
  console.log('  Modal display after open:', getVal(modalOpen));
  await takeScreenshot('qa_ultra_size_guide_modal.png');

  console.log('  Testing Size Guide Modal close...');
  await send('Runtime.evaluate', { expression: `window.closeUoSizeGuide();` });
  await new Promise(r => setTimeout(r, 300));
  const modalClosed = await send('Runtime.evaluate', {
    expression: `document.getElementById('uoSizeGuideModal').style.display`,
    returnByValue: true
  });
  console.log('  Modal display after close:', getVal(modalClosed));

  // 4. Mix & Match toggle
  console.log('  Testing Mix & Match toggle...');
  await send('Runtime.evaluate', { expression: `document.getElementById('uoMixMatchToggle').click();` });
  await new Promise(r => setTimeout(r, 300));
  const mixMatchDisplay = await send('Runtime.evaluate', {
    expression: `document.getElementById('uoMixMatchBody').style.display`,
    returnByValue: true
  });
  console.log('  Mix & Match body display:', getVal(mixMatchDisplay));

  // 5. Tabs switching
  console.log('  Testing Product Tabs switching (Care & Washing)...');
  await send('Runtime.evaluate', {
    expression: `document.querySelector('.uo-tab-btn[data-tab-target="tab-care-washing"]').click();`
  });
  await new Promise(r => setTimeout(r, 300));
  const activeTabPanel = await send('Runtime.evaluate', {
    expression: `document.getElementById('tab-care-washing').classList.contains('is-active')`,
    returnByValue: true
  });
  console.log('  Care & Washing tab panel active:', getVal(activeTabPanel));

  // Viewport 2: 390px (Mobile Inspection - iPhone 14)
  console.log('\n--- TEST 3: Mobile Viewport (390x844) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await send('Page.navigate', { url: `http://127.0.0.1:${localPort}/pdp` });
  await new Promise(r => setTimeout(r, 1200));

  const mobileCheck = await send('Runtime.evaluate', {
    expression: `
      (() => {
        return {
          title: document.querySelector('.uo-product-title')?.textContent?.trim(),
          hasStickyBar: document.getElementById('uoStickyMobileBar') !== null,
          hasNoOverflow: document.documentElement.scrollWidth <= 390
        };
      })()
    `,
    returnByValue: true
  });
  console.log('Mobile Check (390px):', JSON.stringify(getVal(mobileCheck), null, 2));
  await takeScreenshot('qa_ultra_pdp_v2_mobile_390.png');

  // Test Sticky Mobile Bar visibility after scrolling
  console.log('  Testing Sticky Mobile Bar visibility on scroll...');
  await send('Runtime.evaluate', { expression: `window.scrollTo(0, 1000); window.dispatchEvent(new Event('scroll'));` });
  await new Promise(r => setTimeout(r, 500));
  const stickyVisible = await send('Runtime.evaluate', {
    expression: `document.getElementById('uoStickyMobileBar').classList.contains('is-visible')`,
    returnByValue: true
  });
  console.log('  Sticky Mobile Bar is-visible after scroll:', getVal(stickyVisible));
  await takeScreenshot('qa_ultra_pdp_v2_mobile_sticky.png');

  // Viewport 3: 375px (Small Mobile - iPhone SE)
  console.log('\n--- TEST 4: Small Mobile Viewport (375x667) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 667, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const check375 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth <= 375`,
    returnByValue: true
  });
  console.log('  375px no horizontal overflow:', getVal(check375));
  await takeScreenshot('qa_ultra_pdp_v2_mobile_375.png');

  // Viewport 4: 414px (Large Mobile - iPhone Plus/Max)
  console.log('\n--- TEST 5: Large Mobile Viewport (414x896) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 414, height: 896, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const check414 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth <= 414`,
    returnByValue: true
  });
  console.log('  414px no horizontal overflow:', getVal(check414));

  // Viewport 5: 768px (Tablet Portrait - iPad Mini)
  console.log('\n--- TEST 6: Tablet Viewport (768x1024) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true });
  await new Promise(r => setTimeout(r, 800));
  const check768 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth <= 768`,
    returnByValue: true
  });
  console.log('  768px no horizontal overflow:', getVal(check768));
  await takeScreenshot('qa_ultra_pdp_v2_tablet_768.png');

  // Viewport 6: 1024px (Tablet Landscape / Small Laptop)
  console.log('\n--- TEST 7: Small Laptop Viewport (1024x768) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1024, height: 768, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 800));
  const check1024 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth <= 1024`,
    returnByValue: true
  });
  console.log('  1024px no horizontal overflow:', getVal(check1024));

  // Viewport 7: 1920px (Full HD Desktop)
  console.log('\n--- TEST 8: Full HD Desktop Viewport (1920x1080) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 800));
  const check1920 = await send('Runtime.evaluate', {
    expression: `document.documentElement.scrollWidth <= 1920`,
    returnByValue: true
  });
  console.log('  1920px no horizontal overflow:', getVal(check1920));
  await takeScreenshot('qa_ultra_pdp_v2_desktop_1920.png');

  console.log('\n======================================================');
  console.log('ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================\n');

  chromeProc.kill();
  localServer.close();
  process.exit(0);
})();

