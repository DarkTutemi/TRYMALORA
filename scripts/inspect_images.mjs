import fs from 'fs';

for (const id of [1, 2, 3, 4, 6]) {
  const data = JSON.parse(fs.readFileSync(`scripts/source_${id}_data.json`, 'utf8'));
  console.log(`\nProduct ${id} (${data.title}):`);
  console.log(`  Handle: ${data.handle}`);
  console.log(`  Images count: ${data.images ? data.images.length : 0}`);
  if (data.images && data.images.length > 0) {
    console.log(`  First 3 images:`, data.images.slice(0, 3));
  }
}

