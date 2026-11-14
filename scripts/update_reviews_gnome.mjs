import fs from 'fs';

let content = fs.readFileSync('sections/trymalora-pdp-reviews.liquid', 'utf8');

// 1. Condition at line 6
const targetCond = `{% if product.handle == 'metallic-silver-anti-rust-renovation-coating' or product.handle == 'eyvelle-steam-therapy' %}`;
const replCond = `{% if product.handle == 'metallic-silver-anti-rust-renovation-coating' or product.handle == 'eyvelle-steam-therapy' or product.handle == 'christmas-lantern-welcome-gnome' %}`;

if (!content.includes(targetCond)) {
  throw new Error('targetCond not found in reviews');
}
content = content.replace(targetCond, replCond);

// 2. Score & Count
const targetScore = `{% if product.handle == 'eyvelle-steam-therapy' %}
            <div class="tm-rev-big-score">4.9</div>
          {% else %}
            <div class="tm-rev-big-score">4.8</div>
          {% endif %}`;

const replScore = `{% if product.handle == 'eyvelle-steam-therapy' or product.handle == 'christmas-lantern-welcome-gnome' %}
            <div class="tm-rev-big-score">4.9</div>
          {% else %}
            <div class="tm-rev-big-score">4.8</div>
          {% endif %}`;

if (!content.includes(targetScore)) {
  throw new Error('targetScore not found in reviews');
}
content = content.replace(targetScore, replScore);

const targetCount = `{% if product.handle == 'eyvelle-steam-therapy' %}
            <div class="tm-rev-count-label">1,615 reviews</div>
          {% else %}
            <div class="tm-rev-count-label">125 reviews</div>
          {% endif %}`;

const replCount = `{% if product.handle == 'eyvelle-steam-therapy' %}
            <div class="tm-rev-count-label">1,615 reviews</div>
          {% elsif product.handle == 'christmas-lantern-welcome-gnome' %}
            <div class="tm-rev-count-label">142 reviews</div>
          {% else %}
            <div class="tm-rev-count-label">125 reviews</div>
          {% endif %}`;

if (!content.includes(targetCount)) {
  throw new Error('targetCount not found in reviews');
}
content = content.replace(targetCount, replCount);

// 3. Breakdown bars
const targetBars = `<!-- BREAKDOWN BARS -->
        <div class="tm-rev-breakdown-col">
          <div class="tm-rev-bar-row">
            <span class="tm-bar-label">5 Star</span>
            <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 85.6%;"></div></div>
            <span class="tm-bar-count">107</span>
          </div>
          <div class="tm-rev-bar-row">
            <span class="tm-bar-label">4 Star</span>
            <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 12.8%;"></div></div>
            <span class="tm-bar-count">16</span>
          </div>
          <div class="tm-rev-bar-row">
            <span class="tm-bar-label">3 Star</span>
            <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 1.6%;"></div></div>
            <span class="tm-bar-count">2</span>
          </div>
          <div class="tm-rev-bar-row">
            <span class="tm-bar-label">2 Star</span>
            <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 0%;"></div></div>
            <span class="tm-bar-count">0</span>
          </div>
          <div class="tm-rev-bar-row">
            <span class="tm-bar-label">1 Star</span>
            <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 0%;"></div></div>
            <span class="tm-bar-count">0</span>
          </div>
        </div>`;

const replBars = `<!-- BREAKDOWN BARS -->
        <div class="tm-rev-breakdown-col">
          {% if product.handle == 'christmas-lantern-welcome-gnome' %}
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">5 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 88%;"></div></div>
              <span class="tm-bar-count">125</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">4 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 10%;"></div></div>
              <span class="tm-bar-count">14</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">3 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 2%;"></div></div>
              <span class="tm-bar-count">3</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">2 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 0%;"></div></div>
              <span class="tm-bar-count">0</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">1 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 0%;"></div></div>
              <span class="tm-bar-count">0</span>
            </div>
          {% else %}
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">5 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 85.6%;"></div></div>
              <span class="tm-bar-count">107</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">4 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 12.8%;"></div></div>
              <span class="tm-bar-count">16</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">3 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 1.6%;"></div></div>
              <span class="tm-bar-count">2</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">2 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 0%;"></div></div>
              <span class="tm-bar-count">0</span>
            </div>
            <div class="tm-rev-bar-row">
              <span class="tm-bar-label">1 Star</span>
              <div class="tm-bar-track"><div class="tm-bar-fill" style="width: 0%;"></div></div>
              <span class="tm-bar-count">0</span>
            </div>
          {% endif %}
        </div>`;

if (!content.includes(targetBars)) {
  throw new Error('targetBars not found in reviews');
}
content = content.replace(targetBars, replBars);

