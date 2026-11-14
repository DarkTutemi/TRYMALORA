import fs from 'fs';

const content = fs.readFileSync('sections/trymalora-pdp-faq.liquid', 'utf8');

const lines = content.split('\n');
console.log('Total lines in faq.liquid:', lines.length);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('when ') || lines[i].includes('product.handle')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}

