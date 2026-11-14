async function testCartDiscounts() {
  const tests = [
    { name: 'Buy 1 One-time', id: '67346128470387', plan: null, expected: '$34.99' },
    { name: 'Buy 1 Subscription', id: '67346128470387', plan: 693337882995, expected: '$31.49' },
    { name: 'Buy 2 Get 2 Free One-time', id: '67346169725299', plan: null, expected: '$62.98' },
    { name: 'Buy 2 Get 2 Free Subscription', id: '67346169725299', plan: 693337882995, expected: '$56.68' },
    { name: 'Buy 4 Get 4 Free One-time', id: '67346169758067', plan: null, expected: '$111.97' },
    { name: 'Buy 4 Get 4 Free Subscription', id: '67346169758067', plan: 693337882995, expected: '$100.77' }
  ];

  for (const t of tests) {
    // Clear cart
    await fetch('https://trymalora.com/cart/clear.js', { method: 'POST' });

    const item = { id: t.id, quantity: 1 };
    if (t.plan) item.selling_plan = t.plan;

    const res = await fetch('https://trymalora.com/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ items: [item] })
    });

    const data = await res.json();
    if (!res.ok) {
      console.error(`[FAIL] ${t.name}:`, data);
      continue;
    }

    const cartRes = await fetch('https://trymalora.com/cart.js');
    const cart = await cartRes.json();
    const addedItem = cart.items[0];
    const finalPrice = '$' + (addedItem.final_price / 100).toFixed(2);
    const cartTotal = '$' + (cart.total_price / 100).toFixed(2);
    const planName = addedItem.selling_plan_allocation?.selling_plan?.name || 'None';

    console.log(`[TEST] ${t.name}:`);
    console.log(`   Final Price: ${finalPrice} (Expected: ${t.expected}) | Cart Total: ${cartTotal}`);
    console.log(`   Selling Plan: ${planName}`);
    console.log(`   Match: ${finalPrice === t.expected ? '✅ PERFECT' : '❌ MISMATCH'}`);
  }
}

testCartDiscounts().catch(console.error);