// 4. allReviewsData JSON
const gnomeReviewsArray = [
  {
    id: "gnome-rev-01",
    star: 5,
    author: "Hannah M.",
    date: "11/04/2026",
    content: "This little gnome is hands down the sweetest holiday decoration we've ever bought! The star lantern produces such a gentle, cozy glow on our porch every evening. Everyone who visits stops to take a picture!",
    img: "https://ncrovoprime.com/cdn/shop/files/51ec8bc9-19e1-4750-81e9-716b9f443448.png?v=1793673600&width=800",
    thumb: "https://ncrovoprime.com/cdn/shop/files/51ec8bc9-19e1-4750-81e9-716b9f443448.png?v=1793673600&width=200"
  },
  {
    id: "gnome-rev-02",
    star: 5,
    author: "Thomas & Claire G.",
    date: "11/02/2026",
    content: "We placed him right next to our Christmas tree by the presents. The warm light from his star blends so nicely with the tree lights. The pinecone and greenery textures look so realistic!",
    img: "https://ncrovoprime.com/cdn/shop/files/41b23eb3-e0f1-48f2-bf80-ea57b5122a81.png?v=1793673601&width=800",
    thumb: "https://ncrovoprime.com/cdn/shop/files/41b23eb3-e0f1-48f2-bf80-ea57b5122a81.png?v=1793673601&width=200"
  },
  {
    id: "gnome-rev-03",
    star: 5,
    author: "Margaret B.",
    date: "10/29/2026",
    content: "The craftsmanship on the knitted hat and the snowy beard exceeded my expectations. It feels heavy and well-weighted, so it doesn't tip over. Packaged beautifully too.",
    img: "https://ncrovoprime.com/cdn/shop/files/7a2a339d-5869-4893-bdbc-a646d5370aba.png?v=1793673602&width=800",
    thumb: "https://ncrovoprime.com/cdn/shop/files/7a2a339d-5869-4893-bdbc-a646d5370aba.png?v=1793673602&width=200"
  },
  {
    id: "gnome-rev-04",
    star: 5,
    author: "David S.",
    date: "10/26/2026",
    content: "Bought the 2-pack for our entryway table and fireplace hearth. They create such an inviting, rustic Nordic Christmas vibe. My grandchildren adore them!",
    img: "https://ncrovoprime.com/cdn/shop/files/6c43cc71-c025-43bd-9631-2f3a04afe121.png?v=1793673602&width=800",
    thumb: "https://ncrovoprime.com/cdn/shop/files/6c43cc71-c025-43bd-9631-2f3a04afe121.png?v=1793673602&width=200"
  },
  {
    id: "gnome-rev-05",
    star: 5,
    author: "Jessica K.",
    date: "10/22/2026",
    content: "The glowing star lantern at night is pure magic. It has a warm amber-white tone that isn't glaring at all. Battery lasts forever. Highly recommended!",
    img: "https://ncrovoprime.com/cdn/shop/files/37fa84c3-075e-4dc0-a07e-20fde6a1a4e8.png?v=1793673602&width=800",
    thumb: "https://ncrovoprime.com/cdn/shop/files/37fa84c3-075e-4dc0-a07e-20fde6a1a4e8.png?v=1793673602&width=200"
  },
  {
    id: "gnome-rev-06",
    star: 5,
    author: "Robert P.",
    date: "10/19/2026",
    content: "The attention to detail with the berries and pine boughs gives it such an authentic woodland character. Exactly as pictured, arrived in 3 days.",
    img: null,
    thumb: null
  },
  {
    id: "gnome-rev-07",
    star: 5,
    author: "Evelyn W.",
    date: "10/16/2026",
    content: "Super cute holiday centerpiece! Heavy enough to stay upright on our windy covered porch. Will be buying a couple more as gifts.",
    img: null,
    thumb: null
  },
  {
    id: "gnome-rev-08",
    star: 4,
    author: "Brian L.",
    date: "10/12/2026",
    content: "Very well made decoration. Looks great at night. Wish the battery switch was a tiny bit easier to reach without lifting, but otherwise 10/10.",
    img: null,
    thumb: null
  },
  {
    id: "gnome-rev-09",
    star: 5,
    author: "Samantha D.",
    date: "10/08/2026",
    content: "Brought so much festive spirit into our foyer. Quality is wonderful and the star light is warm and comforting.",
    img: null,
    thumb: null
  },
  {
    id: "gnome-rev-10",
    star: 5,
    author: "Arthur N.",
    date: "10/04/2026",
    content: "Outstanding quality. You can tell it's not cheap hollow plastic. It has genuine weight and the knitted texture is lovely.",
    img: null,
    thumb: null
  }
];

const targetDataCheck = `const allReviewsData = {% if product.handle == 'eyvelle-steam-therapy' %}`;
const replDataCheck = `const allReviewsData = {% if product.handle == 'christmas-lantern-welcome-gnome' %}${JSON.stringify(gnomeReviewsArray)}{% elsif product.handle == 'eyvelle-steam-therapy' %}`;

if (!content.includes(targetDataCheck)) {
  throw new Error('targetDataCheck not found in reviews');
}
content = content.replace(targetDataCheck, replDataCheck);

fs.writeFileSync('sections/trymalora-pdp-reviews.liquid', content, 'utf8');
console.log('✔ Successfully updated sections/trymalora-pdp-reviews.liquid for christmas-lantern-welcome-gnome!');

