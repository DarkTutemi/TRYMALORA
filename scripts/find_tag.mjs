import fs from 'fs';

const content = fs.readFileSync('sections/malora-footer.liquid', 'utf8');
const lines = content.split('\n');

for (let i = 740; i >= 0; i--) {
  if (lines[i].includes('rebuy-cart-template') || lines[i].includes('<script')) {
    console.log(`Found at line ${i + 1}: ${lines[i]}`);
    break;
  }
}
