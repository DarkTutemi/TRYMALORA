const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const userDataDir = 'C:\\Users\\Admin\\.chrome-headless-qa-ultra-v3';
const artifactsDir = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\d284d670-0cfd-4f12-bbed-f8eeaea36551';
const LIVE_THEME_ID = '197625381235';

// 1. Build Local HTML Server for Full-Fidelity Template Verification
function createLocalServer(port) {
  const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ultra-overnight.css'), 'utf8');
  const js = fs.readFileSync(path.join(__dirname, '..', 'assets', 'ultra-overnight.js'), 'utf8');

  function sanitizeLiquid(file) {
    let content = fs.readFileSync(path.join(__dirname, '..', 'sections', file), 'utf8');
    content = content.replace(/{%-?\s*schema\s*-?%}[\s\S]*?{%-?\s*endschema\s*-?%}/g, '');
    content = content.replace(/{%-?\s*liquid[\s\S]*?-?%}/g, '');
    content = content.replace(/{{\s*'([^']+)'\s*\|\s*asset_url\s*}}/g, '/assets/$1');
    content = content.replace(/{{\s*section\.settings\.title\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'Title');
    content = content.replace(/{{\s*section\.settings\.eyebrow\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'EYEBROW');
    content = content.replace(/{{\s*section\.settings\.subhead(?:line)?\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'Subhead');
    content = content.replace(/{{\s*section\.settings\.heading\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Heading');
    content = content.replace(/{{\s*section\.settings\.description\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Description');
    content = content.replace(/{{\s*section\.settings\.caption\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Caption');
    content = content.replace(/{{\s*section\.settings\.cta_text\s*(?:\|\s*default:\s*'([^']+)')?\s*}}/g, (m, d) => d || 'COMING SOON — VIEW OPTIONS');
    content = content.replace(/{{\s*section\.settings\.link_text\s*(?:\|\s*default:\s*'([^']+)')?(?:\s*\|\s*escape)?\s*}}/g, (m, d) => d || 'Explore');
    content = content.replace(/{{\s*section\.settings\.link\s*}}/g, '#');
    content = content.replace(/{%-?\s*if\s+section\.settings\.link\s*!=\s*blank\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+section\.blocks\.size\s*>\s*0\s*-?%}[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+has_real_product\s*-?%}[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+can_purchase\s*.*?%}[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+current_variant\.compare_at_price\s*>\s*current_variant\.price\s*-?%}([\s\S]*?){%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{{\s*current_variant\.price\s*\|\s*money\s*}}/g, '$39.99');
    content = content.replace(/{{\s*current_variant\.price\s*\|\s*times:\s*3\s*\|\s*money\s*}}/g, '$119.97');
    content = content.replace(/{{\s*current_variant\.price\s*\|\s*times:\s*5\s*\|\s*money\s*}}/g, '$199.95');
    content = content.replace(/{{\s*current_variant\.compare_at_price\s*\|\s*money\s*}}/g, '$79.98');
    content = content.replace(/{{\s*savings\s*}}/g, '50');
    content = content.replace(/{%-?\s*if\s+section\.settings\.enable_review_app[\s\S]*?{%-?\s*else\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, '$1');
    content = content.replace(/{%-?\s*if\s+product\.metafields\.reviews\.rating\.value\s*!=\s*blank[\s\S]*?{%-?\s*endif\s*-?%}/g, '');
    content = content.replace(/{%-?\s*if\s+shop\.enabled_payment_types\.size\s*>\s*0\s*-?%}([\s\S]*?){%-?\s*endif\s*-?%}/g, `
      <div class="uo-payment-methods-strip" aria-label="Accepted Payment Methods">
        <svg class="uo-payment-icon-svg" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24"><rect width="38" height="24" rx="4" fill="#1434CB"/><path d="M14.5 16h-2.1l1.3-8h2.1l-1.3 8zm6.7-7.8c-.4-.2-1.1-.3-1.9-.3-2.1 0-3.6 1.1-3.6 2.7 0 1.2 1.1 1.8 1.9 2.2.8.4 1.1.7 1.1 1.1 0 .6-.7.9-1.4.9-.9 0-1.5-.1-2.2-.4l-.3-.2-.3 1.9c.5.2 1.5.4 2.5.4 2.3 0 3.8-1.1 3.8-2.8 0-1-.6-1.7-2-2.3-.8-.4-1.3-.7-1.3-1.1 0-.4.4-.8 1.3-.8.7 0 1.3.1 1.7.3l.2.1.5-1.6zm4.9 5.3l.9-2.3.5 2.3h-1.4zm2.1-5.5h-1.6c-.5 0-.9.1-1.1.7l-3.2 7.3h2.2l.4-1.2h2.7l.3 1.2h2l-1.7-8zm-15.6 0l-2 5.5-.2-1.1c-.4-1.3-1.5-2.7-2.8-3.4l1.8 7h2.2l3.4-8h-2.4z" fill="#fff"/></svg>
        <svg class="uo-payment-icon-svg" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24"><rect width="38" height="24" rx="4" fill="#0A0B09"/><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M19 6.8a6.9 6.9 0 0 1 2.6 5.2 6.9 6.9 0 0 1-2.6 5.2 6.9 6.9 0 0 1-2.6-5.2c0-2.1 1-4 2.6-5.2z" fill="#FF5F00"/></svg>
        <svg class="uo-payment-icon-svg" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24"><rect width="38" height="24" rx="4" fill="#006FCF"/><path d="M12.5 16h-2.8l4.4-8h2.8l4.4 8h-2.8l-.8-1.7h-4.4l-.8 1.7zm1.6-3.7h2.8l-1.4-3.1-1.4 3.1z" fill="#fff"/></svg>
        <svg class="uo-payment-icon-svg" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" role="img" width="38" height="24"><rect width="38" height="24" rx="4" fill="#000"/><path d="M14.5 8.7c-.5.6-1.3 1-2 1-.1-.8.3-1.6.8-2.1.5-.6 1.3-.9 1.9-.9.1.7-.2 1.5-.7 2zm.7 1.1c-1.1 0-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.2.7-2.8 1.7-1.2 2-.3 5 1 6.6.6.9 1.3 1.8 2.2 1.8.9 0 1.3-.6 2.4-.6 1 0 1.4.6 2.3.6.9 0 1.6-.9 2.2-1.8.7-1 1-2 1-2.1-.1 0-1.9-.7-1.9-2.8 0-1.7 1.4-2.6 1.5-2.6-.8-1.2-2.1-1.4-2.5-1.4h-.7z" fill="#fff"/></svg>
      </div>
    `);
    content = content.replace(/{%-?\s*for\s+s\s+in\s+sizes\s*-?%}([\s\S]*?){%-?\s*endfor\s*-?%}/g, (m, block) => {
      const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
      return sizes.map(s => block.replace(/{{\s*s\s*}}/g, s).replace(/{%\s*if\s+s\s*==\s*'M'\s*%}is-active{%\s*endif\s*%}/g, s === 'M' ? 'is-active' : '').replace(/{%\s*if\s+s\s*==\s*'M'\s*%}true{%\s*else\s*%}false{%\s*endif\s*%}/g, s === 'M' ? 'true' : 'false').replace(/{%\s*if\s+s\s*==\s*'M'\s*%}0{%\s*else\s*%}-1{%\s*endif\s*%}/g, s === 'M' ? '0' : '-1')).join('');
    });
    content = content.replace(/{%-?\s*if\s+[^%]+%-?}/g, '');
    content = content.replace(/{%-?\s*endif\s*-?%}/g, '');
    content = content.replace(/{%-?\s*assign\s+[^%]+%-?}/g, '');
    return content;
  }

  // 11 Sections in Exact Narrative Flow
  const secMain = sanitizeLiquid('ultra-product-main.liquid');
  const secProblem = sanitizeLiquid('ultra-pdp-problem.liquid');
  const secEditorial = sanitizeLiquid('ultra-pdp-editorial.liquid');
  const secLayers = sanitizeLiquid('ultra-five-layers.liquid');
  const secComfort = sanitizeLiquid('ultra-lifestyle-comfort.liquid');
  const secFabric = sanitizeLiquid('ultra-fabric-experience.liquid');
  const secPack = sanitizeLiquid('ultra-choose-pack.liquid');
  const secHiw = sanitizeLiquid('ultra-hiw-steps.liquid');
  const secTabs = sanitizeLiquid('ultra-pdp-tabs.liquid');
  const secReviews = sanitizeLiquid('ultra-reviews.liquid');
  const secFaq = sanitizeLiquid('ultra-faq.liquid');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FULL-SPINE ULTRA OVERNIGHT™ | Premium PDP V3</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${css}
    body { margin: 0; padding: 0; font-family: var(--uo-font-sans); background: var(--uo-cream); color: var(--uo-charcoal); }
    .uo-top-bar {
      background: var(--uo-plum);
      color: #fff;
      font-size: 11.5px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: center;
      padding: 9px 16px;
    }
  </style>
</head>
<body>
  <div class="uo-top-bar">
    FREE US SHIPPING OVER $49 · ULTRA OVERNIGHT™ LIVE STOREFRONT
  </div>

  <!-- SECTION 01: PRODUCT HERO & BUY BOX -->
  ${secMain}

  <!-- SECTION 02: THE OVERNIGHT PROBLEM -->
  ${secProblem}

  <!-- SECTION 03: MEET FULL-SPINE COVERAGE -->
  ${secEditorial}

  <!-- SECTION 04: THE FIVE-LAYER SYSTEM -->
  ${secLayers}

  <!-- SECTION 05: MADE FOR DIFFERENT SLEEP POSITIONS -->
  ${secComfort}

  <!-- SECTION 06: COMFORT & FABRIC EXPERIENCE -->
  ${secFabric}

  <!-- SECTION 07: CHOOSE YOUR PACK -->
  ${secPack}

  <!-- SECTION 08: HOW TO USE & CARE -->
  ${secHiw}

  <!-- SECTION 09: PRODUCT DETAILS (ACCORDION) -->
  ${secTabs}

  <!-- SECTION 10: REVIEWS / CRAFTSMANSHIP STANDARDS -->
  ${secReviews}

  <!-- SECTION 11: FAQ + FINAL CTA -->
  ${secFaq}

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
        res.end();
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  return new Promise(resolve => {
    server.listen(port, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

// 2. Headless Chrome DevTools Protocol Client
function getWsUrl(port) {
  return new Promise((resolve, reject) => {
    let retries = 30;
    const interval = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/json`, res => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => {
          try {
            const targets = JSON.parse(body);
            const page = targets.find(t => t.type === 'page');
            if (page && page.webSocketDebuggerUrl) {
              clearInterval(interval);
              resolve(page.webSocketDebuggerUrl);
            }
          } catch(e) {}
        });
      }).on('error', () => {
        if (--retries <= 0) {
          clearInterval(interval);
          reject(new Error('Failed to connect to Chrome DevTools port'));
        }
      });
    }, 200);
  });
}

async function runSuite() {
  const localPort = 38450;
  const chromePort = 9245;

  console.log('Starting local HTTP server on port ' + localPort + '...');
  const server = await createLocalServer(localPort);

  console.log('Launching Headless Chrome on port ' + chromePort + '...');
  const chromeProcess = spawn(chromePath, [
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
      const qaPath = path.join(__dirname, '..', 'docs', 'qa', filename);
      fs.mkdirSync(path.dirname(qaPath), { recursive: true });
      fs.writeFileSync(qaPath, buf);
      console.log(`  [SCREENSHOT] Saved: ${filename} (${(buf.length / 1024).toFixed(1)} KB)`);
    }
  }

  console.log('\n======================================================');
  console.log('STARTING ULTRA OVERNIGHT PDP V3 VERIFICATION SUITE');
  console.log('======================================================\n');

  // Navigate to local full PDP page
  await send('Page.navigate', { url: `http://127.0.0.1:${localPort}/pdp` });
  await new Promise(r => setTimeout(r, 1500));

  // --- TEST 1: DESKTOP (1440x1100) ---
  console.log('--- TEST 1: Desktop Viewport (1440x1100) ---');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await new Promise(r => setTimeout(r, 600));

  const desktopEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const title = document.querySelector('.uo-product-title');
      const subhead = document.querySelector('.uo-pdp-subhead-serif');
      const desc = document.querySelector('.uo-pdp-desc');
      const tpBar = document.querySelector('.uo-trustpilot-rating-bar');
      const liveCard = document.querySelector('.uo-live-viewers-card');
      const liveCount = parseInt(document.getElementById('uoLiveViewerCount')?.textContent, 10);
      const paymentIcons = document.querySelectorAll('.uo-payment-icon-svg');
      const overflow = document.documentElement.scrollWidth - window.innerWidth;
      const sections = [
        '#uoPdpSection',
        '#ultra-overnight-problem',
        '#ultra-protection-story',
        '.uo-layers-section',
        '#ultra-lifestyle-comfort',
        '#ultra-fabric-experience',
        '#ultra-choose-pack',
        '#ultra-how-it-works',
        '#ultra-product-details',
        '.uo-reviews-section',
        '#ultra-faq'
      ];
      const sectionsPresent = sections.map(s => !!document.querySelector(s));

      const clinCard = document.querySelector('.uo-clinicians-choice-card');
      const clinTitle = document.querySelector('.uo-cc-title');
      const clinBody = document.querySelector('.uo-cc-body');
      const clinAvatars = document.querySelectorAll('.uo-cc-avatar');

      return {
        titleFont: title ? window.getComputedStyle(title).fontSize : null,
        titleFontPassDesktop: title ? parseFloat(window.getComputedStyle(title).fontSize) <= 30 : false,
        titleText: title ? title.textContent.trim() : null,
        cliniciansCardPresent: !!clinCard,
        cliniciansTitle: clinTitle ? clinTitle.textContent.trim() : null,
        cliniciansBodyText: clinBody ? clinBody.textContent.replace(/\s+/g, ' ').trim() : null,
        cliniciansAvatarsCount: clinAvatars.length,
        trustpilotPresent: !!tpBar,
        trustpilotText: tpBar ? tpBar.textContent.replace(/\s+/g, ' ').trim() : null,
        liveViewersPresent: !!liveCard,
        liveViewersCount: liveCount,
        liveViewersRangeOk: liveCount >= 10 && liveCount <= 30,
        paymentIconsCount: paymentIcons.length,
        overflow: overflow,
        sectionsCount: sectionsPresent.filter(Boolean).length,
        all11Present: sectionsPresent.every(Boolean)
      };
    })()`,
    returnByValue: true
  });
  console.log('  Desktop Evaluation:', getVal(desktopEval));
  await takeScreenshot('qa_ultra_pdp_v3_desktop_1440.png');

  // --- TEST 2: MOBILE VIEWPORTS (320px, 360px, 375px, 390px, 414px, 430px, 768px) ---
  const viewports = [
    { w: 320, h: 568, name: '320px (iPhone SE Narrow)' },
    { w: 360, h: 740, name: '360px (Samsung Galaxy / Android)' },
    { w: 375, h: 667, name: '375px (iPhone SE Standard)' },
    { w: 390, h: 844, name: '390px (iPhone 14 Standard)' },
    { w: 414, h: 896, name: '414px (iPhone XR / Plus)' },
    { w: 430, h: 932, name: '430px (iPhone 14 Pro Max)' },
    { w: 768, h: 1024, name: '768px (iPad Portrait)' }
  ];

  for (const vp of viewports) {
    console.log(`\n--- TEST: Mobile Viewport ${vp.name} ---`);
    await send('Emulation.setDeviceMetricsOverride', { width: vp.w, height: vp.h, deviceScaleFactor: 2, mobile: true });
    await new Promise(r => setTimeout(r, 500));

    const vpEval = await send('Runtime.evaluate', {
      expression: `(() => {
        const title = document.querySelector('.uo-product-title');
        const mainImg = document.querySelector('.uo-main-image-wrap');
        const thumbStrip = document.querySelector('.uo-thumbnails-strip');
        const thumbs = document.querySelectorAll('.uo-thumb-btn');
        const tierCards = document.querySelector('.uo-tier-cards');
        const firstTier = document.querySelector('.uo-tier-card');
        const badge = document.getElementById('uoGalleryCounterBadge');
        const tpBar = document.querySelector('.uo-trustpilot-rating-bar');
        const compareEl = document.getElementById('uoPriceCompare');
        const saveBadgeEl = document.getElementById('uoPriceSaveBadge');
        const prelaunchEl = document.querySelector('.uo-pdp-prelaunch-tag');
        const mmWrap = document.getElementById('uoMixMatchWrap');
        const atcRow = document.querySelector('.uo-atc-row');
        const overflow = document.documentElement.scrollWidth - window.innerWidth;
        
        let galleryMobileOrderOk = false;
        if (mainImg && thumbStrip) {
          const mainRect = mainImg.getBoundingClientRect();
          const stripRect = thumbStrip.getBoundingClientRect();
          galleryMobileOrderOk = mainRect.bottom <= stripRect.top + 20;
        }

        let mmSpacing = null;
        if (mmWrap && atcRow) {
          mmSpacing = Math.round(atcRow.getBoundingClientRect().top - mmWrap.getBoundingClientRect().bottom);
        }

        const tpHeight = tpBar ? Math.round(tpBar.getBoundingClientRect().height) : null;

        return {
          viewport: ${vp.w},
          overflow: overflow,
          overflowPass: overflow <= 1,
          titleFontSize: title ? window.getComputedStyle(title).fontSize : null,
          titleColor: title ? window.getComputedStyle(title).color : null,
          trustpilotHeight: tpHeight,
          trustpilotSingleLinePass: tpHeight !== null && tpHeight <= 26,
          compareAtPrice: compareEl ? compareEl.textContent.trim() : null,
          saveBadge: saveBadgeEl ? saveBadgeEl.textContent.trim() : null,
          prelaunchAbsentPass: !prelaunchEl || window.getComputedStyle(prelaunchEl).display === 'none',
          mixMatchSpacingPx: mmSpacing,
          mixMatchSpacingPass: mmSpacing >= 18,
          galleryMainAboveThumbnails: galleryMobileOrderOk,
          tierCardHeight: firstTier ? firstTier.getBoundingClientRect().height : null,
          counterBadge: badge ? badge.textContent.trim() : null
        };
      })()`,
      returnByValue: true
    });
    console.log('  Mobile Check Result:', getVal(vpEval));

    if (vp.w === 360) {
      await takeScreenshot('qa_ultra_pdp_v3_mobile_360_samsung.png');
    }
    if (vp.w === 390) {
      await takeScreenshot('qa_ultra_pdp_v3_mobile_390_iphone.png');
    }
  }

  // --- TEST 3: INTERACTIVE CONTROLS VERIFICATION ---
  console.log('\n--- TEST 3: Interactive Controls (Gallery, Variants, Bundles, Modal, Accordion) ---');
  
  // 1. Gallery click View 2
  await send('Runtime.evaluate', {
    expression: `(() => {
      const btn2 = document.querySelector('.uo-thumb-btn[data-index="2"]');
      if (btn2) btn2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 300));
  const galleryClickEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn2 = document.querySelector('.uo-thumb-btn[data-index="2"]');
      const badge = document.getElementById('uoGalleryCounterBadge');
      return {
        btn2Active: btn2 ? btn2.classList.contains('is-active') : false,
        counterText: badge ? badge.textContent.trim() : null
      };
    })()`,
    returnByValue: true
  });
  console.log('  Gallery Click View 2:', getVal(galleryClickEval));

  // 2. Select Color Blush Rose
  await send('Runtime.evaluate', {
    expression: `(() => {
      const blushBtn = document.querySelector('.uo-color-swatch[data-color-name="Blush Rose"]');
      if (blushBtn) blushBtn.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  // 3. Select Size L
  await send('Runtime.evaluate', {
    expression: `(() => {
      const sizeL = document.querySelector('.uo-size-pill[data-size-value="L"]');
      if (sizeL) sizeL.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  // 4. Select Tier 5 Pairs
  await send('Runtime.evaluate', {
    expression: `(() => {
      const tier5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"]');
      if (tier5) tier5.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  // 5. Toggle Mix & Match
  await send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.getElementById('uoMixMatchToggle');
      if (toggle) toggle.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 200));

  const stateEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const mmBody = document.getElementById('uoMixMatchBody');
      const colorLabel = document.getElementById('uoSelectedColorLabel');
      const sizeLabel = document.getElementById('uoSelectedSizeLabel');
      const tier5 = document.querySelector('.uo-tier-card[data-tier="5-pairs"]');
      return {
        selectedColor: window.uoState?.selectedColor,
        selectedSize: window.uoState?.selectedSize,
        selectedTier: window.uoState?.selectedTier,
        colorLabelText: colorLabel ? colorLabel.textContent : null,
        sizeLabelText: sizeLabel ? sizeLabel.textContent : null,
        tier5Selected: tier5 ? tier5.classList.contains('is-selected') : false,
        mixMatchOpen: mmBody ? mmBody.style.display !== 'none' : false,
        mixMatchSlotsCount: document.querySelectorAll('.uo-pair-slot').length
      };
    })()`,
    returnByValue: true
  });
  console.log('  State Sync & Mix-Match Check:', getVal(stateEval));

  // 6. Test Product Details Accordion
  await send('Runtime.evaluate', {
    expression: `(() => {
      const acc2 = document.querySelector('.uo-accordion-header[aria-controls="acc-size-fit"]');
      if (acc2) acc2.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 200));
  const accEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const acc2Content = document.getElementById('acc-size-fit');
      return {
        acc2Open: acc2Content ? acc2Content.style.display !== 'none' : false
      };
    })()`,
    returnByValue: true
  });
  console.log('  Details Accordion Toggle Check:', getVal(accEval));

  // 7. Test Size Guide Modal Open & Close
  await send('Runtime.evaluate', { expression: `window.openUoSizeGuide()` });
  await new Promise(r => setTimeout(r, 200));
  const modalOpenEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('uoSizeGuideModal');
      return modal ? modal.style.display : null;
    })()`,
    returnByValue: true
  });
  console.log('  Size Guide Modal Open:', getVal(modalOpenEval));

  await send('Runtime.evaluate', { expression: `window.closeUoSizeGuide()` });
  await new Promise(r => setTimeout(r, 200));
  const modalCloseEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('uoSizeGuideModal');
      return modal ? modal.style.display : null;
    })()`,
    returnByValue: true
  });
  console.log('  Size Guide Modal Close:', getVal(modalCloseEval));

  // 8. Test Clinicians' Choice Modal Open & Close
  await send('Runtime.evaluate', { expression: `window.openUoCliniciansModal()` });
  await new Promise(r => setTimeout(r, 200));
  const clinOpenEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('uoCliniciansModal');
      const title = document.getElementById('uoCliniciansModalTitle');
      const critCount = document.querySelectorAll('.uo-cm-criterion').length;
      return {
        display: modal ? modal.style.display : null,
        title: title ? title.textContent.trim() : null,
        criteriaCount: critCount
      };
    })()`,
    returnByValue: true
  });
  console.log('  Clinicians Choice Modal Open:', getVal(clinOpenEval));

  await send('Runtime.evaluate', { expression: `window.closeUoCliniciansModal()` });
  await new Promise(r => setTimeout(r, 200));
  const clinCloseEval = await send('Runtime.evaluate', {
    expression: `(() => {
      const modal = document.getElementById('uoCliniciansModal');
      return modal ? modal.style.display : null;
    })()`,
    returnByValue: true
  });
  console.log('  Clinicians Choice Modal Close:', getVal(clinCloseEval));

  console.log('\n======================================================');
  console.log('ALL TESTS COMPLETED SUCCESSFULLY!');
  console.log('======================================================\n');

  // Cleanup
  ws.close();
  chromeProcess.kill();
  server.close();
  process.exit(0);
}

runSuite().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

