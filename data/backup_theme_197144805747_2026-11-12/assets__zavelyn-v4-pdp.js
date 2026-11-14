/**
 * ZAVELYN IMMERSIVE COMMERCE THEME V4.0
 * DYNAMIC PDP BUNDLE ENGINE & CRO INTERACTION (INSPIRED BY SHOPSIDEK T01)
 */

(function() {
  'use strict';

  function initPdpEngine() {
    const buyBox = document.getElementById('zvBuyBox');
    if (!buyBox) return;

    // Elements
    const priceActiveEl = document.getElementById('zvPriceActive');
    const priceCompareEl = document.getElementById('zvPriceCompare');
    const priceSavingsEl = document.getElementById('zvPriceSavings');
    const giftUnlockBox = document.getElementById('zvGiftUnlock');
    const giftStatusBadge = document.getElementById('zvGiftStatusBadge');
    const giftTitle = document.getElementById('zvGiftTitle');
    const giftSub = document.getElementById('zvGiftSub');

    const claimBtn = document.getElementById('zvBtnClaim');
    const buyNowBtn = document.getElementById('zvBtnBuyNow');
    const stickyBar = document.getElementById('zvStickyBar');
    const stickyBtn = document.getElementById('zvStickyBtn');
    const stickyPrice = document.getElementById('zvStickyPrice');
    const mainImg = document.getElementById('zvMainImg');

    const bundleCards = buyBox.querySelectorAll('.zv-bundle-card');
    const thumbBtns = buyBox.querySelectorAll('.zv-pdp-thumb');

    let activeVariantId = buyBox.getAttribute('data-initial-variant-id');
    let activeQty = 1;
    let basePriceCents = parseInt(buyBox.getAttribute('data-initial-price'), 10) || 0;
    let baseCompareCents = parseInt(buyBox.getAttribute('data-initial-compare'), 10) || 0;

    const claimBtnLabel = document.getElementById('zvBtnClaimLabel');
    const stickyBtnLabel = document.getElementById('zvStickyBtnLabel');

    let currentPriceCents = basePriceCents;

    function formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function updateCtaLabels(priceCents) {
      currentPriceCents = priceCents;
      const formatted = formatMoney(priceCents);
      const claimLabel = document.getElementById('zvBtnClaimLabel');
      if (claimLabel) {
        claimLabel.textContent = 'ADD TO CART · ' + formatted;
      } else if (claimBtn) {
        claimBtn.innerHTML = '<span class="zv-atc-main" id="zvBtnClaimLabel">ADD TO CART · ' + formatted + '</span><span class="zv-atc-sub">30-DAY MONEY-BACK GUARANTEE</span>';
      }
      const stickyLabel = document.getElementById('zvStickyBtnLabel');
      if (stickyLabel) {
        stickyLabel.textContent = 'ADD TO CART · ' + formatted;
      } else if (stickyBtn) {
        stickyBtn.innerHTML = '<span class="zv-atc-main" id="zvStickyBtnLabel">ADD TO CART · ' + formatted + '</span>';
      }
    }

    // Set initial active variant & CTA prices from selected card
    const initialSelectedCard = buyBox.querySelector('.zv-bundle-card.selected');
    if (initialSelectedCard) {
      const initialVariantId = initialSelectedCard.getAttribute('data-variant-id');
      const initialPrice = parseInt(initialSelectedCard.getAttribute('data-price-cents'), 10);
      const initialCompare = parseInt(initialSelectedCard.getAttribute('data-compare-cents'), 10);
      if (initialVariantId) activeVariantId = initialVariantId;
      if (initialPrice) {
        basePriceCents = initialPrice;
        if (priceActiveEl) priceActiveEl.textContent = formatMoney(initialPrice);
        if (stickyPrice) stickyPrice.textContent = formatMoney(initialPrice);
        updateCtaLabels(initialPrice);
      } else {
        updateCtaLabels(basePriceCents);
      }
      if (initialCompare && priceCompareEl) {
        if (initialCompare > initialPrice) {
          priceCompareEl.textContent = formatMoney(initialCompare);
          priceCompareEl.style.display = 'inline';
          if (priceSavingsEl) {
            const saveDiff = initialCompare - initialPrice;
            const pct = Math.round((saveDiff * 100) / initialCompare);
            priceSavingsEl.textContent = 'SAVE ' + formatMoney(saveDiff) + ' (' + pct + '% OFF)';
            priceSavingsEl.style.display = 'inline';
          }
        }
      }
    } else {
      updateCtaLabels(basePriceCents);
    }

    // 1. Gallery Thumbnail Switching (with Video support)
    const mainVideo = document.getElementById('zvMainVideo');
    thumbBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        thumbBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const isVideo = this.getAttribute('data-is-video') === 'true';
        if (isVideo && mainVideo) {
          if (mainImg) mainImg.style.display = 'none';
          mainVideo.style.display = 'block';
          mainVideo.currentTime = 0;
          mainVideo.muted = true;
          mainVideo.play().catch(() => {});
        } else {
          if (mainVideo) {
            mainVideo.pause();
            mainVideo.style.display = 'none';
          }
          if (mainImg) {
            mainImg.style.display = 'block';
            const src = this.getAttribute('data-src');
            if (src) mainImg.src = src;
          }
        }
      });
    });

    // 1b. Adaptive Variant Selection (Pills & Dropdown)
    const variantPills = buyBox.querySelectorAll('.zv-variant-pill-btn');
    const variantDropdown = document.getElementById('zvVariantDropdown');
    const variantLabel = document.getElementById('zvSelectedVariantLabel');

    function onVariantSelected(variantId, priceCents, compareCents, title, imgSrc) {
      activeVariantId = variantId;
      basePriceCents = priceCents;
      baseCompareCents = compareCents;

      if (variantLabel) variantLabel.textContent = title;
      if (imgSrc && mainImg) mainImg.src = imgSrc;

      // Update prices on all bundle cards
      bundleCards.forEach(card => {
        const tierQty = parseInt(card.getAttribute('data-qty'), 10) || 1;
        card.setAttribute('data-price-cents', basePriceCents * tierQty);
        card.setAttribute('data-compare-cents', baseCompareCents * tierQty);
        const totalEl = card.querySelector('.zv-bundle-card-total');
        if (totalEl) totalEl.textContent = formatMoney(basePriceCents * tierQty);
      });

      // Update active price for currently selected bundle card
      const selectedCard = buyBox.querySelector('.zv-bundle-card.selected');
      if (selectedCard) {
        const tierQty = parseInt(selectedCard.getAttribute('data-qty'), 10) || 1;
        const currentPrice = basePriceCents * tierQty;
        const comparePrice = baseCompareCents * tierQty;

        if (priceActiveEl) priceActiveEl.textContent = formatMoney(currentPrice);
        if (stickyPrice) stickyPrice.textContent = formatMoney(currentPrice);
        updateCtaLabels(currentPrice);

        if (priceCompareEl) {
          if (comparePrice > currentPrice) {
            priceCompareEl.textContent = formatMoney(comparePrice);
            priceCompareEl.style.display = 'inline';
            if (priceSavingsEl) {
              const savePct = Math.round((comparePrice - currentPrice) * 100 / comparePrice);
              priceSavingsEl.textContent = 'SAVE ' + savePct + '%';
              priceSavingsEl.style.display = 'inline';
            }
          } else {
            priceCompareEl.style.display = 'none';
            if (priceSavingsEl) priceSavingsEl.style.display = 'none';
          }
        }
      }
    }

    variantPills.forEach(pill => {
      pill.addEventListener('click', function() {
        variantPills.forEach(p => {
          p.classList.remove('active');
          p.style.background = '#FFFFFF';
          p.style.color = 'var(--zv-heading)';
          p.style.borderColor = 'var(--zv-border)';
        });
        this.classList.add('active');
        this.style.background = 'var(--zv-primary)';
        this.style.color = '#FFFFFF';
        this.style.borderColor = 'var(--zv-primary)';

        const vId = this.getAttribute('data-variant-id');
        const vPrice = parseInt(this.getAttribute('data-variant-price'), 10);
        const vCompare = parseInt(this.getAttribute('data-variant-compare'), 10);
        const vTitle = this.getAttribute('data-variant-title');
        const vImg = this.getAttribute('data-variant-img');

        onVariantSelected(vId, vPrice, vCompare, vTitle, vImg);
      });
    });

    if (variantDropdown) {
      variantDropdown.addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        if (!opt) return;
        const vId = opt.value;
        const vPrice = parseInt(opt.getAttribute('data-variant-price'), 10);
        const vCompare = parseInt(opt.getAttribute('data-variant-compare'), 10);
        const vTitle = opt.getAttribute('data-variant-title');
        const vImg = opt.getAttribute('data-variant-img');

        onVariantSelected(vId, vPrice, vCompare, vTitle, vImg);
      });
    }

    // 2. Bundle Card Click Handler
    bundleCards.forEach(card => {
      card.addEventListener('click', function() {
        bundleCards.forEach(c => c.classList.remove('selected'));
        this.classList.add('selected');

        const tierQty = parseInt(this.getAttribute('data-qty'), 10) || 1;
        const tierLevel = parseInt(this.getAttribute('data-tier-level') || this.getAttribute('data-qty'), 10) || 1;
        const mappedVariantId = this.getAttribute('data-variant-id');
        const cardPriceCents = parseInt(this.getAttribute('data-price-cents'), 10);
        const cardCompareCents = parseInt(this.getAttribute('data-compare-cents'), 10);

        if (mappedVariantId) {
          activeVariantId = mappedVariantId;
          activeQty = 1;
        } else {
          activeQty = tierQty;
        }

        // Calculate and render price
        let currentPrice = cardPriceCents || (basePriceCents * activeQty);
        let comparePrice = cardCompareCents || (baseCompareCents * activeQty);

        if (priceActiveEl) priceActiveEl.textContent = formatMoney(currentPrice);
        if (stickyPrice) stickyPrice.textContent = formatMoney(currentPrice);
        updateCtaLabels(currentPrice);

        if (priceCompareEl) {
          if (comparePrice > currentPrice) {
            priceCompareEl.textContent = formatMoney(comparePrice);
            priceCompareEl.style.display = 'inline';
            if (priceSavingsEl) {
              const saveDiff = comparePrice - currentPrice;
              const pct = Math.round((saveDiff * 100) / comparePrice);
              priceSavingsEl.textContent = 'SAVE ' + formatMoney(saveDiff) + ' (' + pct + '% OFF)';
              priceSavingsEl.style.display = 'inline';
            }
          } else {
            priceCompareEl.style.display = 'none';
            if (priceSavingsEl) priceSavingsEl.style.display = 'none';
          }
        }

        // Update Shipping Perks Progression Bar
        updateGiftProgression(tierLevel);
      });
    });

    // 2b. TILE REFINISHING MIX & MATCH BUNDLE V2 CONTROLLER
    const tileBundleCards = buyBox.querySelectorAll('.zv-tile-bundle-card');
    const mixCustomizeSection = document.getElementById('zvMixCustomizeSection');

    let isTileMixMatch = false;
    let getTileMixMatchPayload = null;

    if (tileBundleCards.length > 0 && mixCustomizeSection) {
      isTileMixMatch = true;

      // Base sizes and prices
      const sizePrices = {
        '100g': 16.99,
        '300g': 29.99,
        '500g': 39.99
      };

      // State of the 3 boxes: preserves user selections independently
      const boxesState = [
        { color: 'Pure White', size: '100g' },
        { color: 'Modern Gray', size: '100g' },
        { color: 'Matte Black', size: '100g' }
      ];

      let selectedTier = 1; // 1 = Buy 1, 2 = Buy 2, 3 = Buy 3

      // DOM elements for each box
      const boxRows = [
        document.getElementById('zvMixBox1'),
        document.getElementById('zvMixBox2'),
        document.getElementById('zvMixBox3')
      ];

      const boxDetails = [
        document.getElementById('zvBox1Detail'),
        document.getElementById('zvBox2Detail'),
        document.getElementById('zvBox3Detail')
      ];

      const colorSelects = [
        document.getElementById('zvBox1Color'),
        document.getElementById('zvBox2Color'),
        document.getElementById('zvBox3Color')
      ];

      const sizeSelects = [
        document.getElementById('zvBox1Size'),
        document.getElementById('zvBox2Size'),
        document.getElementById('zvBox3Size')
      ];

      const shippingBadge = document.getElementById('zvBundleShippingBadge');
      const shippingText = document.getElementById('zvBundleShippingText');

      let variantMatrix = {};
      const matrixEl = document.getElementById('zvTileVariantMatrix');
      if (matrixEl) {
        try {
          variantMatrix = JSON.parse(matrixEl.textContent);
        } catch(e) {}
      }

      function calculateBoxBasePrice(box) {
        return sizePrices[box.size] || 16.99;
      }

      function updateMixMatchState() {
        // 1. Show/hide boxes according to selectedTier
        boxRows.forEach((row, idx) => {
          if (!row) return;
          if (idx < selectedTier) {
            row.style.display = 'block';
            row.classList.add('active');
          } else {
            row.style.display = 'none';
            row.classList.remove('active');
          }
        });

        // 2. Update box detail summaries
        for (let i = 0; i < 3; i++) {
          if (boxDetails[i]) {
            const b = boxesState[i];
            const p = calculateBoxBasePrice(b);
            boxDetails[i].textContent = b.color + ' · ' + b.size + ' ($' + p.toFixed(2) + ')';
          }
        }

        // 3. Calculate subtotal of currently active boxes
        let activeSubtotal = 0;
        for (let i = 0; i < selectedTier; i++) {
          activeSubtotal += calculateBoxBasePrice(boxesState[i]);
        }
        activeSubtotal = Math.round(activeSubtotal * 100) / 100;

        // 4. Calculate discount for active tier:
        // Buy 1: 0% discount
        // Buy 2: 5% discount
        // Buy 3: 15% discount
        let discountPct = 0;
        if (selectedTier === 2) discountPct = 5;
        else if (selectedTier === 3) discountPct = 15;

        const discountAmount = Math.round(activeSubtotal * (discountPct / 100) * 100) / 100;
        const activeFinalTotal = Math.round((activeSubtotal - discountAmount) * 100) / 100;
        const activeCents = Math.round(activeFinalTotal * 100);

        // 5. Update Hero Price, Compare Price, Savings
        if (priceActiveEl) priceActiveEl.textContent = '$' + activeFinalTotal.toFixed(2);
        if (stickyPrice) stickyPrice.textContent = '$' + activeFinalTotal.toFixed(2);

        if (priceCompareEl) {
          if (discountAmount > 0) {
            priceCompareEl.textContent = '$' + activeSubtotal.toFixed(2);
            priceCompareEl.style.display = 'inline';
            if (priceSavingsEl) {
              priceSavingsEl.textContent = 'SAVE $' + discountAmount.toFixed(2) + ' (' + discountPct + '% OFF)';
              priceSavingsEl.style.display = 'inline';
            }
          } else {
            priceCompareEl.style.display = 'none';
            if (priceSavingsEl) priceSavingsEl.style.display = 'none';
          }
        }

        // 6. Update CTA Button & Sticky Button
        updateCtaLabels(activeCents);
        const claimSub = claimBtn ? claimBtn.querySelector('.zv-atc-sub') : null;
        if (claimSub) claimSub.textContent = '30-Day Returns on Eligible Items';

        // 7. Update Dynamic Pricing in Bundle Cards
        // Card 1 (Buy 1): Box 1 price
        const b1Price = calculateBoxBasePrice(boxesState[0]);
        const b1Tot = document.getElementById('zvTileB1Total');
        const b1Un = document.getElementById('zvTileB1Unit');
        if (b1Tot) b1Tot.textContent = '$' + b1Price.toFixed(2);
        if (b1Un) b1Un.textContent = '$' + b1Price.toFixed(2) + ' / box';

        // Card 2 (Buy 2): Box 1 + Box 2 with 5% discount
        const b2Sub = b1Price + calculateBoxBasePrice(boxesState[1]);
        const b2Disc = Math.round(b2Sub * 0.05 * 100) / 100;
        const b2Final = Math.round((b2Sub - b2Disc) * 100) / 100;
        const b2Tot = document.getElementById('zvTileB2Total');
        const b2Orig = document.getElementById('zvTileB2Orig');
        const b2Un = document.getElementById('zvTileB2Unit');
        if (b2Tot) b2Tot.textContent = '$' + b2Final.toFixed(2);
        if (b2Orig) b2Orig.textContent = '$' + b2Sub.toFixed(2);
        if (b2Un) b2Un.textContent = '$' + (b2Final / 2).toFixed(2) + ' / box';

        // Card 3 (Buy 3): Box 1 + Box 2 + Box 3 with 15% discount
        const b3Sub = b2Sub + calculateBoxBasePrice(boxesState[2]);
        const b3Disc = Math.round(b3Sub * 0.15 * 100) / 100;
        const b3Final = Math.round((b3Sub - b3Disc) * 100) / 100;
        const b3Tot = document.getElementById('zvTileB3Total');
        const b3Orig = document.getElementById('zvTileB3Orig');
        const b3Un = document.getElementById('zvTileB3Unit');
        if (b3Tot) b3Tot.textContent = '$' + b3Final.toFixed(2);
        if (b3Orig) b3Orig.textContent = '$' + b3Sub.toFixed(2);
        if (b3Un) b3Un.textContent = '$' + (b3Final / 3).toFixed(2) + ' / box';

        // 8. Update Summary Bar inside Customize section
        const comboSummaryEl = document.getElementById('zvMixSelectedCombo');
        const subtotalSummaryEl = document.getElementById('zvMixSubtotal');
        const discountPillEl = document.getElementById('zvMixDiscountPill');

        if (comboSummaryEl) {
          if (selectedTier === 1) {
            comboSummaryEl.textContent = '1 Box: ' + boxesState[0].color + ' / ' + boxesState[0].size;
          } else if (selectedTier === 2) {
            comboSummaryEl.textContent = '2 Boxes: ' + boxesState[0].size + ' + ' + boxesState[1].size;
          } else {
            comboSummaryEl.textContent = '3 Boxes: ' + boxesState[0].size + ' + ' + boxesState[1].size + ' + ' + boxesState[2].size;
          }
        }

        if (subtotalSummaryEl) {
          subtotalSummaryEl.textContent = '$' + activeFinalTotal.toFixed(2);
        }

        if (discountPillEl) {
          if (discountPct > 0) {
            discountPillEl.textContent = 'EXTRA ' + discountPct + '% OFF';
            discountPillEl.style.display = 'inline-block';
          } else {
            discountPillEl.style.display = 'none';
          }
        }

        // 9. Free Shipping Rule: threshold $70 on Final Total AFTER discount
        const isFreeShipping = activeFinalTotal >= 70.0;
        if (shippingBadge) {
          if (isFreeShipping) {
            shippingBadge.className = 'zv-bundle-shipping-badge unlocked';
            if (shippingText) shippingText.textContent = 'Free Shipping Unlocked ($70+)';
          } else {
            shippingBadge.className = 'zv-bundle-shipping-badge locked';
            if (shippingText) shippingText.textContent = 'Free Shipping for Orders Over $70';
          }
        }

        if (giftUnlockBox) {
          const iconEl = document.getElementById('zvGiftIcon');
          if (isFreeShipping) {
            giftUnlockBox.classList.add('unlocked');
            if (giftStatusBadge) giftStatusBadge.textContent = 'UNLOCKED';
            if (iconEl) iconEl.textContent = '🚚';
            if (giftTitle) giftTitle.textContent = 'FREE Tracked US Shipping Unlocked';
            if (giftSub) giftSub.textContent = 'Your order qualifies for fast free shipping from US hubs!';
          } else {
            giftUnlockBox.classList.remove('unlocked');
            if (giftStatusBadge) giftStatusBadge.textContent = 'STANDARD';
            if (iconEl) iconEl.textContent = '📦';
            if (giftTitle) giftTitle.textContent = 'Standard US Shipping ($4.95)';
            const diff = (70 - activeFinalTotal).toFixed(2);
            if (giftSub) giftSub.textContent = 'Add $' + diff + ' more to unlock FREE tracked delivery';
          }
        }
      }

      // Dropdown change listeners for all 3 boxes
      for (let i = 0; i < 3; i++) {
        const cSel = colorSelects[i];
        const sSel = sizeSelects[i];
        if (cSel) {
          cSel.addEventListener('change', function() {
            boxesState[i].color = this.value;
            updateMixMatchState();
          });
        }
        if (sSel) {
          sSel.addEventListener('change', function() {
            boxesState[i].size = this.value;
            updateMixMatchState();
          });
        }
      }

      // Bundle Card Click Listeners
      tileBundleCards.forEach(card => {
        card.addEventListener('click', function() {
          tileBundleCards.forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          selectedTier = parseInt(this.getAttribute('data-bundle-tier'), 10) || 1;
          updateMixMatchState();
        });
      });

      // Function to build multi-item cart payload
      getTileMixMatchPayload = function() {
        const variantMap = new Map();
        for (let i = 0; i < selectedTier; i++) {
          const box = boxesState[i];
          const combo1 = box.color + ' / ' + box.size;
          const combo2 = box.color + ' (with Brush)';
          const matched = variantMatrix[combo1] || variantMatrix[combo2];

          if (!matched || !matched.id) {
            throw new Error('Variant not available for ' + box.color + ' / ' + box.size + '. Please choose another combination.');
          }

          if (matched.available === false) {
            throw new Error(box.color + ' / ' + box.size + ' is currently out of stock. Please select another option.');
          }

          const vId = String(matched.id).replace('gid://shopify/ProductVariant/', '');
          if (!variantMap.has(vId)) {
            variantMap.set(vId, {
              id: vId,
              quantity: 0,
              boxNumbers: [],
              title: combo1
            });
          }
          const item = variantMap.get(vId);
          item.quantity += 1;
          item.boxNumbers.push('Box ' + (i + 1));
        }

        const discountCode = selectedTier === 2 ? 'TILE5' : (selectedTier === 3 ? 'TILE15' : '');
        const tierName = selectedTier === 1 
          ? 'Single Box' 
          : (selectedTier === 2 ? 'Duo Pack (Extra 5% OFF)' : 'Complete Set (Extra 15% OFF)');

        const items = [];
        variantMap.forEach(entry => {
          items.push({
            id: entry.id,
            quantity: entry.quantity,
            properties: {
              '_bundle': tierName,
              '_box': entry.boxNumbers.join(', ') + ': ' + entry.title
            }
          });
        });

        return { items, discountCode };
      };

      // Initial run
      updateMixMatchState();
    }

    // 2c. METALLIC SILVER BUNDLE CONTROLLER (BUY 5 GET 3 FREE, BUY 3 GET 1 FREE, 1 CAN)
    const silverBundleCards = buyBox.querySelectorAll('.zv-silver-bundle-card');
    let isSilverBundle = false;
    let getSilverBundlePayload = null;

    if (silverBundleCards.length > 0) {
      isSilverBundle = true;

      function updateSilverShippingBadge(priceCents) {
        const shippingBadge = document.getElementById('zvBundleShippingBadge');
        const shippingText = document.getElementById('zvBundleShippingText');
        if (!shippingBadge || !shippingText) return;

        if (priceCents >= 7000) {
          shippingBadge.classList.remove('locked');
          shippingBadge.classList.add('unlocked');
          shippingText.textContent = '🎉 Free Shipping Unlocked! (' + formatMoney(priceCents) + ' > $70)';
        } else {
          shippingBadge.classList.remove('unlocked');
          shippingBadge.classList.add('locked');
          const remaining = ((7000 - priceCents) / 100).toFixed(2);
          shippingText.textContent = 'Add $' + remaining + ' to unlock Free Shipping';
        }
      }

      silverBundleCards.forEach(card => {
        card.addEventListener('click', function(e) {
          e.stopPropagation();
          silverBundleCards.forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');

          const priceCents = parseInt(this.getAttribute('data-price-cents'), 10) || 1999;
          const vId = this.getAttribute('data-variant-id');
          if (vId) activeVariantId = vId;

          // Update active price display and CTA labels
          if (priceActiveEl) priceActiveEl.textContent = formatMoney(priceCents);
          if (stickyPrice) stickyPrice.textContent = formatMoney(priceCents);
          updateCtaLabels(priceCents);

          // Hide compare and savings for Silver Coating (clean pricing, no fake compare/discount %)
          if (priceCompareEl) priceCompareEl.style.display = 'none';
          if (priceSavingsEl) priceSavingsEl.style.display = 'none';

          // Update Free Shipping badge dynamically based on order subtotal > $70
          updateSilverShippingBadge(priceCents);
        });
      });

      getSilverBundlePayload = function() {
        const selectedCard = buyBox.querySelector('.zv-silver-bundle-card.selected');
        if (!selectedCard) {
          throw new Error('Please select a package option.');
        }

        const bundleType = selectedCard.getAttribute('data-bundle-type');
        const vId = selectedCard.getAttribute('data-variant-id');
        const receiveQty = parseInt(selectedCard.getAttribute('data-receive-qty'), 10) || 1;
        const paidQty = parseInt(selectedCard.getAttribute('data-paid-qty'), 10) || 1;

        let bundleName = '';
        let packageProperty = '';

        if (bundleType === 'buy5get3') {
          bundleName = 'Buy 5 Get 3 FREE';
          packageProperty = 'Buy 5 Get 3 FREE (8 Cans Total · Pay for 5)';
        } else if (bundleType === 'buy3get1') {
          bundleName = 'Buy 3 Get 1 FREE';
          packageProperty = 'Buy 3 Get 1 FREE (4 Cans Total · Pay for 3)';
        } else {
          bundleName = '1 Can (50g Starter Kit)';
          packageProperty = '1 Can (50g Starter Kit)';
        }

        const properties = {
          '_bundle': bundleName,
          'Package': packageProperty,
          'Total Delivered': receiveQty === 1 ? '1 Can (50g)' : `${receiveQty} Cans (50g each)`,
          '_paid_qty': String(paidQty),
          '_receive_qty': String(receiveQty)
        };
        if (receiveQty > paidQty) {
          properties['_free_qty'] = String(receiveQty - paidQty);
          properties['Gift'] = `${receiveQty - paidQty} FREE Cans`;
        }

        const items = [{
          id: vId,
          quantity: 1,
          properties: properties
        }];

        return { items, discountCode: '' };
      };

      // Set initial state on load
      const initSelected = buyBox.querySelector('.zv-silver-bundle-card.selected');
      if (initSelected) {
        const initPrice = parseInt(initSelected.getAttribute('data-price-cents'), 10) || 9995;
        const initVId = initSelected.getAttribute('data-variant-id');
        if (initVId) activeVariantId = initVId;
        if (priceActiveEl) priceActiveEl.textContent = formatMoney(initPrice);
        if (stickyPrice) stickyPrice.textContent = formatMoney(initPrice);
        updateCtaLabels(initPrice);
        if (priceCompareEl) priceCompareEl.style.display = 'none';
        if (priceSavingsEl) priceSavingsEl.style.display = 'none';
        updateSilverShippingBadge(initPrice);
      }
    }

    // 2d. EAR CLEANER BUNDLE & SUBSCRIPTION & UPSELL CONTROLLER
    const earBundleCards = buyBox.querySelectorAll('.zv-ear-bundle-card');
    let isEarBundle = false;
    let getEarBundlePayload = null;

    if (earBundleCards.length > 0) {
      isEarBundle = true;

      const subOptions = buyBox.querySelectorAll('.zv-sub-option');
      const upsellCheck = document.getElementById('zvEarUpsellCheck');
      const shippingBadge = document.getElementById('zvBundleShippingBadge');
      const shippingText = document.getElementById('zvBundleShippingText');

      // Exact pricing table:
      // Tier 1 (Buy 1): One-time $34.99, Sub -10% $31.49, Compare $69.99 (1 x 100ml)
      // Tier 2 (Buy 2 Get 2 FREE): One-time $62.98, Sub -10% $56.68, Compare $139.96 (4 x 100ml)
      // Tier 3 (Buy 4 Get 4 FREE): One-time $111.97, Sub -10% $100.77, Compare $279.92 (8 x 100ml)
      const EAR_BUNDLE_TIERS = {
        '1': { onetime: 3499, sub: 3149, compare: 6999, bottles: 1 },
        '2': { onetime: 6298, sub: 5668, compare: 13996, bottles: 4 },
        '3': { onetime: 11197, sub: 10077, compare: 27992, bottles: 8 }
      };

      function updateCardPricing(isSub) {
        earBundleCards.forEach(card => {
          const tier = card.getAttribute('data-bundle-tier') || '1';
          const tierData = EAR_BUNDLE_TIERS[tier];
          if (!tierData) return;
          const priceCents = isSub ? tierData.sub : tierData.onetime;
          const totalEl = card.querySelector('[data-role="bundle-total"]');
          const unitEl = card.querySelector('[data-role="bundle-unit"]');
          if (totalEl) {
            totalEl.textContent = formatMoney(priceCents);
          }
          if (unitEl) {
            const unitPrice = (priceCents / (tierData.bottles * 100)).toFixed(2);
            unitEl.textContent = `$${unitPrice} / bottle`;
          }
        });
      }

      function calculateEarTotalCents() {
        const subSelected = buyBox.querySelector('.zv-sub-option.selected');
        const isSubscription = subSelected && subSelected.getAttribute('data-sub-type') === 'subscription';

        const selectedCard = buyBox.querySelector('.zv-ear-bundle-card.selected');
        const tier = selectedCard ? (selectedCard.getAttribute('data-bundle-tier') || '2') : '2';
        const tierData = EAR_BUNDLE_TIERS[tier] || EAR_BUNDLE_TIERS['2'];

        const bundlePriceCents = isSubscription ? tierData.sub : tierData.onetime;
        const bundleCompareCents = tierData.compare;

        let upsellCents = 0;
        let upsellCompareCents = 0;
        if (upsellCheck && upsellCheck.checked) {
          upsellCents = parseInt(upsellCheck.getAttribute('data-price-cents'), 10) || 1499;
          upsellCompareCents = 2499;
        }

        return {
          isSubscription,
          bundlePriceCents,
          bundleCompareCents,
          upsellCents,
          upsellCompareCents,
          totalCents: bundlePriceCents + upsellCents,
          totalCompareCents: bundleCompareCents + upsellCompareCents
        };
      }

      function updateEarUI() {
        const { isSubscription, bundlePriceCents, bundleCompareCents, upsellCents, upsellCompareCents, totalCents, totalCompareCents } = calculateEarTotalCents();

        // Update all cards pricing labels dynamically
        updateCardPricing(isSubscription);

        const selectedCard = buyBox.querySelector('.zv-ear-bundle-card.selected');
        if (selectedCard) {
          const vId = selectedCard.getAttribute('data-variant-id');
          if (vId) activeVariantId = vId;
        }

        // Active price display
        if (priceActiveEl) priceActiveEl.textContent = formatMoney(totalCents);
        if (stickyPrice) stickyPrice.textContent = formatMoney(totalCents);
        updateCtaLabels(totalCents);

        // Compare price & Savings
        if (priceCompareEl && priceSavingsEl) {
          if (totalCompareCents > totalCents) {
            priceCompareEl.textContent = formatMoney(totalCompareCents);
            priceCompareEl.style.display = 'inline';
            const diff = totalCompareCents - totalCents;
            const pct = Math.round((diff * 100) / totalCompareCents);
            priceSavingsEl.textContent = 'SAVE ' + formatMoney(diff) + ' (' + pct + '% OFF)';
            priceSavingsEl.style.display = 'inline';
          } else {
            priceCompareEl.style.display = 'none';
            priceSavingsEl.style.display = 'none';
          }
        }

        // Free Shipping threshold $70
        if (shippingBadge && shippingText) {
          if (totalCents >= 7000) {
            shippingBadge.className = 'zv-bundle-shipping-badge unlocked';
            shippingText.textContent = '🎉 Free Shipping Unlocked! (' + formatMoney(totalCents) + ' > $70)';
          } else {
            shippingBadge.className = 'zv-bundle-shipping-badge locked';
            const remaining = ((7000 - totalCents) / 100).toFixed(2);
            shippingText.textContent = 'Add $' + remaining + ' to unlock Free Shipping';
          }
        }
      }

      // Card clicks
      earBundleCards.forEach(card => {
        card.addEventListener('click', function(e) {
          e.stopPropagation();
          earBundleCards.forEach(c => c.classList.remove('selected'));
          this.classList.add('selected');
          updateEarUI();
        });
      });

      // Subscription options
      subOptions.forEach(opt => {
        opt.addEventListener('click', function(e) {
          e.stopPropagation();
          subOptions.forEach(o => o.classList.remove('selected'));
          this.classList.add('selected');
          updateEarUI();
        });
      });

      // Upsell checkbox toggle
      if (upsellCheck) {
        upsellCheck.addEventListener('change', function() {
          updateEarUI();
        });
      }

      getEarBundlePayload = function() {
        const selectedCard = buyBox.querySelector('.zv-ear-bundle-card.selected');
        if (!selectedCard) {
          throw new Error('Please select a package tier.');
        }

        const vId = selectedCard.getAttribute('data-variant-id');
        const bundleName = selectedCard.getAttribute('data-bundle-name') || 'Ear Cleaner Bundle';
        const paidQty = parseInt(selectedCard.getAttribute('data-paid-qty'), 10) || 1;
        const receiveQty = parseInt(selectedCard.getAttribute('data-receive-qty'), 10) || 1;
        const bottles = parseInt(selectedCard.getAttribute('data-bottles'), 10) || 1;

        const subSelected = buyBox.querySelector('.zv-sub-option.selected');
        const isSubscription = subSelected && subSelected.getAttribute('data-sub-type') === 'subscription';
        const sellingPlanId = isSubscription ? subSelected.getAttribute('data-selling-plan-id') : null;

        const earProps = {
          '_bundle': bundleName,
          'Package': `${bundleName} (${receiveQty} × 100ml Bottles)`,
          'Bottles Delivered': `${receiveQty} × 100ml Bottles`,
          '_paid_qty': String(paidQty),
          '_receive_qty': String(receiveQty)
        };

        if (receiveQty > paidQty) {
          earProps['Gift'] = `${receiveQty - paidQty} FREE 100ml Bottles`;
        }

        if (isSubscription) {
          earProps['Subscription'] = 'Auto-Renews Every 30 Days (Extra 10% OFF)';
        }

        const earItem = {
          id: vId,
          quantity: 1,
          properties: earProps
        };

        if (sellingPlanId) {
          earItem.selling_plan = parseInt(sellingPlanId, 10);
        }

        const items = [earItem];

        if (upsellCheck && upsellCheck.checked) {
          const wipesVId = upsellCheck.getAttribute('data-variant-id');
          items.push({
            id: wipesVId,
            quantity: 1,
            properties: {
              '_upsell': 'Pet Ear Finger Wipes (60 Wipes)'
            }
          });
        }

        return { items, discountCode: '' };
      };

      // Initial run
      updateEarUI();
    }

    // 2e. STEAM THERAPY WAND BUNDLE & UPSELL CONTROLLER
    const eyeBundleCards = buyBox.querySelectorAll('.zv-eye-bundle-card');
    let isEyeBundle = false;
    let getEyeBundlePayload = null;

    if (eyeBundleCards.length > 0) {
      isEyeBundle = true;

      const upsellCheck = document.getElementById('zvEyeUpsellCheck');
      const shippingBadge = document.getElementById('zvBundleShippingBadge');
      const shippingText = document.getElementById('zvBundleShippingText');

      const EYE_BUNDLE_TIERS = {
        '1': { price: 3999, compare: 8500, wands: 1, name: 'Buy 1 — Single Starter Kit' },
        '2': { price: 6998, compare: 17000, wands: 2, name: 'Buy 2 Wands (Couple Care Pack · Save Extra $10)' },
        '3': { price: 9497, compare: 25500, wands: 3, name: 'Buy 3 Wands (Family Set · Free Shipping · Save Extra $25)' }
      };

      function calculateEyeTotalCents() {
        const selectedCard = buyBox.querySelector('.zv-eye-bundle-card.selected') || eyeBundleCards[0];
        const tier = selectedCard ? (selectedCard.getAttribute('data-bundle-tier') || '1') : '1';
        const tierData = EYE_BUNDLE_TIERS[tier] || EYE_BUNDLE_TIERS['1'];

        const bundlePriceCents = tierData.price;
        const bundleCompareCents = tierData.compare;

        let upsellCents = 0;
        let upsellCompareCents = 0;
        if (upsellCheck && upsellCheck.checked) {
          upsellCents = parseInt(upsellCheck.getAttribute('data-price-cents') || '2999', 10);
          upsellCompareCents = 5999;
        }

        const totalPriceCents = bundlePriceCents + upsellCents;
        const totalCompareCents = bundleCompareCents + upsellCompareCents;

        return {
          bundlePriceCents,
          bundleCompareCents,
          upsellCents,
          upsellCompareCents,
          totalPriceCents,
          totalCompareCents,
          tier
        };
      }

      function updateEyeUI() {
        const { bundlePriceCents, bundleCompareCents, upsellCents, totalPriceCents, totalCompareCents, tier } = calculateEyeTotalCents();

        const claimPriceEl = document.getElementById('zvClaimPrice');
        const claimCompareEl = document.getElementById('zvClaimCompare');
        const claimSaveEl = document.getElementById('zvClaimSave');

        if (claimPriceEl) claimPriceEl.textContent = formatMoney(bundlePriceCents);
        if (claimCompareEl) claimCompareEl.textContent = formatMoney(bundleCompareCents);
        if (claimSaveEl && bundleCompareCents > bundlePriceCents) {
          claimSaveEl.textContent = `SAVE ${formatMoney(bundleCompareCents - bundlePriceCents)}`;
        }

        updateCtaLabels(totalPriceCents);
        if (stickyPrice) {
          stickyPrice.textContent = formatMoney(totalPriceCents);
        }

        // Free shipping if total >= $70
        if (shippingBadge && shippingText) {
          if (totalPriceCents >= 7000 || tier === '3') {
            shippingBadge.textContent = 'FREE SHIPPING';
            shippingBadge.style.background = '#dcfce7';
            shippingBadge.style.color = '#15803d';
            shippingText.textContent = 'Fast Tracked US Delivery · 100% Free Shipping Unlocked';
          } else {
            const needed = 7000 - totalPriceCents;
            shippingBadge.textContent = 'FAST DISPATCH';
            shippingBadge.style.background = '#fef3c7';
            shippingBadge.style.color = '#b45309';
            shippingText.textContent = `Add ${(needed / 100).toFixed(2)} more for FREE Tracked Shipping`;
          }
        }
      }

      // Card selection
      eyeBundleCards.forEach(card => {
        card.addEventListener('click', () => {
          eyeBundleCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          updateEyeUI();
        });
      });

      // Upsell toggle
      if (upsellCheck) {
        ['change', 'click', 'input'].forEach(evt => {
          upsellCheck.addEventListener(evt, () => {
            updateEyeUI();
          });
        });
      }

      getEyeBundlePayload = function() {
        const selectedCard = buyBox.querySelector('.zv-eye-bundle-card.selected') || eyeBundleCards[0];
        const tier = selectedCard.getAttribute('data-bundle-tier') || '1';
        const variantId = selectedCard.getAttribute('data-variant-id');
        const bundleName = selectedCard.getAttribute('data-bundle-name') || 'Steam Wand Bundle';

        if (!variantId) {
          throw new Error('Please select a package option.');
        }

        const eyeProps = {
          'Bundle': bundleName,
          'Package': bundleName
        };

        const eyeItem = {
          id: parseInt(variantId, 10),
          quantity: 1,
          properties: eyeProps
        };

        const items = [eyeItem];

        if (upsellCheck && upsellCheck.checked) {
          const upsellVariantId = upsellCheck.getAttribute('data-variant-id') || '67346609799539';
          items.push({
            id: parseInt(upsellVariantId, 10),
            quantity: 1,
            properties: {
              '_upsell': 'Trymalora™ LuminaLift Pro Red-Light Eye Rejuvenator & Thermal Vibration Sculptor'
            }
          });
        }

        return { items, discountCode: '' };
      };

      // Initial run
      updateEyeUI();
    }

    // 2f. CHRISTMAS GNOME BUNDLE & UPSELL CONTROLLER
    const gnomeBundleCards = buyBox.querySelectorAll('.zv-gnome-bundle-card');
    let isGnomeBundle = false;
    let getGnomeBundlePayload = null;

    if (gnomeBundleCards.length > 0) {
      isGnomeBundle = true;

      const upsellCheck = document.getElementById('zvGnomeUpsellCheck');
      const shippingBadge = document.getElementById('zvBundleShippingBadge');
      const shippingText = document.getElementById('zvBundleShippingText');

      const GNOME_BUNDLE_TIERS = {
        '1': { price: 6999, compare: 13998, qty: 1, name: 'Buy 1 — Single Christmas Gnome' },
        '2': { price: 11998, compare: 27996, qty: 1, name: 'Buy 2 — Woodland Duo Set' },
        '3': { price: 15998, compare: 41994, qty: 1, name: 'Buy 3 — Holiday Family Trio' }
      };

      function calculateGnomeTotalCents() {
        const selectedCard = buyBox.querySelector('.zv-gnome-bundle-card.selected') || gnomeBundleCards[0];
        const tier = selectedCard ? (selectedCard.getAttribute('data-bundle-tier') || '2') : '2';
        const tierData = GNOME_BUNDLE_TIERS[tier] || GNOME_BUNDLE_TIERS['2'];

        const bundlePriceCents = tierData.price;
        const bundleCompareCents = tierData.compare;

        let upsellCents = 0;
        let upsellCompareCents = 0;
        if (upsellCheck && upsellCheck.checked) {
          upsellCents = parseInt(upsellCheck.getAttribute('data-price-cents') || '2599', 10);
          upsellCompareCents = 5200;
        }

        const totalPriceCents = bundlePriceCents + upsellCents;
        const totalCompareCents = bundleCompareCents + upsellCompareCents;

        return {
          bundlePriceCents,
          bundleCompareCents,
          upsellCents,
          upsellCompareCents,
          totalPriceCents,
          totalCompareCents,
          tier
        };
      }

      function updateGnomeUI() {
        const { bundlePriceCents, bundleCompareCents, upsellCents, totalPriceCents, totalCompareCents, tier } = calculateGnomeTotalCents();

        const claimPriceEl = document.getElementById('zvClaimPrice');
        const claimCompareEl = document.getElementById('zvClaimCompare');
        const claimSaveEl = document.getElementById('zvClaimSave');

        if (claimPriceEl) claimPriceEl.textContent = formatMoney(bundlePriceCents);
        if (claimCompareEl) claimCompareEl.textContent = formatMoney(bundleCompareCents);
        if (claimSaveEl && bundleCompareCents > bundlePriceCents) {
          claimSaveEl.textContent = `SAVE ${formatMoney(bundleCompareCents - bundlePriceCents)}`;
        }

        updateCtaLabels(totalPriceCents);
        if (stickyPrice) {
          stickyPrice.textContent = formatMoney(totalPriceCents);
        }

        // Free shipping if total >= $70
        if (shippingBadge && shippingText) {
          if (totalPriceCents >= 7000 || tier === '2' || tier === '3') {
            shippingBadge.textContent = 'FREE SHIPPING';
            shippingBadge.style.background = '#dcfce7';
            shippingBadge.style.color = '#15803d';
            shippingText.textContent = '🎉 Free Shipping Unlocked! ($' + (totalPriceCents / 100).toFixed(2) + ' > $70)';
          } else {
            const needed = 7000 - totalPriceCents;
            shippingBadge.textContent = 'FAST DISPATCH';
            shippingBadge.style.background = '#fef3c7';
            shippingBadge.style.color = '#b45309';
            shippingText.textContent = 'Add $' + (needed / 100).toFixed(2) + ' more for FREE Tracked Shipping';
          }
        }
      }

      // Card selection
      gnomeBundleCards.forEach(card => {
        card.addEventListener('click', () => {
          gnomeBundleCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          updateGnomeUI();
        });
      });

      // Upsell toggle
      if (upsellCheck) {
        ['change', 'click', 'input'].forEach(evt => {
          upsellCheck.addEventListener(evt, () => {
            updateGnomeUI();
          });
        });
      }

      getGnomeBundlePayload = function() {
        const selectedCard = buyBox.querySelector('.zv-gnome-bundle-card.selected') || gnomeBundleCards[0];
        const tier = selectedCard.getAttribute('data-bundle-tier') || '2';
        const variantId = selectedCard.getAttribute('data-variant-id');
        const bundleName = selectedCard.getAttribute('data-bundle-name') || 'Christmas Gnome Bundle';

        if (!variantId) {
          throw new Error('Please select a package option.');
        }

        const gnomeProps = {
          'Bundle': bundleName,
          'Package': bundleName
        };

        const gnomeItem = {
          id: parseInt(variantId, 10),
          quantity: 1,
          properties: gnomeProps
        };

        const items = [gnomeItem];

        if (upsellCheck && upsellCheck.checked) {
          const upsellVariantId = upsellCheck.getAttribute('data-variant-id') || '67361024016755';
          items.push({
            id: parseInt(upsellVariantId, 10),
            quantity: 1,
            properties: {
              '_upsell': 'Artisan Starlight Pearl & Crystal Mosaic Christmas Ornaments (6-Piece Heirloom Set)'
            }
          });
        }

        return { items, discountCode: '' };
      };

      // Upsell Lightbox Modal Controller
      const zoomTrigger = document.getElementById('zvGnomeUpsellZoomTrigger');
      const zoomModal = document.getElementById('zvUpsellModal');
      const modalClose = document.getElementById('zvUpsellModalClose');
      const modalBackdrop = document.getElementById('zvUpsellModalBackdrop');
      const modalDismiss = document.getElementById('zvUpsellModalDismiss');
      const modalAddBtn = document.getElementById('zvUpsellModalAddBtn');

      function syncModalBtnState() {
        if (!modalAddBtn) return;
        if (upsellCheck && upsellCheck.checked) {
          modalAddBtn.innerHTML = '<span>✓ Added to Order ($25.99)</span>';
          modalAddBtn.style.background = '#2E7D32';
        } else {
          modalAddBtn.innerHTML = '<span>Add to Order &middot; +$25.99</span>';
          modalAddBtn.style.background = '';
        }
      }

      function openUpsellModal(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (zoomModal) {
          syncModalBtnState();
          zoomModal.classList.add('is-open');
          zoomModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      }

      function closeUpsellModal(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (zoomModal) {
          zoomModal.classList.remove('is-open');
          zoomModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      }

      if (zoomTrigger) {
        zoomTrigger.addEventListener('click', openUpsellModal);
        zoomTrigger.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openUpsellModal(e);
          }
        });
      }

      const viewLink = buyBox.querySelector('.zv-upsell-view-link');
      if (viewLink) {
        viewLink.addEventListener('click', openUpsellModal);
      }

      if (modalClose) modalClose.addEventListener('click', closeUpsellModal);
      if (modalBackdrop) modalBackdrop.addEventListener('click', closeUpsellModal);
      if (modalDismiss) modalDismiss.addEventListener('click', closeUpsellModal);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && zoomModal && zoomModal.classList.contains('is-open')) {
          closeUpsellModal();
        }
      });

      if (modalAddBtn) {
        modalAddBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (upsellCheck) {
            upsellCheck.checked = true;
            upsellCheck.dispatchEvent(new Event('change', { bubbles: true }));
          }
          closeUpsellModal();
        });
      }

      // Initial run
      updateGnomeUI();
    }

    function updateGiftProgression(tierLevel) {
      if (!giftUnlockBox) return;
      const iconEl = document.getElementById('zvGiftIcon');

      if (tierLevel >= 3) {
        giftUnlockBox.classList.add('unlocked');
        if (giftStatusBadge) giftStatusBadge.textContent = 'UNLOCKED';
        if (iconEl) iconEl.textContent = '🚚';
        if (giftTitle) giftTitle.textContent = 'FREE Tracked US Shipping Unlocked';
        if (giftSub) giftSub.textContent = 'Full family battle pack · Fast 24–48h dispatch from US hubs';
      } else if (tierLevel === 2) {
        giftUnlockBox.classList.add('unlocked');
        if (giftStatusBadge) giftStatusBadge.textContent = 'UNLOCKED';
        if (iconEl) iconEl.textContent = '🚚';
        if (giftTitle) giftTitle.textContent = 'FREE Tracked US Shipping Unlocked';
        if (giftSub) giftSub.textContent = 'Duo battle pack · Fast 24–48h dispatch from US hubs';
      } else {
        giftUnlockBox.classList.remove('unlocked');
        if (giftStatusBadge) giftStatusBadge.textContent = 'STANDARD';
        if (iconEl) iconEl.textContent = '📦';
        if (giftTitle) giftTitle.textContent = 'Standard US Carrier Shipping';
        if (giftSub) giftSub.textContent = 'Add a 2nd or 3rd set to unlock FREE tracked shipping';
      }
    }

    // 3. Add To Cart Execution
    async function executeAddToCart(goToCheckout = false) {
      let itemsPayload = null;
      let discountCode = '';

      if (isTileMixMatch && typeof getTileMixMatchPayload === 'function') {
        try {
          const res = getTileMixMatchPayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }
      } else if (isSilverBundle && typeof getSilverBundlePayload === 'function') {
        try {
          const res = getSilverBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }
      } else if (isEarBundle && typeof getEarBundlePayload === 'function') {
        try {
          const res = getEarBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }
      } else if (isEyeBundle && typeof getEyeBundlePayload === 'function') {
        try {
          const res = getEyeBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }
      } else if (isGnomeBundle && typeof getGnomeBundlePayload === 'function') {
        try {
          const res = getGnomeBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }
      } else {
        if (!activeVariantId) return;
        itemsPayload = [{
          id: activeVariantId,
          quantity: activeQty
        }];
      }

      if (!itemsPayload || itemsPayload.length === 0) return;

      const btn = goToCheckout ? buyNowBtn : claimBtn;
      const originalHtml = btn ? btn.innerHTML : '';
      if (btn) {
        btn.disabled = true;
        const claimLabel = document.getElementById('zvBtnClaimLabel');
        if (btn === claimBtn && claimLabel) {
          claimLabel.textContent = 'ADDING TO CART...';
        } else {
          btn.innerHTML = goToCheckout ? '<span>PROCEEDING...</span>' : '<span>ADDING TO CART...</span>';
        }
      }

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ items: itemsPayload })
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          console.warn('Cart API Notice:', errData.description || errData.message || res.statusText);
          if (res.status === 422) {
            console.info('Dev Preview: Variant verified. Triggering Willa Cart Drawer UI.');
          } else {
            throw new Error(errData.description || errData.message || 'Failed to add items to cart');
          }
        }

        if (window.fbq) {
          try {
            const trackVal = (currentPriceCents || 1999) / 100;
            if (goToCheckout) {
              window.fbq('track', 'InitiateCheckout', {
                content_name: document.title,
                content_ids: itemsPayload.map(i => i.id),
                content_type: 'product',
                value: trackVal,
                currency: 'USD'
              });
            } else {
              window.fbq('track', 'AddToCart', {
                content_name: document.title,
                content_ids: itemsPayload.map(i => i.id),
                content_type: 'product',
                value: trackVal,
                currency: 'USD'
              });
            }
          } catch(e) {}
        }

        if (goToCheckout) {
          let checkoutUrl = '/checkout';
          if (discountCode) {
            checkoutUrl += '?discount=' + encodeURIComponent(discountCode);
          }
          window.location.href = checkoutUrl;
          return;
        }

        window._activeBundleDiscount = discountCode || '';

        // Open Cart Drawer
        if (typeof window.willaRefreshCart === 'function') {
          await window.willaRefreshCart();
        }

        // Pass discount parameter to drawer checkout button if applicable
        if (discountCode) {
          const drawerCheckoutBtn = document.querySelector('.willa-checkout-btn');
          if (drawerCheckoutBtn) {
            drawerCheckoutBtn.setAttribute('data-discount', discountCode);
            drawerCheckoutBtn.onclick = function() {
              window.location.href = '/checkout?discount=' + encodeURIComponent(discountCode);
            };
          }
        }

        if (typeof window.willaOpenCartDrawer === 'function') {
          window.willaOpenCartDrawer();
        } else {
          const drawer = document.getElementById('willaCartDrawer');
          const overlay = document.getElementById('willaCartOverlay');
          if (drawer) {
            drawer.classList.add('active');
            if (overlay) overlay.classList.add('active');
          } else {
            window.location.href = '/cart';
          }
        }
      } catch (err) {
        console.error(err);
        alert(err.message || 'Could not complete order. Please try again.');
      } finally {
        if (btn) {
          btn.disabled = false;
          if (btn === claimBtn) {
            updateCtaLabels(currentPriceCents);
          } else {
            btn.innerHTML = originalHtml;
          }
        }
      }
    }

    if (claimBtn) {
      claimBtn.addEventListener('click', () => executeAddToCart(false));
    }
    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', () => executeAddToCart(true));
    }
    if (stickyBtn) {
      stickyBtn.addEventListener('click', () => executeAddToCart(false));
    }

    // 4. Sticky Bar Scroll Trigger
    if (stickyBar && buyBox) {
      window.addEventListener('scroll', function() {
        const rect = buyBox.getBoundingClientRect();
        if (rect.bottom < 100) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      });
    }

    // 5. Interactive Explainer Tabs (if present in story sections)
    const explainerTabs = document.querySelectorAll('.zv-explainer-tab');
    const explainerPanels = document.querySelectorAll('.zv-explainer-panel');
    explainerTabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        explainerTabs.forEach(t => t.classList.remove('active'));
        explainerPanels.forEach(p => p.classList.remove('active'));

        this.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) targetPanel.classList.add('active');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPdpEngine);
  } else {
    initPdpEngine();
  }
})();