import fs from 'fs';
import path from 'path';

const sectionsDir = 'sections';
const files = fs.readdirSync(sectionsDir).filter(f => f.startsWith('malora-') && f.endsWith('.liquid'));

for (const file of files) {
  const filePath = path.join(sectionsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('__Malora_CDN_MEDIA_ASSET__') || content.includes('__8SHEEP_CDN_MEDIA_ASSET__')) {
    console.log(`Fixing CDN URL in ${file}...`);
    content = content
      .replace(/__Malora_CDN_MEDIA_ASSET__/g, 'https://8sheep.com/cdn/')
      .replace(/__8SHEEP_CDN_MEDIA_ASSET__/g, 'https://8sheep.com/cdn/');
    fs.writeFileSync(filePath, content);
    console.log(`  -> Fixed ${file}`);
  }
}
console.log('=== ALL MALORA SECTIONS CDN URLS RESTORED! ===');
