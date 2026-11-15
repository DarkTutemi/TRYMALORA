/**
 * ULTRA OVERNIGHT™ — Authoritative Client-Side State, Variant Mapping & Mix-and-Match
 * Single source of truth for variant selection, bundle tiers, multi-line cart payload, and CRO interactions.
 */

// Global State (Authoritative single source of truth; reads exclusively from real Shopify product JSON)
window.uoState = {
  variants: [],
  selectedSize: 'M',
  selectedColor: 'Black',
  activeVariantId: null,
  selectedTier: '3-pairs',
  packQty: 3,
  currentQty: 1,
  isMixMatchExpanded: false,
  mixMatchSlots: [
    { pairNum: 1, size: 'M', color: 'Black', variantId: null },
    { pairNum: 2, size: 'M', color: 'Black', variantId: null },
    { pairNum: 3, size: 'M', color: 'Black', variantId: null }
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

window.openUoCliniciansModal = function () {
  const modal = document.getElementById('uoCliniciansModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
};

window.closeUoCliniciansModal = function () {
  const modal = document.getElementById('uoCliniciansModal');
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

function initAll() {
  initMobileDrawer();
  initFaqAccordions();
  initPdpGallery();
  initAuthoritativeVariants();
  initAuthoritativeSelectors();
  initTierBundles();
  initMixAndMatchArchitecture();
  initStickyMobileBar();
  initPdpTabs();
  initDetailsAccordion();
  initModalListeners();
  initLiveViewersCounter();
  initAddToCart();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

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
  const counterBadge = document.getElementById('uoGalleryCounterBadge');
  const totalCount = thumbBtns.length || 7;

  if (!thumbBtns.length || !mainImg) return;

  thumbBtns.forEach(function (btn, index) {
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
      if (counterBadge) {
        counterBadge.textContent = (index + 1) + ' / ' + totalCount;
      }
      if (typeof this.scrollIntoView === 'function') {
        this.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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

    // Dynamic multi-currency pricing update across PDP & all bundle cards
    updateDynamicBundlePricing(matched);
  }

  // Update labels
  const colorLabel = document.getElementById('uoSelectedColorLabel');
  if (colorLabel) colorLabel.textContent = window.uoState.selectedColor;

  const sizeLabel = document.getElementById('uoSelectedSizeLabel');
  if (sizeLabel) sizeLabel.textContent = window.uoState.selectedSize;

  updateStickyBarSummary();
}

// Universal multi-currency money formatter
function formatMoney(amountCents, currencyCode) {
  currencyCode = currencyCode || window.Shopify?.currency?.active || window.UO_LOCALIZATION?.currencyCode || window.uoCurrency || 'USD';
  
  const zeroDecimalCurrencies = ['VND', 'JPY', 'KRW', 'BIF', 'CLP', 'DJF', 'GNF', 'KMF', 'MGA', 'PYG', 'RWF', 'UGX', 'VUV', 'XAF', 'XOF', 'XPF'];
  const isZeroDecimal = zeroDecimalCurrencies.includes(currencyCode.toUpperCase());
  
  // Shopify AJAX /cart.js and variants JSON ALWAYS output money in 100-based subunits (cents)
  const baseUnits = (Number(amountCents) || 0) / 100;

  // Select appropriate locale
  let locale = 'en-US';
  if (currencyCode === 'VND') locale = 'vi-VN';
  else if (currencyCode === 'EUR') locale = 'de-DE';
  else if (currencyCode === 'GBP') locale = 'en-GB';
  else if (currencyCode === 'AUD') locale = 'en-AU';
  else if (currencyCode === 'CAD') locale = 'en-CA';
  else if (currencyCode === 'JPY') locale = 'ja-JP';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2
    }).format(baseUnits);
  } catch (e) {
    if (isZeroDecimal) {
      return currencyCode === 'VND' ? Math.round(baseUnits).toLocaleString('vi-VN') + ' ₫' : Math.round(baseUnits) + ' ' + currencyCode;
    }
    return currencyCode + ' ' + baseUnits.toFixed(2);
  }
}
window.formatMoney = formatMoney;
window.uoFormatMoney = formatMoney;

// Recalculate dynamic bundle pricing across all cards based on variant price
function updateDynamicBundlePricing(matched) {
  if (!matched) return;
  const currencyCode = window.Shopify?.currency?.active || window.UO_LOCALIZATION?.currencyCode || window.uoCurrency || 'USD';
  const unitPrice = Number(matched.price || 0);
  const compareUnit = Number(matched.compare_at_price || (unitPrice * 2));

  // 1. Update main price row
  const priceDisplay = document.querySelector('.uo-price-current');
  const compareDisplay = document.getElementById('uoPriceCompare');
  const saveBadge = document.getElementById('uoPriceSaveBadge');

  if (priceDisplay && unitPrice > 0) {
    priceDisplay.textContent = formatMoney(unitPrice, currencyCode);
    if (compareDisplay && compareUnit > unitPrice) {
      compareDisplay.textContent = formatMoney(compareUnit, currencyCode);
      compareDisplay.style.display = 'inline';
      if (saveBadge) {
        const savings = Math.round(((compareUnit - unitPrice) / compareUnit) * 100);
        saveBadge.textContent = 'Save ' + savings + '%';
        saveBadge.style.display = 'inline-block';
      }
    } else if (compareDisplay) {
      compareDisplay.style.display = 'none';
      if (saveBadge) saveBadge.style.display = 'none';
    }
  }

  // 2. Update Tier 1 (1 Pair)
  const t1Final = document.querySelector('[data-tier-final="1"]');
  const t1Unit = document.querySelector('[data-tier-unit="1"]');
  if (t1Final) t1Final.textContent = formatMoney(unitPrice, currencyCode);
  if (t1Unit) t1Unit.textContent = '(' + formatMoney(unitPrice, currencyCode) + '/each)';

  // 3. Update Tier 2 (3 Pairs: 10% OFF)
  const t2Orig = document.querySelector('[data-tier-orig="3"]');
  const t2Final = document.querySelector('[data-tier-final="3"]');
  const t2Unit = document.querySelector('[data-tier-unit="3"]');
  const t2Save = document.querySelector('[data-tier-save="3"]');
  const t2TotalOrig = unitPrice * 3;
  const t2TotalFinal = Math.round(t2TotalOrig * 0.9);
  const t2Each = Math.round(unitPrice * 0.9);
  const t2Savings = t2TotalOrig - t2TotalFinal;

  if (t2Orig) t2Orig.textContent = formatMoney(t2TotalOrig, currencyCode);
  if (t2Final) t2Final.textContent = formatMoney(t2TotalFinal, currencyCode);
  if (t2Unit) t2Unit.textContent = '(' + formatMoney(t2Each, currencyCode) + '/each)';
  if (t2Save) t2Save.textContent = 'Save ' + formatMoney(t2Savings, currencyCode);

  // 4. Update Tier 3 (5 Pairs: 20% OFF)
  const t3Orig = document.querySelector('[data-tier-orig="5"]');
  const t3Final = document.querySelector('[data-tier-final="5"]');
  const t3Unit = document.querySelector('[data-tier-unit="5"]');
  const t3Save = document.querySelector('[data-tier-save="5"]');
  const t3TotalOrig = unitPrice * 5;
  const t3TotalFinal = Math.round(t3TotalOrig * 0.8);
  const t3Each = Math.round(unitPrice * 0.8);
  const t3Savings = t3TotalOrig - t3TotalFinal;

  if (t3Orig) t3Orig.textContent = formatMoney(t3TotalOrig, currencyCode);
  if (t3Final) t3Final.textContent = formatMoney(t3TotalFinal, currencyCode);
  if (t3Unit) t3Unit.textContent = '(approx. ' + formatMoney(t3Each, currencyCode) + '/each)';
  if (t3Save) t3Save.textContent = 'Save ' + formatMoney(t3Savings, currencyCode) + ' (1 Pair FREE)';
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
  const colors = ['Black', 'Orange', 'Red', 'Nude'];

  window.uoState.mixMatchSlots = [];

  let html = '';
  for (let i = 1; i <= count; i++) {
    const pairSize = window.uoState.selectedSize || 'M';
    const pairColor = window.uoState.selectedColor || 'Black';
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

  if (window.uoState.isMixMatchExpanded && slots && slots.length > 0) {
    slots.forEach(function (slot) {
      const v = findVariant(slot.size, slot.color);
      const vId = v ? v.id : slot.variantId;
      if (vId) {
        variantCounts[vId] = (variantCounts[vId] || 0) + (1 * orderMultiplier);
      }
    });
  } else {
    // Standard selection: user chose main size and color for the whole pack
    const v = findVariant(window.uoState.selectedSize, window.uoState.selectedColor);
    const vId = v ? v.id : window.uoState.activeVariantId;
    const packQty = window.uoState.packQty || (window.uoState.selectedTier === '1-pair' ? 1 : (window.uoState.selectedTier === '5-pairs' ? 5 : 3));
    if (vId) {
      variantCounts[vId] = (variantCounts[vId] || 0) + (packQty * orderMultiplier);
    }
  }

  const items = Object.keys(variantCounts)
    .filter(function (vId) { return vId && vId !== 'null' && vId !== 'undefined'; })
    .map(function (vId) {
      return {
        id: parseInt(vId, 10),
        quantity: variantCounts[vId],
        properties: {
          'Pack': tierName,
          '_Brand': 'ULTRA OVERNIGHT™',
          '_Bundle Type': window.uoState.isMixMatchExpanded ? 'Mix-and-Match Multi-Pack' : (tierName === '1 Pair' ? 'Single Pair' : 'Curated Multi-Pack')
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

  const currencyCode = window.Shopify?.currency?.active || window.UO_LOCALIZATION?.currencyCode || window.uoCurrency || 'USD';
  const tierName = window.uoState.selectedTier === '1-pair' ? '1 Pair' :
                   (window.uoState.selectedTier === '5-pairs' ? '5 Pairs' : '3 Pairs');

  const matched = findVariant(window.uoState.selectedSize, window.uoState.selectedColor);
  let priceStr = '';
  if (matched && matched.price) {
    const qty = window.uoState.selectedTier === '1-pair' ? 1 : (window.uoState.selectedTier === '5-pairs' ? 5 : 3);
    const discountFactor = qty === 5 ? 0.8 : (qty === 3 ? 0.9 : 1.0);
    const totalPrice = Math.round(matched.price * qty * discountFactor * (window.uoState.currentQty || 1));
    priceStr = ' · ' + formatMoney(totalPrice, currencyCode);
  }

  if (window.uoState.isMixMatchExpanded && window.uoState.mixMatchSlots.length > 1) {
    summaryEl.textContent = tierName + ' · Mix & Match Custom' + priceStr;
  } else {
    summaryEl.textContent = tierName + ' · ' + window.uoState.selectedSize + ' / ' + window.uoState.selectedColor + priceStr;
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
  const sizeModal = document.getElementById('uoSizeGuideModal');
  if (sizeModal) {
    sizeModal.addEventListener('click', function (e) {
      if (e.target === sizeModal) {
        window.closeUoSizeGuide();
      }
    });
  }

  const clinModal = document.getElementById('uoCliniciansModal');
  if (clinModal) {
    clinModal.addEventListener('click', function (e) {
      if (e.target === clinModal) {
        window.closeUoCliniciansModal();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeUoSizeGuide();
      window.closeUoCliniciansModal();
    }
  });
}

// 11. Product Details Accordion
function initDetailsAccordion() {
  const headers = document.querySelectorAll('.uo-accordion-header');
  headers.forEach(function (header) {
    header.addEventListener('click', function () {
      const item = this.closest('.uo-accordion-item');
      if (!item) return;
      const isOpen = item.classList.contains('is-open');
      const content = item.querySelector('.uo-accordion-content');
      const icon = item.querySelector('.uo-accordion-icon');

      if (isOpen) {
        item.classList.remove('is-open');
        this.setAttribute('aria-expanded', 'false');
        if (content) content.style.display = 'none';
        if (icon) icon.textContent = '+';
      } else {
        item.classList.add('is-open');
        this.setAttribute('aria-expanded', 'true');
        if (content) content.style.display = 'block';
        if (icon) icon.textContent = '−';
      }
    });
  });
}

// 12. Dynamic Live Viewers Counter (10 - 30 Viewers)
function initLiveViewersCounter() {
  const countEl = document.getElementById('uoLiveViewerCount');
  if (!countEl) return;
  // Initialize with a random number between 10 and 30
  const randomInit = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
  countEl.textContent = randomInit;

  // Gentle subtle natural fluctuation
  setInterval(function () {
    const current = parseInt(countEl.textContent, 10) || 20;
    const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 2) + 1);
    let next = current + delta;
    if (next < 10) next = 12;
    if (next > 30) next = 28;
    countEl.textContent = next;
  }, 12000);
}

// 13. Production Add to Cart & Ajax Cart Integration
function handleAddToCart(btn) {
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="uo-btn-spinner"></span> Adding...';

  const errorEl = document.querySelector('.uo-pdp-error-msg');
  if (errorEl) errorEl.style.display = 'none';

  const payload = computeGroupedCartPayload();
  if (!payload.items || payload.items.length === 0) {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    if (errorEl) {
      errorEl.textContent = 'Please select a size and color.';
      errorEl.style.display = 'block';
    }
    return;
  }

  fetch('/cart/add.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(function (res) {
      if (!res.ok) {
        return res.json().then(function (err) { throw err; });
      }
      return res.json();
    })
    .then(function (data) {
      btn.innerHTML = '✓ Added to Bag';
      setTimeout(function () {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }, 1500);

      // Refresh and open Willa / Theme Cart Drawer
      if (typeof window.willaRefreshCart === 'function') {
        window.willaRefreshCart();
      }
      if (typeof window.willaOpenCartDrawer === 'function') {
        window.willaOpenCartDrawer();
      } else if (typeof window.openWillaCart === 'function') {
        window.openWillaCart();
      } else {
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: { cart: data } }));
        const cartDrawer = document.getElementById('willaCartDrawer') || document.querySelector('.cart-drawer');
        if (cartDrawer) {
          cartDrawer.classList.add('active', 'is-active', 'open');
          const overlay = document.getElementById('willaCartOverlay');
          if (overlay) overlay.classList.add('active', 'is-active');
        } else {
          window.location.href = '/cart';
        }
      }
    })
    .catch(function (err) {
      console.error('Error adding to bag:', err);
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      if (errorEl) {
        errorEl.textContent = (err && err.description) ? err.description : 'Could not add to bag. Please try again.';
        errorEl.style.display = 'block';
      }
    });
}

window.handleAddToCart = handleAddToCart;

function initAddToCart() {
  const atcBtn = document.querySelector('.uo-pdp-atc-btn');
  if (atcBtn) {
    atcBtn.addEventListener('click', function (e) {
      e.preventDefault();
      handleAddToCart(atcBtn);
    });
  }

  const stickyBtn = document.querySelector('.uo-sticky-btn');
  if (stickyBtn) {
    stickyBtn.addEventListener('click', function (e) {
      e.preventDefault();
      // On mobile sticky button, scroll to buybox or directly add to cart
      handleAddToCart(stickyBtn);
    });
  }
}
