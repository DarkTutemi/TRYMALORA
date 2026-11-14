async function testAdd() {
  const payload1 = {
    items: [{
      id: "67346169725299",
      quantity: 1
    }]
  };
  const res1 = await fetch('https://trymalora.com/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload1)
  });
  console.log('Test 1 (Ear cleaner variant without plan):', res1.status, await res1.text());

  const payload2 = {
    items: [{
      id: "67346169725299",
      quantity: 1,
      selling_plan: 693337882995
    }]
  };
  const res2 = await fetch('https://trymalora.com/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload2)
  });
  console.log('Test 2 (Ear cleaner with selling_plan):', res2.status, await res2.text());

  const payload3 = {
    items: [{
      id: "67346173690227",
      quantity: 1
    }]
  };
  const res3 = await fetch('https://trymalora.com/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(payload3)
  });
  console.log('Test 3 (Wipes):', res3.status, await res3.text());
}

testAdd().catch(console.error);

