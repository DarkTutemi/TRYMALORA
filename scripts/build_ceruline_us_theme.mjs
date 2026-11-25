import fs from 'fs';
import path from 'path';

// 1. Copy Shrine PRO assets to assets/ceruline-us-*
const assetMap = {
  'base.css': 'ceruline-us-base.css',
  'secondary.js': 'ceruline-us-secondary.js',
  'scripts.js': 'ceruline-us-scripts.js',
  'media-gallery.js': 'ceruline-us-media-gallery.js',
  'product-image-zoom.js': 'ceruline-us-product-image-zoom.js'
};

for (const [src, dest] of Object.entries(assetMap)) {
  const srcPath = `scripts/ceruline_audit/assets/${src}`;
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, `assets/${dest}`);
    console.log(`Copied assets/${dest}`);
  }
}

// Helper to localize AU -> US and preserve ceruline CDN media
function localizeUS(html) {
  const CDN_PH = '__CERULINE_CDN__';
  let out = html.replace(/(\/\/|https:\/\/)?ceruline\.com\/cdn\//gi, CDN_PH);
  out = out
    .replace(/ceruline\.com/gi, 'trymalora.com')
    .replace(/Australia/gi, 'United States')
    .replace(/\bAU\b/g, 'US')
    .replace(/AUD/g, 'USD');
  out = out.replace(new RegExp(CDN_PH, 'g'), 'https://ceruline.com/cdn/');
  return out;
}

// 2. Map extracted sections to ceruline-us-*.liquid
const sectionMap = [
  { src: 'sections--27105918353693__fe1c8c67-b84c-4466-a515-70df3134c1c0.html', dest: 'ceruline-us-announcement.liquid', name: 'Ceruline US Announcement' },
  { src: 'sections--27105918353693__header.html', dest: 'ceruline-us-header.liquid', name: 'Ceruline US Header' },
  { src: 'cart-drawer.html', dest: 'ceruline-us-cart-drawer.liquid', name: 'Ceruline US Cart Drawer' },
  { src: 'template--27105918157085__main.html', dest: 'ceruline-us-product-main.liquid', name: 'Ceruline US Product Main' },
  { src: 'template--27105918157085__horizontal_ticker_GTFhNx.html', dest: 'ceruline-us-marquee.liquid', name: 'Ceruline US Marquee' },
  { src: 'template--27105918157085__image_with_text_EnFyKj.html', dest: 'ceruline-us-benefits-1.liquid', name: 'Ceruline US Benefits 1' },
  { src: 'template--27105918157085__image_with_text_k78CTm.html', dest: 'ceruline-us-benefits-2.liquid', name: 'Ceruline US Benefits 2' },
  { src: 'template--27105918157085__image_with_text_McaPqA.html', dest: 'ceruline-us-benefits-3.liquid', name: 'Ceruline US Benefits 3' },
  { src: 'template--27105918157085__image_with_text_nVhb8V.html', dest: 'ceruline-us-benefits-4.liquid', name: 'Ceruline US Benefits 4' },
  { src: 'template--27105918157085__fitment_check_DPeKwW.html', dest: 'ceruline-us-compatibility.liquid', name: 'Ceruline US Compatibility' },
  { src: 'template--27105918157085__comparison_table_tEdi86.html', dest: 'ceruline-us-comparison.liquid', name: 'Ceruline US Comparison' },
  { src: 'template--27105918157085__results_Nmkrp4.html', dest: 'ceruline-us-results.liquid', name: 'Ceruline US Results' },
  { src: 'template--27105918157085__collapsible_content_7wcPt8.html', dest: 'ceruline-us-faq.liquid', name: 'Ceruline US FAQ' },
  { src: 'template--27105918157085__1771600727bac8b4ec.html', dest: 'ceruline-us-reviews.liquid', name: 'Ceruline US Reviews' },
  { src: 'sections--27105918320925__footer.html', dest: 'ceruline-us-footer.liquid', name: 'Ceruline US Footer' }
];

for (const s of sectionMap) {
  let content = fs.readFileSync(`scripts/ceruline_audit/sections/${s.src}`, 'utf8');
  content = localizeUS(content);
  const liquid = `{% comment %} CERULINE US — 1:1 CLONE (${s.name}) {% endcomment %}\n${content}\n{% schema %}\n{\n  "name": "${s.name}",\n  "settings": [\n    {\n      "type": "checkbox",\n      "id": "enable_section",\n      "label": "Enable section",\n      "default": true\n    }\n  ]\n}\n{% endschema %}`;
  fs.writeFileSync(`sections/${s.dest}`, liquid);
  console.log(`Built sections/${s.dest} (${liquid.length} chars)`);
}

// 3. Build templates/product.ceruline-us.json
const productTemplate = {
  sections: {
    main: { type: 'ceruline-us-product-main', settings: {} },
    marquee: { type: 'ceruline-us-marquee', settings: {} },
    benefits_1: { type: 'ceruline-us-benefits-1', settings: {} },
    benefits_2: { type: 'ceruline-us-benefits-2', settings: {} },
    benefits_3: { type: 'ceruline-us-benefits-3', settings: {} },
    benefits_4: { type: 'ceruline-us-benefits-4', settings: {} },
    compatibility: { type: 'ceruline-us-compatibility', settings: {} },
    comparison: { type: 'ceruline-us-comparison', settings: {} },
    results: { type: 'ceruline-us-results', settings: {} },
    faq: { type: 'ceruline-us-faq', settings: {} },
    reviews: { type: 'ceruline-us-reviews', settings: {} }
  },
  order: [
    'main',
    'marquee',
    'benefits_1',
    'benefits_2',
    'benefits_3',
    'benefits_4',
    'compatibility',
    'comparison',
    'results',
    'faq',
    'reviews'
  ]
};

fs.writeFileSync('templates/product.ceruline-us.json', JSON.stringify(productTemplate, null, 2));
console.log('Built templates/product.ceruline-us.json');
