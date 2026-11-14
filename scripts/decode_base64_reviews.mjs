import fs from 'fs';

const raw = fs.readFileSync('scripts/eyvelle_embedded_reviews_raw.txt', 'utf8');
const match = raw.match(/reviewsData'\]\s*=\s*"(\{[\s\S]*?\})";/);

if (match) {
  const jsonStr = JSON.parse(match[0].replace(/^reviewsData'\]\s*=\s*/, '').replace(/;$/, ''));
  const obj = JSON.parse(jsonStr);
  console.log('Keys in obj:', Object.keys(obj));
  if (obj.reviewItems) {
    const b64 = obj.reviewItems;
    const decoded = Buffer.from(b64, 'base64').toString('utf8');
    const data = JSON.parse(decoded);
    console.log('Decoded reviews count:', data.reviews ? data.reviews.length : 'none');
    fs.writeFileSync('scripts/eyvelle_all_reviews_decoded.json', JSON.stringify(data, null, 2), 'utf8');
    if (data.reviews) {
      data.reviews.forEach((r, i) => {
        console.log(`[Review #${i+1}] ${r.author} (${r.rating}★) [${r.date || ''}] Photos: ${r.images ? r.images.length : 0}`);
        console.log(' ', (r.content || r.review || r.body || '').slice(0, 120));
      });
    }
  }
}

