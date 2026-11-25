import fs from 'fs';

const content = fs.readFileSync('sections/malora-footer.liquid', 'utf8');
const lines = content.split('\n');

for (let i = 730; i >= 650; i--) {
  if (lines[i].includes('<script')) {
    console.log(`Found script tag at line ${i + 1}: ${lines[i]}`);
  }
}
