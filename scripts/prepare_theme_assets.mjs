import fs from 'fs';
import path from 'path';

const srcDir = 'scripts/8sheep_assets';
const destDir = 'assets';

const files = fs.readdirSync(srcDir);

for (const file of files) {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  let content = fs.readFileSync(srcPath, 'utf8');

  // Replace branding
  content = content
    .replace(/8\s*Sheep\s*Organics/gi, 'Malora Organics')
    .replace(/8\s*Sheep/gi, 'Malora')
    .replace(/8sheep\.com/gi, 'trymalora.com')
    .replace(/8sheep/gi, 'malora');

  fs.writeFileSync(destPath, content);
  console.log(`Copied and rebranded ${file} -> assets/${file} (${content.length} bytes)`);
}
