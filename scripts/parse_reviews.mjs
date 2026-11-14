import fs from 'fs';

const html = fs.readFileSync('scripts/aneedfamily_page.html', 'utf8');

// Find vstar_product_rating
const ratingMatch = html.match(/var vstar_product_rating = (\{.*?\});/);
if (ratingMatch) {
  console.log('Rating:', ratingMatch[1]);
}

// Find the review list script
const reviewDataMatch = html.match(/"list":\s*(\[\{.*?\}\])\s*,\s*"page"/s) || html.match(/var vstar_reviews_data = (\{.*?\});/s) || html.match(/"reviews":\s*(\{.*?"list":\[.*?\]\})/s);

// Let's search around index 987779
const chunk = html.slice(987000, 1020000);
const jsonStart = chunk.indexOf('{"page":');
if (jsonStart !== -1) {
  // Try to find the closing bracket
  console.log('Found jsonStart at:', jsonStart);
}

// Let's regex for the list:
const listStart = chunk.indexOf('"list":[');
if (listStart !== -1) {
  console.log('Found listStart');
  // Let's parse all reviews in chunk
  const listSub = chunk.slice(listStart + 7);
  let depth = 1;
  let endIdx = -1;
  for (let i = 1; i < listSub.length; i++) {
    if (listSub[i] === '[') depth++;
    else if (listSub[i] === ']') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (endIdx !== -1) {
    const listJsonStr = listSub.slice(0, endIdx + 1);
    const reviews = JSON.parse(listJsonStr);
    console.log(`Successfully parsed ${reviews.length} reviews!`);
    fs.writeFileSync('scripts/extracted_reviews.json', JSON.stringify(reviews, null, 2), 'utf8');
    reviews.slice(0, 5).forEach((r, idx) => {
      console.log(`\nReview #${idx + 1}:`, r.author, `(${r.star} stars)`);
      console.log(`Content:`, r.content);
      console.log(`Images:`, r.resources?.map(res => res.src));
    });
  }
}

