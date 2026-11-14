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
  const atcBtn = document.querySelector('.uo-pdp-atc-btn');
  const qtyMinus = document.querySelector('.uo-qty-minus');
  const qtyPlus = document.querySelector('.uo-qty-plus');
  const qtyVal = document.querySelector('.uo-qty-val');
  const errorMsg = document.querySelector('.uo-pdp-error-msg');
  const optionPills = document.querySelectorAll('.uo-option-pill');

  let currentPrice = 0; // pending actual product pricing
  let currentQty = 1;
  let currentTier = '3-pairs';
  let currentPackQty = 3;

  // Selected tier initialization
  const initialTier = document.querySelector('.uo-tier-card.is-selected');
  if (initialTier) {
    currentPrice = parseFloat(initialTier.getAttribute('data-tier-price') || '0');
    currentTier = initialTier.getAttribute('data-tier') || '3-pairs';
    currentPackQty = parseInt(initialTier.getAttribute('data-pack-qty') || '3', 10);
  }

  // Parse variants data if embedded
  const variantsDataEl = document.getElementById('uo-product-variants-json');
  let variantsData = [];
  if (variantsDataEl) {
    try {
      variantsData = JSON.parse(variantsDataEl.textContent);
    } catch (e) {
      console.warn('Could not parse variant data:', e);
    }
  }

  // Option Pills (e.g. Size or Color)
  if (optionPills.length > 0) {
    optionPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        const group = this.closest('.uo-option-group');
        if (!group) return;
        group.querySelectorAll('.uo-option-pill').forEach(function (p) {
          p.classList.remove('is-active');
          p.setAttribute('aria-pressed', 'false');
          p.style.backgroundColor = '#ffffff';
          p.style.color = 'var(--uo-charcoal)';
          p.style.borderColor = '#D9CCD0';
        });
        this.classList.add('is-active');
        this.setAttribute('aria-pressed','true');
        this.style.backgroundColor = 'var(--uo-plum)';
        this.style.color = '#ffffff';
        this.style.borderColor = 'var(--uo-plum)';

        const valLabel = group.querySelector('.uo-option-selected-label');
        if (valLabel) {
          valLabel.textContent = this.getAttribute('data-option-value');
        }

        // Match selected options against variantsData
        if (variantsData.length > 0) {
          const selectedValues = Array.from(document.querySelectorAll('.uo-option-group')).map(function (g) {
            const active = g.querySelector('.uo-option-pill.is-active');
            return active ? active.getAttribute('data-option-value') : null;
          });

          const matchedVariant = variantsData.find(function (v) {
            return selectedValues.every(function (val, idx) {
              return !val || v.options[idx] === val;
            });
          });

          if (matchedVariant) {
            // Update variant ID on cards
            tierCards.forEach(function (c) {
              const packQty = parseInt(c.getAttribute('data-pack-qty') || '1', 10);
              const unitCents = Number(matchedVariant.price || 0);
              c.setAttribute('data-variant-id', matchedVariant.id);
              c.setAttribute('data-tier-price', ((unitCents * packQty) / 100).toFixed(2));
              const tierPrice = c.querySelector('.uo-tier-price');
              const unitPrice = c.querySelector('.uo-tier-unit');
              const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
              if (tierPrice) tierPrice.textContent = unitCents > 0 ? currency.format(unitCents * packQty / 100) : 'TBD';
              if (unitPrice) unitPrice.textContent = unitCents > 0 ? '(' + currency.format(unitCents / 100) + '/each)' : '(Pricing pending)';
            });
            const chosenCard = document.querySelector('.uo-tier-card.is-selected');
            if (chosenCard) currentPrice = parseFloat(chosenCard.getAttribute('data-tier-price') || '0');
            updatePrice();

            // Update button availability
            if (atcBtn && atcBtn.getAttribute('data-has-product') === 'true') {
              if (matchedVariant.available) {
                atcBtn.disabled = false;
                atcBtn.innerHTML = 'ADD TO CART ➔';
                atcBtn.classList.remove('uo-btn-disabled');
              } else {
                atcBtn.disabled = true;
                atcBtn.innerHTML = 'SOLD OUT';
                atcBtn.classList.add('uo-btn-disabled');
              }
            }
          }
        }
      });
    });
  }

  // Tier selection
  tierCards.forEach(function (card) {
    card.addEventListener('click', function () {
      tierCards.forEach(function (c) {
        c.classList.remove('is-selected');
        c.setAttribute('aria-checked', 'false');
        c.setAttribute('tabindex', '-1');
      });
      this.classList.add('is-selected');
      this.setAttribute('aria-checked', 'true');
      this.setAttribute('tabindex', '0');

      const price = parseFloat(this.getAttribute('data-tier-price') || '0');
      currentPrice = price;
      currentTier = this.getAttribute('data-tier') || '3-pairs';
      currentPackQty = parseInt(this.getAttribute('data-pack-qty') || '1', 10);

      updatePrice();
    });
    card.addEventListener('keydown', function (event) {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        card.click();
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        const cards = Array.from(tierCards);
        const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
        const target = cards[(cards.indexOf(card) + delta + cards.length) % cards.length];
        target.focus();
        target.click();
      }
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
      priceDisplay.textContent = currentPrice > 0 ? "$" + total : "Pricing to be confirmed"
    }

  }

  // Add to cart click
  if (atcBtn) {
    atcBtn.addEventListener('click', async function (e) {
      e.preventDefault();
      if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
      }

      const hasProduct = atcBtn.getAttribute('data-has-product') === 'true';
      const activeCard = document.querySelector('.uo-tier-card.is-selected');
      const variantId = activeCard ? activeCard.getAttribute('data-variant-id') : null;

      // Graceful product-unavailable state if product is not yet created in Admin
      if (!hasProduct || !variantId || variantId === 'null' || variantId === '') {
        if (errorMsg) {
          errorMsg.textContent = 'This pre-production product is not available for purchase yet.';
          errorMsg.style.display = 'block';
        }
        return;
      }

      const tierName = activeCard ? activeCard.querySelector('.uo-tier-name').textContent.trim() : '3 Pairs';
      const originalText = atcBtn.innerHTML;
      atcBtn.disabled = true;
      atcBtn.innerHTML = 'Adding to Bag...';

      try {
        const payload = {
          id: parseInt(variantId, 10),
          quantity: currentPackQty * currentQty,
          properties: {
            'Pack': tierName,
            'Brand': 'ULTRA OVERNIGHT™'
          }
        };

        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          if (typeof window.willaRefreshCart === 'function') {
            await window.willaRefreshCart();
          }
          if (typeof window.openWillaCart === 'function') {
            window.openWillaCart();
          } else {
            window.location.href = '/cart';
          }
        } else {
          const errData = await res.json().catch(function () { return {}; });
          const message = errData.description || errData.message || 'Could not add to bag. Please try again.';
          if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        console.error('Cart add error:', err);
        if (errorMsg) {
          errorMsg.textContent = 'A network error occurred while adding to cart.';
          errorMsg.style.display = 'block';
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
