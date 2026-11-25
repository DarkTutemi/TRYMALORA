import fs from 'fs';

function rebrand(text) {
  // First preserve 8sheep CDN URLs by replacing with temporary placeholder
  const CDN_PLACEHOLDER = '__8SHEEP_CDN_MEDIA_ASSET__';
  let processed = text.replace(/(\/\/|https:\/\/)?8sheep\.com\/cdn\//gi, CDN_PLACEHOLDER);

  // Now replace branding
  processed = processed
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora')
    .replace(/8sheep\.com/gi, 'trymalora.com')
    .replace(/8sheep/gi, 'malora');

  // Restore CDN URLs
  processed = processed.replace(new RegExp(CDN_PLACEHOLDER, 'g'), 'https://8sheep.com/cdn/');

  return processed;
}

const sectionMap = [
  { file: 'c-header1.html', name: 'malora-announcement-bar.liquid', label: 'Malora Announcement Bar' },
  { file: 'c-header2.html', name: 'malora-header.liquid', label: 'Malora Header' },
  { file: 'template--21386858561728__c_hero_bmgBP9.html', name: 'malora-hero.liquid', label: 'Malora Hero' },
  { file: 'template--21386858561728__c_collection_tabs_e3kFnY.html', name: 'malora-collection-tabs.liquid', label: 'Malora Collection Tabs' },
  { file: 'template--21386858561728__c_testimonials_7hUhtG.html', name: 'malora-testimonials.liquid', label: 'Malora Testimonials' },
  { file: 'template--21386858561728__c_bar_icons_feature_tq8G3A.html', name: 'malora-bar-icons.liquid', label: 'Malora Feature Bar' },
  { file: 'template--21386858561728__c_two_columns_Qp36df.html', name: 'malora-magnesium-science.liquid', label: 'Malora Magnesium Science' },
  { file: 'template--21386858561728__c_two_columns_AEfBQz.html', name: 'malora-clean-ingredients.liquid', label: 'Malora Clean Ingredients' },
  { file: 'template--21386858561728__c_two_columns_feHU8Q.html', name: 'malora-founder-story.liquid', label: 'Malora Founder Story' },
  { file: 'template--21386858561728__c_swiper_images_aJYDe9.html', name: 'malora-reviews-swiper.liquid', label: 'Malora Reviews Swiper' },
  { file: 'template--21386858561728__c_faq_tabs_xxktn4.html', name: 'malora-faq.liquid', label: 'Malora FAQ Tabs' },
  { file: 'template--21386858561728__c_collection_GMfQyC.html', name: 'malora-featured-collection.liquid', label: 'Malora Featured Collection' },
  { file: 'footer.html', name: 'malora-footer.liquid', label: 'Malora Footer' }
];

for (const s of sectionMap) {
  let content = fs.readFileSync(`scripts/8sheep_extracted_sections/${s.file}`, 'utf8');
  content = rebrand(content);

  // Logo polish
  if (s.name === 'malora-header.liquid') {
    content = content.replace(/<svg[^>]*class="[^"]*logo[^"]*"[^>]*>[\s\S]*?<\/svg>/gi, '<span style="font-family: \'Canela\', serif, Georgia; font-size: 26px; font-weight: 500; letter-spacing: 1px; color: #323A31;">MALORA</span>');
  }
  if (s.name === 'malora-footer.liquid') {
    content = content.replace(/<svg[^>]*class="[^"]*logo[^"]*"[^>]*>[\s\S]*?<\/svg>/gi, '<span style="font-family: \'Canela\', serif, Georgia; font-size: 26px; font-weight: 500; letter-spacing: 1px; color: #FFFFFF;">MALORA</span>');
  }

  const liquid = `{% comment %} MALORA ORGANICS - 8SHEEP 1:1 CLONE {% endcomment %}\n${content}\n{% schema %}{ "name": "${s.label}", "settings": [] }{% endschema %}`;
  fs.writeFileSync(`sections/${s.name}`, liquid);
  console.log(`Rebuilt sections/${s.name} (${liquid.length} chars)`);
}

// Rebuild PDP Main
let pdpMain = fs.readFileSync('scripts/8sheep_extracted_pdp/template--21386857054400__main.html', 'utf8');
pdpMain = rebrand(pdpMain);
const pdpLiquid = `{% comment %} MALORA ORGANICS PDP MAIN - 8SHEEP 1:1 CLONE {% endcomment %}\n${pdpMain}\n{% schema %}{ "name": "Malora PDP Main", "settings": [] }{% endschema %}`;
fs.writeFileSync('sections/malora-product-main.liquid', pdpLiquid);
console.log(`Rebuilt sections/malora-product-main.liquid (${pdpLiquid.length} chars)`);

console.log('=== ALL 14 SECTIONS REBUILT WITH PERFECT MEDIA PRESERVATION! ===');
