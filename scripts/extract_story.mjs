import fs from 'fs';

const html = fs.readFileSync('scripts/target_gnome.html', 'utf8');

const startIdx = html.indexOf('shopify-section-template--22832191996094__custom_liquid_Fe8yyJ');
if (startIdx !== -1) {
  const endIdx = html.indexOf('shopify-section-promo-popup', startIdx);
  const content = html.substring(startIdx, endIdx !== -1 ? endIdx : startIdx + 50000);
  fs.writeFileSync('scripts/custom_liquid_story.html', content);
  console.log('Story section length:', content.length);
} else {
  console.log('Not found');
}

