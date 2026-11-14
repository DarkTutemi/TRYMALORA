import fs from 'fs';

const cleanReviews = JSON.parse(fs.readFileSync('scripts/clean_125_reviews.json', 'utf8'));

const liquidTemplate = `{% comment %}
  Trymalora PDP Customer Reviews Section
  Imported from aneedfamily.com/products/itcb for Metallic Silver Coating
{% endcomment %}

{% if product.handle == 'metallic-silver-anti-rust-renovation-coating' %}
<section class="tm-reviews-section" id="tmCustomerReviews" aria-label="Customer Reviews">
  <div class="tm-reviews-container">
    
    <!-- HEADER SUMMARY -->
    <div class="tm-reviews-header">
      <h2 class="tm-reviews-title">{{ section.settings.heading | default: "Customer Reviews" }}</h2>
      
      <div class="tm-reviews-summary-grid">
        <!-- SCORE & STARS -->
        <div class="tm-rev-score-col">
          <div class="tm-rev-big-score">4.8</div>
          <div class="tm-rev-stars-row" aria-label="4.8 out of 5 stars">
            <svg viewBox="0 0 20 20" fill="#F59E0B" width="22" height="22"><path d="M10 1.5l2.4 6.5H19l-5.3 4 2 6.5-5.7-4.2-5.7 4.2 2-6.5-5.3-4h6.6z"/></svg>
            <svg viewBox="0 0 20 20" fill="#F59E0B" width="22" height="22"><path d="M10 1.5l2.4 6.5H19l-5.3 4 2 6.5-5.7-4.2-5.7 4.2 2-6.5-5.3-4h6.6z"/></svg>
            <svg viewBox="0 0 20 20" fill="#F59E0B" width="22" height="22"><path d="M10 1.5l2.4 6.5H19l-5.3 4 2 6.5-5.7-4.2-5.7 4.2 2-6.5-5.3-4h6.6z"/></svg>
            <svg viewBox="0 0 20 20" fill="#F59E0B" width="22" height="22"><path d="M10 1.5l2.4 6.5H19l-5.3 4 2 6.5-5.7-4.2-5.7 4.2 2-6.5-5.3-4h6.6z"/></svg>
            <svg viewBox="0 0 20 20" fill="#F59E0B" width="22" height="22"><path d="M10 1.5l2.4 6.5H19l-5.3 4 2 6.5-5.7-4.2-5.7 4.2 2-6.5-5.3-4h6.6z"/></svg>
          </div>
          <div class="tm-rev-count-label">125 reviews</div>
        </div>

        <!-- BREAKDOWN BARS -->
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
        </div>

        <!-- FILTER ICON BUTTON -->
        <div class="tm-rev-actions-col">
          <button type="button" class="tm-rev-filter-btn" id="tmRevFilterBtn" aria-label="Filter Reviews">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
          </button>
        </div>
      </div>

      <!-- FILTER DROPDOWN / TOGGLE BAR -->
      <div class="tm-rev-filter-bar" id="tmRevFilterBar">
        <button type="button" class="tm-filter-chip active" data-filter="all">All Reviews (125)</button>
        <button type="button" class="tm-filter-chip" data-filter="photo">With Photos (15)</button>
        <button type="button" class="tm-filter-chip" data-filter="5star">5 Stars (107)</button>
      </div>

      <!-- SUBTITLE / TRUST STATEMENT -->
      <div class="tm-rev-trust-statement">
        <span>125 ★★★★★ verified customer ratings &middot; 125 with detailed reviews</span>
      </div>
    </div>

    <!-- REVIEWS GRID -->
    <div class="tm-reviews-grid" id="tmReviewsGrid">
      <!-- Injected via JavaScript -->
    </div>

    <!-- PAGINATION -->
    <div class="tm-reviews-pagination" id="tmReviewsPagination">
      <!-- Injected via JavaScript -->
    </div>

  </div>

  <!-- LIGHTBOX MODAL -->
  <div class="tm-rev-lightbox" id="tmRevLightbox" style="display: none;" role="dialog" aria-modal="true" aria-label="Review Photo Modal">
    <div class="tm-rev-lightbox-overlay" id="tmLightboxOverlay"></div>
    <div class="tm-rev-lightbox-card">
      <button type="button" class="tm-lightbox-close" id="tmLightboxClose" aria-label="Close modal">&times;</button>
      <div class="tm-lightbox-body">
        <div class="tm-lightbox-media">
          <img src="" alt="Customer Review Photo" id="tmLightboxImg" />
          <button type="button" class="tm-lightbox-nav prev" id="tmLightboxPrev" aria-label="Previous photo">&#10094;</button>
          <button type="button" class="tm-lightbox-nav next" id="tmLightboxNext" aria-label="Next photo">&#10095;</button>
        </div>
        <div class="tm-lightbox-info">
          <div class="tm-lightbox-stars" id="tmLightboxStars">★★★★★</div>
          <div class="tm-lightbox-author" id="tmLightboxAuthor">Frank H.</div>
          <div class="tm-lightbox-badge"><span class="check-icon">✓</span> Verified purchase</div>
          <p class="tm-lightbox-text" id="tmLightboxText"></p>
          <div class="tm-lightbox-date" id="tmLightboxDate"></div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
.tm-reviews-section {
  background: #FFFFFF;
  padding: 64px 20px 80px;
  border-top: 1px solid #F0E8ED;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #1F2937;
}

.tm-reviews-container {
  max-width: 1240px;
  margin: 0 auto;
}

.tm-reviews-header {
  margin-bottom: 32px;
}

.tm-reviews-title {
  font-family: var(--zv-font-heading, "Fraunces", Georgia, serif);
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 24px 0;
  letter-spacing: -0.01em;
}

.tm-reviews-summary-grid {
  display: flex;
  align-items: center;
  gap: 40px;
  padding-bottom: 24px;
  border-bottom: 1px solid #E5E7EB;
  position: relative;
}

.tm-rev-score-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 130px;
}

.tm-rev-big-score {
  font-size: 46px;
  font-weight: 800;
  line-height: 1;
  color: #111827;
  letter-spacing: -0.02em;
}

.tm-rev-stars-row {
  display: flex;
  gap: 3px;
  margin: 8px 0 4px;
}

.tm-rev-count-label {
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.tm-rev-breakdown-col {
  flex: 1;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tm-rev-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #4B5563;
}

.tm-bar-label {
  width: 48px;
  font-size: 12px;
  color: #4B5563;
}

.tm-bar-track {
  flex: 1;
  height: 9px;
  background: #F3F4F6;
  border-radius: 999px;
  overflow: hidden;
}

.tm-bar-fill {
  height: 100%;
  background: #F59E0B;
  border-radius: 999px;
}

.tm-bar-count {
  width: 32px;
  text-align: right;
  font-size: 12px;
  color: #6B7280;
}

.tm-rev-actions-col {
  margin-left: auto;
}

.tm-rev-filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #D1D5DB;
  background: #FFFFFF;
  border-radius: 8px;
  cursor: pointer;
  color: #4B5563;
  transition: all 0.15s ease;
}

.tm-rev-filter-btn:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.tm-rev-filter-bar {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.tm-filter-chip {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.15s;
}

.tm-filter-chip:hover, .tm-filter-chip.active {
  background: #111827;
  color: #FFFFFF;
  border-color: #111827;
}

.tm-rev-trust-statement {
  margin-top: 18px;
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

/* REVIEWS GRID */
.tm-reviews-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-top: 24px;
}

.tm-rev-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.tm-rev-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.tm-rev-card-media {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 10px;
  background: #F3F4F6;
  cursor: pointer;
  position: relative;
}

.tm-rev-card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}

.tm-rev-card-media:hover img {
  transform: scale(1.04);
}

.tm-rev-card-stars {
  color: #F59E0B;
  font-size: 14px;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.tm-rev-card-author {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 2px;
}

.tm-rev-card-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #4B5563;
  margin-bottom: 8px;
  font-weight: 500;
}

.tm-rev-card-badge .check-circle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #111827;
  color: #FFFFFF;
  font-size: 9px;
  font-weight: 700;
}

.tm-rev-card-content {
  font-size: 13px;
  line-height: 1.45;
  color: #374151;
  flex: 1;
}

.tm-rev-readmore-btn {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  text-decoration: underline;
  margin-left: 4px;
}

/* PAGINATION */
.tm-reviews-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 40px;
}

.tm-page-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 6px;
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.tm-page-btn:hover {
  border-color: #9CA3AF;
  background: #F9FAFB;
}

.tm-page-btn.active {
  background: #111827;
  border-color: #111827;
  color: #FFFFFF;
}

/* LIGHTBOX MODAL */
.tm-rev-lightbox {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-rev-lightbox-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
}

.tm-rev-lightbox-card {
  position: relative;
  z-index: 2;
  background: #FFFFFF;
  border-radius: 12px;
  max-width: 780px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.tm-lightbox-close {
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 10;
  background: rgba(0,0,0,0.5);
  color: #FFF;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
}

.tm-lightbox-close:hover {
  background: rgba(0,0,0,0.8);
}

.tm-lightbox-body {
  display: flex;
  flex-direction: row;
  max-height: 85vh;
}

.tm-lightbox-media {
  flex: 1.2;
  background: #000;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-lightbox-media img {
  max-width: 100%;
  max-height: 85vh;
  object-fit: contain;
}

.tm-lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.7);
  color: #000;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  transition: all 0.15s;
}

.tm-lightbox-nav.prev { left: 12px; }
.tm-lightbox-nav.next { right: 12px; }
.tm-lightbox-nav:hover { background: #FFFFFF; }

.tm-lightbox-info {
  flex: 1;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tm-lightbox-stars {
  color: #F59E0B;
  font-size: 18px;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.tm-lightbox-author {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.tm-lightbox-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  margin: 4px 0 16px;
}

.tm-lightbox-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  flex: 1;
}

.tm-lightbox-date {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 16px;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .tm-reviews-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .tm-lightbox-body {
    flex-direction: column;
  }
  .tm-lightbox-media {
    max-height: 50vh;
  }
}

@media (max-width: 640px) {
  .tm-reviews-summary-grid {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .tm-rev-breakdown-col {
    width: 100%;
  }
  .tm-reviews-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  .tm-rev-card {
    padding: 10px;
  }
}

@media (max-width: 420px) {
  .tm-reviews-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<script>
(function() {
  const allReviewsData = ${JSON.stringify(cleanReviews)};

  let activeFilter = 'all';
  let currentPage = 1;
  const pageSize = 15;
  let activeLightboxIndex = -1;

  function getFilteredReviews() {
    if (activeFilter === 'photo') {
      return allReviewsData.filter(r => r.img);
    } else if (activeFilter === '5star') {
      return allReviewsData.filter(r => r.star === 5);
    }
    return allReviewsData;
  }

  function renderReviews() {
    const grid = document.getElementById('tmReviewsGrid');
    const pagination = document.getElementById('tmReviewsPagination');
    if (!grid) return;

    const filtered = getFilteredReviews();
    const totalPages = Math.ceil(filtered.length / pageSize) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);

    let html = '';
    pageItems.forEach((rev, idx) => {
      const globalIdx = filtered.indexOf(rev);
      const isLong = rev.content.length > 130;
      const snippet = isLong ? rev.content.slice(0, 130) + '...' : rev.content;

      html += \`
        <div class="tm-rev-card" data-global-idx="\${globalIdx}">
          \${rev.img ? \`
            <div class="tm-rev-card-media" onclick="window.openTmLightbox(\${globalIdx})">
              <img src="\${rev.img}" alt="Customer photo by \${rev.author}" loading="lazy" />
            </div>
          \` : ''}
          <div class="tm-rev-card-stars">\${'★'.repeat(rev.star)}</div>
          <div class="tm-rev-card-author">\${rev.author}</div>
          <div class="tm-rev-card-badge">
            <span class="check-circle">✓</span> Verified purchase
          </div>
          <div class="tm-rev-card-content">
            <span class="tm-rev-text-body" id="tmRevText_\${rev.id}">\${snippet}</span>
            \${isLong ? \`
              <button type="button" class="tm-rev-readmore-btn" onclick="window.toggleTmFullText(\${rev.id}, \${globalIdx})">Show full review</button>
            \` : ''}
          </div>
        </div>
      \`;
    });
    grid.innerHTML = html;

    // Render Pagination
    if (pagination) {
      if (totalPages <= 1) {
        pagination.style.display = 'none';
      } else {
        pagination.style.display = 'flex';
        let pagHtml = '';
        if (currentPage > 1) {
          pagHtml += \`<button type="button" class="tm-page-btn prev" onclick="window.goTmPage(\${currentPage - 1})">&#10094;</button>\`;
        }
        for (let p = 1; p <= Math.min(totalPages, 5); p++) {
          pagHtml += \`<button type="button" class="tm-page-btn \${p === currentPage ? 'active' : ''}" onclick="window.goTmPage(\${p})">\${p}</button>\`;
        }
        if (totalPages > 5 && currentPage < totalPages) {
          pagHtml += \`<span style="color:#9CA3AF;padding:0 4px;">...</span>\`;
          pagHtml += \`<button type="button" class="tm-page-btn \${totalPages === currentPage ? 'active' : ''}" onclick="window.goTmPage(\${totalPages})">\${totalPages}</button>\`;
        }
        if (currentPage < totalPages) {
          pagHtml += \`<button type="button" class="tm-page-btn next" onclick="window.goTmPage(\${currentPage + 1})">&#10095;</button>\`;
        }
        pagination.innerHTML = pagHtml;
      }
    }
  }

  // Global Handlers
  window.goTmPage = function(p) {
    currentPage = p;
    renderReviews();
    const sec = document.getElementById('tmCustomerReviews');
    if (sec) sec.scrollIntoView({ behavior: 'smooth' });
  };

  window.toggleTmFullText = function(id, globalIdx) {
    const el = document.getElementById('tmRevText_' + id);
    const rev = getFilteredReviews()[globalIdx];
    if (el && rev) {
      el.textContent = rev.content;
      const btn = el.nextElementSibling;
      if (btn && btn.classList.contains('tm-rev-readmore-btn')) btn.style.display = 'none';
    }
  };

  // Lightbox
  const lightbox = document.getElementById('tmRevLightbox');
  const lightboxImg = document.getElementById('tmLightboxImg');
  const lightboxStars = document.getElementById('tmLightboxStars');
  const lightboxAuthor = document.getElementById('tmLightboxAuthor');
  const lightboxText = document.getElementById('tmLightboxText');
  const lightboxDate = document.getElementById('tmLightboxDate');

  window.openTmLightbox = function(globalIdx) {
    const filtered = getFilteredReviews();
    const rev = filtered[globalIdx];
    if (!rev || !rev.img) return;
    activeLightboxIndex = globalIdx;

    if (lightboxImg) lightboxImg.src = rev.img;
    if (lightboxStars) lightboxStars.textContent = '★'.repeat(rev.star);
    if (lightboxAuthor) lightboxAuthor.textContent = rev.author;
    if (lightboxText) lightboxText.textContent = rev.content;
    if (lightboxDate) lightboxDate.textContent = rev.date ? 'Reviewed on ' + rev.date : '';
    if (lightbox) lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  function closeTmLightbox() {
    if (lightbox) lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  const closeBtn = document.getElementById('tmLightboxClose');
  const overlay = document.getElementById('tmLightboxOverlay');
  if (closeBtn) closeBtn.addEventListener('click', closeTmLightbox);
  if (overlay) overlay.addEventListener('click', closeTmLightbox);

  const prevBtn = document.getElementById('tmLightboxPrev');
  const nextBtn = document.getElementById('tmLightboxNext');
  
  function navLightbox(direction) {
    const filtered = getFilteredReviews().filter(r => r.img);
    if (filtered.length === 0) return;
    let nextIdx = activeLightboxIndex + direction;
    if (nextIdx < 0) nextIdx = filtered.length - 1;
    if (nextIdx >= filtered.length) nextIdx = 0;
    window.openTmLightbox(nextIdx);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => navLightbox(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navLightbox(1));

  document.addEventListener('keydown', function(e) {
    if (lightbox && lightbox.style.display === 'flex') {
      if (e.key === 'Escape') closeTmLightbox();
      if (e.key === 'ArrowLeft') navLightbox(-1);
      if (e.key === 'ArrowRight') navLightbox(1);
    }
  });

  // Filter Buttons
  const filterChips = document.querySelectorAll('.tm-filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', function() {
      filterChips.forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      activeFilter = this.getAttribute('data-filter') || 'all';
      currentPage = 1;
      renderReviews();
    });
  });

  // Filter toggle button
  const filterBtn = document.getElementById('tmRevFilterBtn');
  const filterBar = document.getElementById('tmRevFilterBar');
  if (filterBtn && filterBar) {
    filterBtn.addEventListener('click', function() {
      filterBar.style.display = filterBar.style.display === 'none' ? 'flex' : 'none';
    });
  }

  // Initial render
  renderReviews();
})();
</script>
{% endif %}

{% schema %}
{
  "name": "Customer Reviews",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Customer Reviews"
    }
  ],
  "presets": [
    {
      "name": "Customer Reviews"
    }
  ]
}
{% endschema %}
`;

fs.writeFileSync('sections/trymalora-pdp-reviews.liquid', liquidTemplate, 'utf8');
console.log('Successfully wrote sections/trymalora-pdp-reviews.liquid');

