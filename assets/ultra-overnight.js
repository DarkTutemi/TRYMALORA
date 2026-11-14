/**
 * ULTRA OVERNIGHT™ — Authoritative Client-Side State, Variant Mapping & Mix-and-Match
 * Single source of truth for variant selection, bundle tiers, multi-line cart payload, and CRO interactions.
 */

// Global State (Authoritative single source of truth; reads exclusively from real Shopify product JSON)
window.uoState = {
  variants: [],
  selectedSize: 'M',
  selectedColor: 'Plum Noir',
  activeVariantId: null,
  selectedTier: '3-pairs',
  packQty: 3,
  currentQty: 1,
  isMixMatchExpanded: false,
  mixMatchSlots: [
    { pairNum: 1, size: 'M', color: 'Plum Noir', variantId: null },
    { pairNum: 2, size: 'M', color: 'Plum Noir', variantId: null },
    { pairNum: 3, size: 'M', color: 'Plum Noir', variantId: null }
  ]
};

// Global Helper Functions (Accessible from inline HTML)
window.openUoSizeGuide = function () {
  const modal = document.getElementById('uoSizeGuideModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
};

window.closeUoSizeGuide = function () {
  const modal = document.getElementById('uoSizeGuideModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
};

window.scrollToUoBuyBox = function () {
  const buyBox = document.getElementById('uoBuyBox') || document.getElementById('uoPdpSection');
  if (buyBox) {
    buyBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

document.addEventListener('DOMContentLoaded', function () {
  initMobileDrawer();
  initFaqAccordions();
  initPdpGallery();
  initAuthoritativeVariants();
  initAuthoritativeSelectors();
  initTierBundles();
  initMixAndMatchArchitecture();
  initStickyMobileBar();
  initPdpTabs();
  initModalListeners();
});

// 1. Mobile Drawer Navigation
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

// 2. FAQ Accordion
function initFaqAccordions() {
  const triggers = document.querySelectorAll('.uo-faq-trigger');
  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const item = this.closest('.uo-faq-item');
      if (!item) return;
      const isActive = item.classList.contains('is-active');

      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.uo-faq-item').forEach(function (sibling) {
          sibling.classList.remove('is-active');
          const btn = sibling.querySelector('.uo-faq-trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }

      if (!isActive) {
        item.classList.add('is-active');
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// 3. PDP Thumbnail Gallery
function initPdpGallery() {
  const thumbBtns = document.querySelectorAll('.uo-thumb-btn');
  const mainImg = document.querySelector('.uo-main-image');

  if (!thumbBtns.length || !mainImg) return;

  thumbBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      thumbBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');
      const newSrc = this.getAttribute('data-image-src');
      if (newSrc) {
        mainImg.src = newSrc;
      }
    });
  });
}

// 4. Authoritative Variant Data Parser
function initAuthoritativeVariants() {
  const scriptEl = document.getElementById('uo-product-variants-json');
  if (scriptEl) {
    try {
      window.uoState.variants = JSON.parse(scriptEl.textContent);
    } catch (e) {
      console.warn('[ULTRA] Error parsing variant JSON, using fallback:', e);
    }
  }

  // If variants JSON is empty (e.g. unpublished draft product on storefront),
  // do NOT inject hardcoded fallback IDs into production purchasing logic.
  if (!window.uoState.variants) {
    window.uoState.variants = [];
  }

  // Match initial state with real variant data
  syncAuthoritativeVariant();
}

// Helper: Find variant by size and color
function findVariant(size, color) {
  if (!window.uoState.variants || !window.uoState.variants.length) return null;
  return window.uoState.variants.find(function (v) {
    return (v.option1 === size && v.option2 === color) ||
           (v.option1 === color && v.option2 === size) ||
           (v.title && v.title.includes(size) && v.title.includes(color));
  }) || null;
}

// Helper: Sync single variant selection across UI
function syncAuthoritativeVariant() {
  const matched = findVariant(window.uoState.selectedSize, window.uoState.selectedColor);
  const hiddenInput = document.getElementById('uoSelectedVariantId');
  const priceDisplay = document.querySelector('.uo-price-current');
  const atcBtn = document.querySelector('.uo-pdp-atc-btn');

  if (matched) {
    window.uoState.activeVariantId = matched.id;
    if (hiddenInput) hiddenInput.value = matched.id;

    // Update active variant id on selected tier card
    const activeTierCard = document.querySelector('.uo-tier-card.is-selected');
    if (activeTierCard) {
      activeTierCard.setAttribute('data-variant-id', matched.id);
    }

    // Pricing update (if real price > 0 format money; otherwise Pricing to be confirmed)
    if (priceDisplay) {
      const priceCents = Number(matched.price || 0);
      if (priceCents > 0) {
        const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
        priceDisplay.textContent = currency.format(priceCents / 100);
      } else {
        priceDisplay.textContent = 'Pricing to be confirmed';
      }
    }
  }

  // Update labels
  const colorLabel = document.getElementById('uoSelectedColorLabel');
  if (colorLabel) colorLabel.textContent = window.uoState.selectedColor;

  const sizeLabel = document.getElementById('uoSelectedSizeLabel');
  if (sizeLabel) sizeLabel.textContent = window.uoState.selectedSize;

  updateStickyBarSummary();
}

// 5. Authoritative Selectors (Swatches & Size Pills)
function initAuthoritativeSelectors() {
  // Color Swatches
  const swatches = document.querySelectorAll('.uo-color-swatch');
  swatches.forEach(function (swatch) {
    swatch.addEventListener('click', function () {
      swatches.forEach(function (s) {
        s.classList.remove('is-active');
        s.setAttribute('aria-checked', 'false');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-checked', 'true');

      const color = this.getAttribute('data-color-name');
      if (color) {
        window.uoState.selectedColor = color;
        syncAuthoritativeVariant();
      }
    });
  });

  // Size Pills
  const sizePills = document.querySelectorAll('.uo-size-pill');
  sizePills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      sizePills.forEach(function (p) {
        p.classList.remove('is-active');
        p.setAttribute('aria-checked', 'false');
        p.setAttribute('tabindex', '-1');
      });
      this.classList.add('is-active');
      this.setAttribute('aria-checked', 'true');
      this.setAttribute('tabindex', '0');

      const size = this.getAttribute('data-size-value');
      if (size) {
        window.uoState.selectedSize = size;
        syncAuthoritativeVariant();
      }
    });
  });
}

// 6. Tier Bundles Selection (1 Pair, 3 Pairs, 5 Pairs)
function initTierBundles() {
  const tierCards = document.querySelectorAll('.uo-tier-card');
  const qtyMinus = document.querySelector('.uo-qty-minus');
  const qtyPlus = document.querySelector('.uo-qty-plus');
  const qtyVal = document.querySelector('.uo-qty-val');

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

      const tier = this.getAttribute('data-tier') || '3-pairs';
      const packQty = parseInt(this.getAttribute('data-pack-qty') || '3', 10);

      window.uoState.selectedTier = tier;
      window.uoState.packQty = packQty;

      // Re-render mix and match slots according to tier count
      renderMixMatchSlots(packQty);
      syncAuthoritativeVariant();
    });

    card.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Quantity stepper
  if (qtyMinus && qtyPlus && qtyVal) {
    qtyMinus.addEventListener('click', function () {
      if (window.uoState.currentQty > 1) {
        window.uoState.currentQty--;
        qtyVal.textContent = window.uoState.currentQty;
        updateStickyBarSummary();
      }
    });
    qtyPlus.addEventListener('click', function () {
      window.uoState.currentQty++;
      qtyVal.textContent = window.uoState.currentQty;
      updateStickyBarSummary();
    });
  }
}

