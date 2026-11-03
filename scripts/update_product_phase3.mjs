import { adminGraphql, SHOP } from './config.mjs';

async function updateProduct() {
  const productId = 'gid://shopify/Product/15635841057139';

  console.log(`Updating product ${productId} on ${SHOP}...`);

  const descriptionHtml = `
<div class="tm-product-description">
  <p class="tm-lead">Turn ordinary playtime into an interactive adventure with infrared battles, projected targets, and exciting sound effects.</p>

  <div class="tm-desc-section">
    <h3>ULTIMATE LASER BATTLE SET</h3>
    <p>Vibrant LED health indicators and immersive sound effects bring every battle round to life.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028172939_28b057db4ce94fb682768c7ddf6c51bb.jpg" alt="Ultimate Laser Battle Set with Blasters and Projector" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>ACTIVE PLAY OVER SCREEN ADDICTION</h3>
    <p>Replace passive screen scrolling with active, energetic physical indoor and outdoor play.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028172944_4bd6dd309a116b9c883537123f7c54a5.png" alt="Active Play Over Screen Time" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>DYNAMIC TARGET TRAINING MODE</h3>
    <p>Aim and fire at animated wall targets projected 180° onto walls or ceilings to improve tracking and hand-eye coordination.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028172949_c084e68ec5b7fc4175ce2949c02f8ca4.png" alt="Dynamic Wall Target Training Mode" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>EXCITING MULTIPLAYER TEAM BATTLES</h3>
    <p>Sync unlimited blasters across 4 distinct team colors (Blue, Red, Green, White). Team lights and tactile vibration trigger with each scored tag.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028172954_bdd01154b450dcfdc727ff1a4f90d97f.jpg" alt="Multiplayer Team Battle Lights" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>TACTICAL SENSORY BLASTER DESIGN</h3>
    <p>Engineered with responsive optical sensors, tactile trigger feedback, life meter bars, and sound controls.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028172959_7f75090548ec20e5ee37e0c446d6dabc.png" alt="Tactical Blaster Hardware Details" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>INDOOR ACTION ARENAS</h3>
    <p>Enjoy thrilling, eye-safe laser battles anywhere inside your home—living rooms, basements, and hallways.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028173005_e38ea755f42413b1d26cd0d60cb1344c.jpg" alt="Indoor Action Arena Setup" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>COMPLETE BATTLE CONFIGURATION</h3>
    <p>Each set includes 2 tactical blasters, 1 dynamic projector, target discs, and complete game rules.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028173010_bb70c94b86997e1d0e0dac7a570d7896.jpg" alt="Battle Configuration and Specifications" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section">
    <h3>FAST THREE-STEP SETUP</h3>
    <p>Insert batteries, select your play mode or team color, and commence battle immediately.</p>
    <img src="https://ashbtop.com/cdn/shop/files/spp_shopify20261028173015_cddd76b98106086c23fbe20b279c2af2.jpg" alt="Fast 3-Step Setup Instructions" loading="lazy" width="800" height="800">
  </div>

  <div class="tm-desc-section tm-specs-box">
    <h3>TECHNICAL SPECIFICATIONS &amp; BATTERY NOTICE</h3>
    <ul>
      <li><strong>Technology:</strong> Invisible optical infrared sensor (eye-safe; no high-power lasers; zero physical projectiles)</li>
      <li><strong>Recommended Age:</strong> 6+ years</li>
      <li><strong>Indoor Range:</strong> 15–30 feet (optimal in dim to moderate lighting)</li>
      <li><strong>Material:</strong> Impact-resistant, non-toxic ABS polymer</li>
      <li><strong>Battery Notice:</strong> Batteries are not included. Requires 4 × 1.5V AAA (2 per blaster) and 3 × 1.5V AA (projector).</li>
    </ul>
  </div>
</div>
  `.trim();

  const updateRes = await adminGraphql(`
    mutation updateProduct($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
          handle
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    input: {
      id: productId,
      title: 'Infrared Laser Battle Set',
      descriptionHtml: descriptionHtml
    }
  });

  if (updateRes.productUpdate.userErrors?.length) {
    console.error('Update errors:', updateRes.productUpdate.userErrors);
  } else {
    console.log('Product updated successfully!');
    console.log('Title:', updateRes.productUpdate.product.title);
    console.log('Status:', updateRes.productUpdate.product.status);
  }
}

updateProduct().catch(console.error);
