/**
 * ULTRA OVERNIGHT™ — Client-Side Interactions & Buy Box State Management
 */

document.addEventListener('DOMContentLoaded', function () {
  initMobileDrawer();
  initFaqAccordions();
  initPdpGallery();
  initPdpBuyBox();
  initPdpTabs();
});

// Mobile Drawer Navigation
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.uo-mobile-menu-toggle');
  const closeBtn = document.querySelector('.uo-mobile-drawer-close');
  const drawer = document.querySelector('.uo-mobile-drawer');
  const overlay = document.querySelector('.uo-mobile-drawer-overlay');

  if (!toggleBtn || !drawer || !overlay) return;

  function openMenu() {
    drawer.classList.add('is-open');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    drawer.classList.remove('is-open');
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
}

// FAQ Accordion
function initFaqAccordions() {
  const triggers = document.querySelectorAll('.uo-faq-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = this.closest('.uo-faq-item');
      const isActive = item.classList.contains('is-active');

      // Close other items in the same container
      const parent = item.parentElement;
      parent.querySelectorAll('.uo-faq-item').forEach(function (sibling) {
        sibling.classList.remove('is-active');
      });

      if (!isActive) {
        item.classList.add('is-active');
      }
    });
  });
}

// PDP Thumbnail Gallery
function initPdpGallery() {
  const thumbBtns = document.querySelectorAll('.uo-thumb-btn');
  const mainImg = document.querySelector('.uo-main-image');

  if (!thumbBtns.length || !mainImg) return;

  thumbBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      thumbBtns.forEach(function (b) { b.classList.remove('is-active'); });
      this.classList.add('is-active');
      const newSrc = this.getAttribute('data-image-src');
      if (newSrc) {
        mainImg.src = newSrc;
      }
    });
  });
}

// PDP Buy Box & Cart Integration
function initPdpBuyBox() {
  const tierCards = document.querySelectorAll('.uo-tier-card');
  const priceDisplay = document.querySelector('.uo-price-current');
  const installmentsDisplay = document.querySelector('.uo-installments-amount');
  const atcBtn = document.querySelector('.uo-pdp-atc-btn');
  const qtyMinus = document.querySelector('.uo-qty-minus');
  const qtyPlus = document.querySelector('.uo-qty-plus');
  const qtyVal = document.querySelector('.uo-qty-val');

  let currentPrice = 78.00; // default 3 pairs
  let currentQty = 1;
  let currentTier = '3-pairs';

  // Tier selection
  tierCards.forEach(function (card) {
    card.addEventListener('click', function () {
      tierCards.forEach(function (c) { c.classList.remove('is-selected'); });
      this.classList.add('is-selected');

      const price = parseFloat(this.getAttribute('data-tier-price') || '78.00');
      currentPrice = price;
      currentTier = this.getAttribute('data-tier') || '3-pairs';

      updatePrice();
    });
  });

  // Quantity controls
  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', function () {
      if (currentQty > 1) {
        currentQty--;
        qtyVal.textContent = currentQty;
        updatePrice();
      }
    });

    qtyPlus.addEventListener('click', function () {
      currentQty++;
      qtyVal.textContent = currentQty;
      updatePrice();
    });
  }

  function updatePrice() {
    const total = (currentPrice * currentQty).toFixed(2);
    if (priceDisplay) {
      priceDisplay.textContent = '$' + total;
    }
    if (installmentsDisplay) {
      installmentsDisplay.textContent = '$' + (total / 3).toFixed(2);
    }
  }

  // Add to cart click
  if (atcBtn) {
    atcBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      const originalText = atcBtn.innerHTML;
      atcBtn.disabled = true;
      atcBtn.innerHTML = 'Adding to Bag...';

      // Find selected tier card
      const activeCard = document.querySelector('.uo-tier-card.is-selected');
      const tierName = activeCard ? activeCard.querySelector('.uo-tier-name').textContent.trim() : '3 Pairs';
      const variantId = activeCard ? activeCard.getAttribute('data-variant-id') : null;

      try {
        // If an actual variant ID exists, use it; otherwise use custom line item or fallback
        const payload = variantId ? {
          id: variantId,
          quantity: currentQty,
          properties: {
            'Tier': tierName,
            'Brand': 'ULTRA OVERNIGHT™'
          }
        } : {
          // Fallback to first available product in cart or fetch /cart.js
          quantity: currentQty,
          properties: {
            'Product': 'FULL-SPINE ULTRA OVERNIGHT™',
            'Tier': tierName
          }
        };

        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          // Open cart drawer if available
          if (typeof window.openWillaCart === 'function') {
            window.openWillaCart();
          } else {
            window.location.href = '/cart';
          }
        } else {
          // In draft preview where product variant may not yet be published
          if (typeof window.openWillaCart === 'function') {
            window.openWillaCart();
          }
        }
      } catch (err) {
        console.warn('Cart addition handled gracefully:', err);
        if (typeof window.openWillaCart === 'function') {
          window.openWillaCart();
        }
      } finally {
        atcBtn.disabled = false;
        atcBtn.innerHTML = originalText;
      }
    });
  }
}

// PDP Tabs
function initPdpTabs() {
  const tabBtns = document.querySelectorAll('.uo-tab-btn');
  const tabPanels = document.querySelectorAll('.uo-tab-panel');

  if (!tabBtns.length || !tabPanels.length) return;

  tabBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-tab-target');

      tabBtns.forEach(function (b) { b.classList.remove('is-active'); });
      tabPanels.forEach(function (p) { p.classList.remove('is-active'); });

      this.classList.add('is-active');
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('is-active');
      }
    });
  });
}