// 7. REAL MIX-AND-MATCH ARCHITECTURE (Multi-Line Cart Payload)
function initMixAndMatchArchitecture() {
  const toggleBtn = document.getElementById('uoMixMatchToggle');
  const body = document.getElementById('uoMixMatchBody');

  if (toggleBtn && body) {
    toggleBtn.addEventListener('click', function () {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', !isExpanded);
      body.style.display = isExpanded ? 'none' : 'block';
      window.uoState.isMixMatchExpanded = !isExpanded;
      updateStickyBarSummary();
    });
  }

  // Initial render with default pack quantity (3 pairs)
  renderMixMatchSlots(window.uoState.packQty);
}

function renderMixMatchSlots(count) {
  const container = document.getElementById('uoMixMatchSlots');
  if (!container) return;

  const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];
  const colors = ['Plum Noir', 'Blush Rose'];

  window.uoState.mixMatchSlots = [];

  let html = '';
  for (let i = 1; i <= count; i++) {
    const pairSize = window.uoState.selectedSize || 'M';
    const pairColor = window.uoState.selectedColor || 'Plum Noir';
    const variant = findVariant(pairSize, pairColor);

    window.uoState.mixMatchSlots.push({
      pairNum: i,
      size: pairSize,
      color: pairColor,
      variantId: variant ? variant.id : window.uoState.activeVariantId
    });

    html += '<div class="uo-pair-slot" data-slot-index="' + (i - 1) + '">';
    html += '  <span class="uo-slot-label">Pair ' + i + ':</span>';
    html += '  <select class="uo-slot-select uo-slot-size" aria-label="Pair ' + i + ' Size">';
    sizes.forEach(function (s) {
      html += '    <option value="' + s + '"' + (s === pairSize ? ' selected' : '') + '>Size ' + s + '</option>';
    });
    html += '  </select>';
    html += '  <select class="uo-slot-select uo-slot-color" aria-label="Pair ' + i + ' Color">';
    colors.forEach(function (c) {
      html += '    <option value="' + c + '"' + (c === pairColor ? ' selected' : '') + '>' + c + '</option>';
    });
    html += '  </select>';
    html += '</div>';
  }

  container.innerHTML = html;

  // Bind slot change events
  container.querySelectorAll('.uo-pair-slot').forEach(function (slotEl) {
    const slotIdx = parseInt(slotEl.getAttribute('data-slot-index'), 10);
    const sizeSelect = slotEl.querySelector('.uo-slot-size');
    const colorSelect = slotEl.querySelector('.uo-slot-color');

    function updateSlot() {
      const s = sizeSelect.value;
      const c = colorSelect.value;
      const v = findVariant(s, c);
      window.uoState.mixMatchSlots[slotIdx] = {
        pairNum: slotIdx + 1,
        size: s,
        color: c,
        variantId: v ? v.id : window.uoState.activeVariantId
      };
      updateStickyBarSummary();
      computeGroupedCartPayload();
    }

    if (sizeSelect) sizeSelect.addEventListener('change', updateSlot);
    if (colorSelect) colorSelect.addEventListener('change', updateSlot);
  });

  computeGroupedCartPayload();
}

