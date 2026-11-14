import fs from 'fs';

const content = fs.readFileSync('sections/trymalora-pdp-reviews.liquid', 'utf8');

const lines = content.split('\n');
console.log('Total lines in reviews.liquid:', lines.length);

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('product.handle') || lines[i].includes('when ') || lines[i].includes('eyvelle-steam-therapy')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}

