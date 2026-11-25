import fs from 'fs';

const content = fs.readFileSync('sections/malora-footer.liquid', 'utf8');
const lines = content.split('\n');

for (let i = 642; i < lines.length; i++) {
  if (lines[i].includes('</script>')) {
    console.log(`Closing script found at line ${i + 1}: ${lines[i]}`);
    break;
  }
}