/**
 * PHASE 3: Multi-Line Cart Payload Computation
 * Groups identical variant IDs into quantities and outputs valid Shopify Cart API payload
 */
window.getUoCartPayload = function () {
  return computeGroupedCartPayload();
};

function computeGroupedCartPayload() {
  const slots = window.uoState.mixMatchSlots;
  const tierName = window.uoState.selectedTier === '1-pair' ? '1 Pair' :
                   (window.uoState.selectedTier === '5-pairs' ? '5 Pairs' : '3 Pairs');
  const orderMultiplier = window.uoState.currentQty || 1;

  // Map each pair to its variant ID and group identical variants
  const variantCounts = {};
  slots.forEach(function (slot) {
    const v = findVariant(slot.size, slot.color);
    const vId = v ? v.id : slot.variantId;
    variantCounts[vId] = (variantCounts[vId] || 0) + (1 * orderMultiplier);
  });

  const items = Object.keys(variantCounts)
    .filter(function (vId) { return vId && vId !== 'null' && vId !== 'undefined'; })
    .map(function (vId) {
      return {
        id: parseInt(vId, 10),
        quantity: variantCounts[vId],
        properties: {
          'Pack': tierName,
          'Brand': 'ULTRA OVERNIGHT™',
          'Bundle Type': slots.length > 1 ? 'Mix-and-Match Multi-Pack' : 'Single Pair'
        }
      };
    });

  const payload = { items: items };
  
  // Custom event for external integrations or automated testing
  window.dispatchEvent(new CustomEvent('uo:cart:payload-updated', { detail: payload }));
  return payload;
}

// 8. Sticky Mobile Buy Bar
function initStickyMobileBar() {
  const stickyBar = document.getElementById('uoStickyMobileBar');
  const buyBox = document.getElementById('uoBuyBox');
  if (!stickyBar) return;

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        const scrollY = window.scrollY || window.pageYOffset;
        const buyBoxBottom = buyBox ? (buyBox.getBoundingClientRect().bottom + scrollY) : 600;

        if (scrollY > (buyBoxBottom - 80)) {
          stickyBar.classList.add('is-visible');
          stickyBar.setAttribute('aria-hidden', 'false');
        } else {
          stickyBar.classList.remove('is-visible');
          stickyBar.setAttribute('aria-hidden', 'true');
        }
        ticking = false;
      });
      ticking = true;
    }
  });
}

function updateStickyBarSummary() {
  const summaryEl = document.getElementById('uoStickySummary');
  if (!summaryEl) return;

  const tierName = window.uoState.selectedTier === '1-pair' ? '1 Pair' :
                   (window.uoState.selectedTier === '5-pairs' ? '5 Pairs' : '3 Pairs');

  if (window.uoState.isMixMatchExpanded && window.uoState.mixMatchSlots.length > 1) {
    summaryEl.textContent = tierName + ' · Mix & Match Custom';
  } else {
    summaryEl.textContent = tierName + ' · ' + window.uoState.selectedSize + ' / ' + window.uoState.selectedColor;
  }
}

// 9. Accessible ARIA Product Tabs
function initPdpTabs() {
  const tabBtns = document.querySelectorAll('.uo-tabs-nav [role="tab"]');
  const tabPanels = document.querySelectorAll('.uo-tab-panel');

  if (!tabBtns.length) return;

  tabBtns.forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      const targetId = this.getAttribute('data-tab-target');

      tabBtns.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach(function (p) {
        p.classList.remove('is-active');
      });

      this.classList.add('is-active');
      this.setAttribute('aria-selected', 'true');

      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('is-active');
      }
    });

    btn.addEventListener('keydown', function (e) {
      let targetIndex = -1;
      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % tabBtns.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + tabBtns.length) % tabBtns.length;
      }

      if (targetIndex !== -1) {
        e.preventDefault();
        tabBtns[targetIndex].focus();
        tabBtns[targetIndex].click();
      }
    });
  });
}

// 10. Modal Backdrop & ESC Listener
function initModalListeners() {
  const modal = document.getElementById('uoSizeGuideModal');
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        window.closeUoSizeGuide();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeUoSizeGuide();
    }
  });
}
