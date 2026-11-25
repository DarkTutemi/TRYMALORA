import fs from 'fs';

const cData = JSON.parse(fs.readFileSync('scripts/8sheep_collections.json', 'utf8'));

const maloraCollections = cData.collections.map(c => {
  let title = c.title
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora');

  let body_html = (c.body_html || '')
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora')
    .replace(/8sheep\.com/gi, 'trymalora.com');

  return {
    original_id: c.id,
    title,
    handle: c.handle,
    body_html,
    image: c.image ? { src: c.image.src, alt: title } : null
  };
});

fs.writeFileSync('scripts/malora_collections_prepared.json', JSON.stringify(maloraCollections, null, 2));
console.log(`Successfully prepared ${maloraCollections.length} Malora Organics collections.`);
console.log(maloraCollections.map(c => c.title + ' (/' + c.handle + ')'));
