import fs from 'fs';

const content = fs.readFileSync('sections/zavelyn-v4-pdp-main.liquid', 'utf8');

const lines = content.split('\n');
console.log('Total lines in zavelyn-v4-pdp-main.liquid:', lines.length);

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('product.handle') || line.includes('when \'eyvelle-steam-therapy\'') || line.includes('when \'ear-cleaner\'')) {
    console.log(`Line ${i + 1}: ${line.trim()}`);
  }
}

