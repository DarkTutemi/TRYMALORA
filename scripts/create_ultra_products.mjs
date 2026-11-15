import { getAccessToken, SHOP, API_VERSION } from './config.mjs';
import fs from 'fs';
import path from 'path';

const ONLINE_STORE_PUB_ID = 'gid://shopify/Publication/366564180339';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

const LACE_COLORS = ['Red', 'Skin', 'Grey', 'Black', 'Pink'];
const SHORTS_COLORS = ['Green', 'Black', 'Grey', 'Yellow', 'Pink', 'Red'];

function toBase64(filePath) {
  return fs.readFileSync(filePath).toString('base64');
}

async function publishToOnlineStore(token, productId) {
  const mutation = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        availablePublicationsCount {
          count
        }
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
    body: JSON.stringify({
      query: mutation,
      variables: {
        id: `gid://shopify/Product/${productId}`,
        input: [{ publicationId: ONLINE_STORE_PUB_ID }]
      }
    })
  });
  const data = await res.json();
  console.log(`  Published ${productId} to Online Store:`, data.data?.publishablePublish?.publishable?.availablePublicationsCount?.count || 'OK');
}

async function createProduct01(token) {
  console.log('\n--- Creating Product 01: ULTRA LACE™ ---');
  
  const variants = [];
  for (const s of SIZES) {
    for (const c of LACE_COLORS) {
      variants.push({
        option1: s,
        option2: c,
        price: '34.99',
        compare_at_price: '69.98',
        sku: `UO-LACE-${c.toUpperCase()}-${s}`,
        inventory_management: null,
        requires_shipping: true,
        fulfillment_service: 'manual',
        taxable: true
      });
    }
  }

  const images = [
    { attachment: toBase64('assets/ultra-lace-hero.jpg'), filename: 'ultra-lace-hero.jpg' },
    { attachment: toBase64('assets/ultra-lace-detail.jpg'), filename: 'ultra-lace-detail.jpg' },
    { attachment: toBase64('assets/ultra-lace-fit.jpg'), filename: 'ultra-lace-fit.jpg' },
    { attachment: toBase64('assets/ultra-lace-five-layers.jpg'), filename: 'ultra-lace-five-layers.jpg' },
    { attachment: toBase64('assets/ultra-lace-colors.jpg'), filename: 'ultra-lace-colors.jpg' }
  ];

  const bodyHtml = `
    <p class="uo-pdp-desc">
      Everyday Elegance. Thoughtful Period Protection. ULTRA LACE™ combines luxurious, whisper-soft floral lace with our clinically tested five-layer moisture locking core for dependable all-day and overnight security without sacrificing delicate feminine style.
    </p>
    <h3>Product Features</h3>
    <ul>
      <li><strong>Feminine Floral Lace:</strong> Delicate, breathable scalloped lace panels along the hips and rear contour gracefully to your silhouette.</li>
      <li><strong>5-Layer Absorbent Core:</strong> Absorbs and locks up to 40ml of liquid without bulky seams or moisture sensation.</li>
      <li><strong>Ergonomic Mid-Waist Fit:</strong> Elastic-free comfort waistband prevents digging, rolling, or panty lines under clothing.</li>
      <li><strong>Odor & Vapor Management:</strong> Naturally breathable modal fibers keep intimate skin fresh, dry, and irritation-free.</li>
      <li><strong>Machine Washable & Reusable:</strong> Tested for over 100 gentle wash cycles with zero loss in leakproof performance.</li>
    </ul>
  `;

  const payload = {
    product: {
      title: 'ULTRA LACE™ — Elegant Period Briefs',
      handle: 'ultra-lace-period-briefs',
      body_html: bodyHtml.trim(),
      vendor: 'ULTRA OVERNIGHT',
      product_type: 'Period Underwear',
      status: 'active',
      template_suffix: 'ultra-lace',
      tags: 'ULTRA LACE, PERIOD UNDERWEAR, ELEGANT BRIEFS, V4 FLAGSHIP',
      options: [
        { name: 'Size', values: SIZES },
        { name: 'Color', values: LACE_COLORS }
      ],
      variants: variants,
      images: images
    }
  };

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.product) {
    console.error('Failed to create Product 01:', JSON.stringify(data, null, 2));
    throw new Error('Product 01 creation failed');
  }

  const p = data.product;
  console.log(`✓ Product 01 Created successfully! ID: ${p.id} | Handle: ${p.handle} | Variants: ${p.variants.length} (Expected: 40)`);
  await publishToOnlineStore(token, p.id);
  return p;
}

