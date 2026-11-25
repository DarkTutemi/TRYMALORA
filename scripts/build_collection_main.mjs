import fs from 'fs';

const html = fs.readFileSync('scripts/8sheep_collection.html', 'utf8');

const marker = 'id="shopify-section-template--21386858266816__main"';
const startIdx = html.indexOf(marker);
const openIdx = html.lastIndexOf('<', startIdx);
// Find the next shopify-section AFTER startIdx + marker.length
const nextSectionIdx = html.indexOf('class="shopify-section', startIdx + 100);
const closeIdx = html.lastIndexOf('<', nextSectionIdx);

let sectionHtml = html.slice(openIdx, closeIdx);

// Rebrand
const CDN_PLACEHOLDER = '__8SHEEP_CDN_MEDIA_ASSET__';
sectionHtml = sectionHtml.replace(/(\/\/|https:\/\/)?8sheep\.com\/cdn\//gi, CDN_PLACEHOLDER);

sectionHtml = sectionHtml
  .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
  .replace(/8\s*Sheep/gi, 'Malora')
  .replace(/8sheep\.com/gi, 'trymalora.com')
  .replace(/8sheep/gi, 'malora');

sectionHtml = sectionHtml.replace(new RegExp(CDN_PLACEHOLDER, 'g'), 'https://8sheep.com/cdn/');

const liquid = `{% comment %} MALORA ORGANICS COLLECTION MAIN - 8SHEEP 1:1 CLONE {% endcomment %}\n${sectionHtml}\n{% schema %}{ "name": "Malora Collection Main", "settings": [] }{% endschema %}`;

fs.writeFileSync('sections/malora-collection-main.liquid', liquid);
console.log('Created sections/malora-collection-main.liquid (', liquid.length, 'chars)');
