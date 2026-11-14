import fs from 'fs';

let content = fs.readFileSync('assets/zavelyn-v4-pdp.js', 'utf8');

// 1. Controller Block after eyeBundleCards block
const targetAfterEye = `      // Initial run
      updateEyeUI();
    }`;

const gnomeController = `      // Initial run
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
          claimSaveEl.textContent = \`SAVE \${formatMoney(bundleCompareCents - bundlePriceCents)}\`;
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
            shippingText.textContent = \`Add $\${(needed / 100).toFixed(2)} more for FREE Tracked Shipping\`;
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

      // Initial run
      updateGnomeUI();
    }`;

if (!content.includes(targetAfterEye)) {
  throw new Error('targetAfterEye not found in zavelyn-v4-pdp.js');
}
content = content.replace(targetAfterEye, gnomeController);

// 2. Add to executeAddToCart
const targetExecuteEye = `      } else if (isEyeBundle && typeof getEyeBundlePayload === 'function') {
        try {
          const res = getEyeBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }`;

const replExecuteGnome = targetExecuteEye + `
      } else if (isGnomeBundle && typeof getGnomeBundlePayload === 'function') {
        try {
          const res = getGnomeBundlePayload();
          itemsPayload = res.items;
          discountCode = res.discountCode;
        } catch (err) {
          alert(err.message || 'Error configuring selection.');
          return;
        }`;

if (!content.includes(targetExecuteEye)) {
  throw new Error('targetExecuteEye not found in zavelyn-v4-pdp.js');
}
content = content.replace(targetExecuteEye, replExecuteGnome);

fs.writeFileSync('assets/zavelyn-v4-pdp.js', content, 'utf8');
console.log('✔ Successfully updated assets/zavelyn-v4-pdp.js with Gnome Bundle & Upsell Controller!');

