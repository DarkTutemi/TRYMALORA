import fs from 'fs';

async function fetch8sheepCollection() {
  const res = await fetch('https://8sheep.com/collections/our-best-sellers');
  const html = await res.text();
  fs.writeFileSync('scripts/8sheep_collection.html', html);
  console.log('Fetched 8sheep collection HTML length:', html.length);
}
fetch8sheepCollection().catch(console.error);