async function createProduct02(token) {
  console.log('\n--- Creating Product 02: ULTRA COMFORT SHORTS™ ---');

  const variants = [];
  for (const s of SIZES) {
    for (const c of SHORTS_COLORS) {
      variants.push({
        option1: s,
        option2: c,
        price: '44.99',
        compare_at_price: '89.98',
        sku: `UO-SHORTS-${c.toUpperCase()}-${s}`,
        inventory_management: null,
        requires_shipping: true,
        fulfillment_service: 'manual',
        taxable: true
      });
    }
  }

  const images = [
    { attachment: toBase64('assets/ultra-shorts-hero.jpg'), filename: 'ultra-shorts-hero.jpg' },
    { attachment: toBase64('assets/ultra-shorts-waistband.jpg'), filename: 'ultra-shorts-waistband.jpg' },
    { attachment: toBase64('assets/ultra-shorts-leg-coverage.jpg'), filename: 'ultra-shorts-leg-coverage.jpg' },
    { attachment: toBase64('assets/ultra-shorts-five-layers.jpg'), filename: 'ultra-shorts-five-layers.jpg' },
    { attachment: toBase64('assets/ultra-shorts-colors.jpg'), filename: 'ultra-shorts-colors.jpg' }
  ];

  const bodyHtml = `
    <p class="uo-pdp-desc">
      More Coverage. More Comfort. More Freedom. ULTRA COMFORT SHORTS™ deliver high-waisted security with extended leg coverage designed to eliminate thigh chafing, front and rear shifting, and restless nighttime worry.
    </p>
    <h3>Product Features</h3>
    <ul>
      <li><strong>Extended Leg & Thigh Coverage:</strong> Soft, seamless boy-short silhouette hugs gently without riding up or binding.</li>
      <li><strong>High-Waisted Ribbed Band:</strong> Gentle compression waistband smooths the midsection and stays in place through every sleeping position.</li>
      <li><strong>High-Capacity 5-Layer Core:</strong> Absorbs up to 50ml of liquid with extended coverage running from front pelvic shield down through inner thigh contours.</li>
      <li><strong>Anti-Chafe Comfort:</strong> Frictionless bamboo modal knit protects sensitive inner thighs from moisture and friction.</li>
      <li><strong>Dual-Wear Flexibility:</strong> Wear alone as bedtime loungewear or under oversized pajamas for ultimate overnight confidence.</li>
    </ul>
  `;

  const payload = {
    product: {
      title: 'ULTRA COMFORT SHORTS™ — High-Waisted Period Shorts',
      handle: 'ultra-comfort-period-shorts',
      body_html: bodyHtml.trim(),
      vendor: 'ULTRA OVERNIGHT',
      product_type: 'Period Underwear',
      status: 'active',
      template_suffix: 'ultra-shorts',
      tags: 'ULTRA COMFORT SHORTS, HIGH WAISTED SHORTS, PERIOD UNDERWEAR, V4 FLAGSHIP',
      options: [
        { name: 'Size', values: SIZES },
        { name: 'Color', values: SHORTS_COLORS }
      ],
      variants: variants,
      images: images
    }
  };

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/products.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.product) {
    console.error('Failed to create Product 02:', JSON.stringify(data, null, 2));
    throw new Error('Product 02 creation failed');
  }

  const p = data.product;
  console.log(`✓ Product 02 Created successfully! ID: ${p.id} | Handle: ${p.handle} | Variants: ${p.variants.length} (Expected: 48)`);
  await publishToOnlineStore(token, p.id);
  return p;
}

async function main() {
  const token = await getAccessToken();
  const p1 = await createProduct01(token);
  const p2 = await createProduct02(token);
  console.log('\n================================================================');
  console.log('BOTH PRODUCTS CREATED & PUBLISHED ON SHOPIFY:');
  console.log(`Product 01: ${p1.title} (${p1.id}) - ${p1.variants.length} variants`);
  console.log(`Product 02: ${p2.title} (${p2.id}) - ${p2.variants.length} variants`);
  console.log('================================================================');
}

main().catch(console.error);
