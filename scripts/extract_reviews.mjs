import fs from 'fs';

async function main() {
  const res = await fetch('https://aneedfamily.com/products/itcb', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  fs.writeFileSync('scripts/aneedfamily_page.html', html, 'utf8');
  console.log('Saved page, size:', html.length);

  // Look for JSON structures containing reviews
  const matches = [];
  const regex = /"author"|"reviewer"|"review_image"|"rating"/g;
  let match;
  let count = 0;
  while ((match = regex.exec(html)) !== null && count < 10) {
    matches.push({ term: match[0], index: match.index, preview: html.slice(Math.max(0, match.index - 50), match.index + 200) });
    count++;
  }
  console.log('Matches:', JSON.stringify(matches, null, 2));
}

main().catch(console.error);

