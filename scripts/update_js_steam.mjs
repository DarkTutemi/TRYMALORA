import fs from 'fs';

let content = fs.readFileSync('assets/zavelyn-v4-pdp.js', 'utf8');

// Target after section 2d (around line 870)
const targetSection2dEnd = `      // Initial run
      updateEarUI();
    }`;

const replSection2e = targetSection2dEnd + `

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
          claimSaveEl.textContent = \`SAVE \${formatMoney(bundleCompareCents - bundlePriceCents)}\`;
        }

        if (btnClaimLabel) {
          btnClaimLabel.textContent = \`ADD TO CART · \${formatMoney(totalPriceCents)}\`;
        }
        if (stickyBtnLabel) {
          stickyBtnLabel.textContent = \`ADD TO CART · \${formatMoney(totalPriceCents)}\`;
        }
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
            shippingText.textContent = \`Add \$\${(needed / 100).toFixed(2)} more for FREE Tracked Shipping\`;
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
        upsellCheck.addEventListener('change', () => {
          updateEyeUI();
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
    }`;

// Target in executeAddToCart
const targetAtcEar = `} else if (isEarBundle && typeof getEarBundlePayload === 'function') {
        try {
          const res = getEarBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }`;

const replAtcEye = targetAtcEar + `
      } else if (isEyeBundle && typeof getEyeBundlePayload === 'function') {
        try {
          const res = getEyeBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }`;

if (!content.includes(targetSection2dEnd)) {
  console.error("targetSection2dEnd not found");
  process.exit(1);
}
if (!content.includes(targetAtcEar)) {
  console.error("targetAtcEar not found");
  process.exit(1);
}

content = content.replace(targetSection2dEnd, replSection2e);
content = content.replace(targetAtcEar, replAtcEye);

fs.writeFileSync('assets/zavelyn-v4-pdp.js', content, 'utf8');
console.log('Successfully updated assets/zavelyn-v4-pdp.js');

