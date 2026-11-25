import fs from 'fs';

const content = fs.readFileSync('sections/malora-footer.liquid', 'utf8');
const lines = content.split('\n');
console.log('Lines 740 to 780:');
for (let i = 740; i <= 780; i++) {
  console.log(`${i}: ${lines[i - 1]}`);
}
