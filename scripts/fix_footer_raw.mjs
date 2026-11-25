import fs from 'fs';

const content = fs.readFileSync('sections/malora-footer.liquid', 'utf8');
const lines = content.split('\n');

const openIdx = lines.findIndex(l => l.includes('<script id="rebuy-cart-template" type="text/template">'));
let closeIdx = -1;
for (let i = openIdx + 1; i < lines.length; i++) {
  if (lines[i].includes('</script>')) {
    closeIdx = i;
    break;
  }
}

console.log(`Wrapping lines ${openIdx + 1} to ${closeIdx + 1} in {% raw %}...{% endraw %}`);

// Clean any pre-existing partial raw tags in that range
const innerLines = lines.slice(openIdx + 1, closeIdx)
  .filter(l => !l.includes('{% raw %}') && !l.includes('{% endraw %}'));

const newLines = [
  ...lines.slice(0, openIdx + 1),
  '{% raw %}',
  ...innerLines,
  '{% endraw %}',
  ...lines.slice(closeIdx)
];

fs.writeFileSync('sections/malora-footer.liquid', newLines.join('\n'));
console.log('Successfully wrapped rebuy template block in {% raw %}...{% endraw %}');
