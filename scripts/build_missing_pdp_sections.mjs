import fs from 'fs';

function rebrand(text) {
  const CDN_PLACEHOLDER = '__8SHEEP_CDN_MEDIA_ASSET__';
  let processed = text.replace(/(\/\/|https:\/\/)?8sheep\.com\/cdn\//gi, CDN_PLACEHOLDER);

  processed = processed
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora')
    .replace(/8sheep\.com/gi, 'trymalora.com')
    .replace(/8sheep/gi, 'malora');

  processed = processed.replace(new RegExp(CDN_PLACEHOLDER, 'g'), 'https://8sheep.com/cdn/');
  return processed;
}

const map = [
  { src: 'template--21386857054400__badge-products.html', dest: 'sections/malora-badge-products.liquid', name: 'Malora Badge Products' },
  { src: 'template--21386857054400__product-recommendations.html', dest: 'sections/malora-product-recommendations.liquid', name: 'Malora Recommendations' },
  { src: 'template--21386857054400__shogun-below.html', dest: 'sections/malora-shogun-below.liquid', name: 'Malora Shogun Below' }
];

for (const item of map) {
  let content = fs.readFileSync(`scripts/8sheep_extracted_pdp/${item.src}`, 'utf8');
  content = rebrand(content);
  const liquid = `{% comment %} MALORA ORGANICS - 8SHEEP 1:1 CLONE {% endcomment %}\n${content}\n{% schema %}{ "name": "${item.name}", "settings": [] }{% endschema %}`;
  fs.writeFileSync(item.dest, liquid);
  console.log(`Created ${item.dest} (${liquid.length} chars)`);
}

const productJson = {
  sections: {
    main: { type: "malora-product-main", settings: {} },
    bar_icons: { type: "malora-bar-icons", settings: {} },
    magnesium_science: { type: "malora-magnesium-science", settings: {} },
    clean_ingredients: { type: "malora-clean-ingredients", settings: {} },
    badge_products: { type: "malora-badge-products", settings: {} },
    reviews_widget: { type: "malora-reviews-widget", settings: {} },
    testimonials: { type: "malora-testimonials", settings: {} },
    reviews_swiper: { type: "malora-reviews-swiper", settings: {} },
    faq: { type: "malora-faq", settings: {} },
    product_recommendations: { type: "malora-product-recommendations", settings: {} },
    shogun_below: { type: "malora-shogun-below", settings: {} }
  },
  order: [
    "main",
    "bar_icons",
    "magnesium_science",
    "clean_ingredients",
    "badge_products",
    "reviews_widget",
    "testimonials",
    "reviews_swiper",
    "faq",
    "product_recommendations",
    "shogun_below"
  ]
};

fs.writeFileSync('templates/product.json', JSON.stringify(productJson, null, 2));
console.log('Updated templates/product.json with all 11 sections!');
