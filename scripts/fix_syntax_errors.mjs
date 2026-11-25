import fs from 'fs';

// 1. Fix malora-featured-collection.liquid schema name
let colContent = fs.readFileSync('sections/malora-featured-collection.liquid', 'utf8');
colContent = colContent.replace('"Malora Featured Collection"', '"Malora Collection"');
fs.writeFileSync('sections/malora-featured-collection.liquid', colContent);
console.log('Fixed malora-featured-collection.liquid');

// 2. Fix malora-footer.liquid
let footerContent = fs.readFileSync('sections/malora-footer.liquid', 'utf8');
// Find any {{ ... }} that look like JS function calls
footerContent = footerContent.replace(/\{\{\s*([a-zA-Z0-9_.]+\([^)]*\))\s*\}\}/g, '{% raw %}{{$1}}{% endraw %}');
// Also check for any other Vue/Alpine bindings like {{ something }} that might fail Liquid
footerContent = footerContent.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, p1) => {
  // If it's not a common Liquid variable, wrap in raw
  const commonLiquid = ['content_for_header', 'content_for_layout', 'shop', 'page', 'product'];
  if (commonLiquid.includes(p1)) return match;
  return `{% raw %}{{ ${p1} }}{% endraw %}`;
});
fs.writeFileSync('sections/malora-footer.liquid', footerContent);
console.log('Fixed malora-footer.liquid');
