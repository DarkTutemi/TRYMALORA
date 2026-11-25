import fs from 'fs';

// Lock outbound links in ceruline-us-header.liquid and ceruline-us-footer.liquid
for (const file of ['sections/ceruline-us-header.liquid', 'sections/ceruline-us-footer.liquid']) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace href="/" or href="/collections/..." or href="/products/..." with href="#top"
  content = content
    .replace(/href="\/"/gi, 'href="#top"')
    .replace(/href="\/collections[^"]*"/gi, 'href="#top"')
    .replace(/href="\/products[^"]*"/gi, 'href="#top"')
    .replace(/href="https?:\/\/trymalora\.com[^"]*"/gi, 'href="#top"');
  fs.writeFileSync(file, content);
  console.log(`Locked outbound links in ${file}`);
}
