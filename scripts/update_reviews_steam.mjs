import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-reviews.liquid', 'utf8');
const eyvelleRevs = JSON.parse(fs.readFileSync('scripts/eyvelle_reviews_formatted.json', 'utf8'));

// 1. Condition at top
content = content.replace(
  "{% if product.handle == 'metallic-silver-anti-rust-renovation-coating' %}",
  "{% if product.handle == 'metallic-silver-anti-rust-renovation-coating' or product.handle == 'eyvelle-steam-therapy' %}"
);

// 2. Score box summary
const targetScoreBox = `<div class="tm-rev-big-score">4.8</div>`;
const replScoreBox = `{% if product.handle == 'eyvelle-steam-therapy' %}
            <div class="tm-rev-big-score">4.9</div>
          {% else %}
            <div class="tm-rev-big-score">4.8</div>
          {% endif %}`;
content = content.replace(targetScoreBox, replScoreBox);

// 3. Count label
const targetCount = `<div class="tm-rev-count-label">125 reviews</div>`;
const replCount = `{% if product.handle == 'eyvelle-steam-therapy' %}
            <div class="tm-rev-count-label">1,615 reviews</div>
          {% else %}
            <div class="tm-rev-count-label">125 reviews</div>
          {% endif %}`;
content = content.replace(targetCount, replCount);

// 4. Trust statement
const targetTrust = `<div class="tm-rev-trust-statement">
        <span>125 ★★★★★ verified customer ratings &middot; 125 with detailed reviews</span>
      </div>`;
const replTrust = `{% if product.handle == 'eyvelle-steam-therapy' %}
        <div class="tm-rev-trust-statement">
          <span>1,615 ★★★★★ verified customer ratings &middot; Real photo reviews</span>
        </div>
      {% else %}
        <div class="tm-rev-trust-statement">
          <span>125 ★★★★★ verified customer ratings &middot; 125 with detailed reviews</span>
        </div>
      {% endif %}`;
content = content.replace(targetTrust, replTrust);

// 5. JavaScript allReviewsData
const targetJsData = `const allReviewsData = [{"id":"26475727"`;
const replJsData = `const allReviewsData = {% if product.handle == 'eyvelle-steam-therapy' %}${JSON.stringify(eyvelleRevs)}{% else %}[{"id":"26475727"`;

// At the end of the metallic silver array:
const targetJsEnd = `{"id":"26475765","star":5,"author":"Margaret H.","date":"2026-09-29","content":"Got this to fix up a rusty birdbath stand. I just wiped the dirt off and painted right over the worst spots. It went on super smooth and covered everything in one coat. The metallic shine is really pretty. It saved me from throwing the whole thing in the trash. Definitely recommend if you have old rusty metal stuff. 💯","img":null,"thumb":null}];`;
const replJsEnd = targetJsEnd.replace('];', ']{% endif %};');

if (!content.includes(targetJsData)) {
  console.error("targetJsData not found");
  process.exit(1);
}
if (!content.includes(targetJsEnd)) {
  console.error("targetJsEnd not found");
  process.exit(1);
}

content = content.replace(targetJsData, replJsData);
content = content.replace(targetJsEnd, replJsEnd);

fs.writeFileSync('sections/trymalora-pdp-reviews.liquid', content, 'utf8');
console.log('Successfully updated sections/trymalora-pdp-reviews.liquid');

