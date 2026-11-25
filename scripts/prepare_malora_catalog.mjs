import fs from 'fs';

const pData = JSON.parse(fs.readFileSync('scripts/8sheep_products.json', 'utf8'));

const maloraProducts = pData.products.map(p => {
  let title = p.title;
  let body_html = p.body_html || '';

  // Clean branding
  body_html = body_html
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora')
    .replace(/8sheep\.com/gi, 'trymalora.com');

  title = title
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora');

  const tags = Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',').map(t => t.trim()) : []);

  return {
    original_id: p.id,
    title,
    handle: p.handle,
    product_type: p.product_type || 'Skincare',
    tags,
    body_html,
    options: p.options.map(o => ({
      name: o.name,
      values: o.values
    })),
    variants: p.variants.map(v => ({
      title: v.title,
      price: v.price,
      compare_at_price: v.compare_at_price,
      sku: v.sku || `MALORA-${p.handle.toUpperCase()}-${v.id}`,
      options: [v.option1, v.option2, v.option3].filter(Boolean),
      requires_shipping: true
    })),
    images: p.images.map(img => ({
      src: img.src,
      alt: img.alt ? img.alt.replace(/8\s*Sheep/gi, 'Malora') : title
    }))
  };
});

fs.writeFileSync('scripts/malora_catalog_prepared.json', JSON.stringify(maloraProducts, null, 2));
console.log(`Successfully prepared ${maloraProducts.length} Malora Organics products.`);
console.log('Sample product:', JSON.stringify(maloraProducts[maloraProducts.length - 1], null, 2).slice(0, 800));
