import fs from 'fs';
import path from 'path';

const html = fs.readFileSync('scripts/ceruline_audit/source.html', 'utf8');
const sectionStarts = [...html.matchAll(/id="shopify-section-([^"]+)"/g)];

fs.mkdirSync('scripts/ceruline_audit/sections', { recursive: true });
for (let i = 0; i < sectionStarts.length; i++) {
  const current = sectionStarts[i];
  const sectionId = current[1];
  const startIndex = html.lastIndexOf('<', current.index);
  const endIndex = i < sectionStarts.length - 1
    ? html.lastIndexOf('<', sectionStarts[i + 1].index)
    : html.indexOf('</body>', startIndex);

  const sectionHtml = html.slice(startIndex, endIndex !== -1 ? endIndex : html.length);
  const safeName = sectionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  fs.writeFileSync(`scripts/ceruline_audit/sections/${safeName}.html`, sectionHtml);
  console.log(`[${i + 1}] Extracted ${safeName} (${sectionHtml.length} chars)`);
}

// Download core CSS/JS assets
const assetUrls = [
  'https://ceruline.com/cdn/shop/t/3/assets/base.css?v=76100772857100484791780687370',
  'https://ceruline.com/cdn/shop/t/3/assets/secondary.js?v=179174615631166878231780687370',
  'https://ceruline.com/cdn/shop/t/3/compiled_assets/scripts.js?v=124875735010847773101780687414',
  'https://ceruline.com/cdn/shop/t/3/assets/media-gallery.js?v=116888628631191181381780687370',
  'https://ceruline.com/cdn/shop/t/3/assets/product-image-zoom.js?v=93322276870980180401780687370'
];

fs.mkdirSync('scripts/ceruline_audit/assets', { recursive: true });
for (const url of assetUrls) {
  const filename = url.split('/').pop().split('?')[0];
  try {
    const res = await fetch(url);
    if (res.ok) {
      const txt = await res.text();
      fs.writeFileSync(`scripts/ceruline_audit/assets/${filename}`, txt);
      console.log(`Downloaded asset: ${filename} (${txt.length} bytes)`);
    }
  } catch (e) {
    console.error(`Failed ${filename}:`, e.message);
  }
}
