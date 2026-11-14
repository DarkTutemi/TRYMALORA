import { getAccessToken, SHOP, API_VERSION } from './config.mjs';

async function removeFaqFromMenu() {
  const token = await getAccessToken();
  const mutation = `
    mutation menuUpdate($id: ID!, $title: String!, $items: [MenuItemUpdateInput!]!) {
      menuUpdate(id: $id, title: $title, items: $items) {
        menu {
          id
          title
          handle
          items {
            id
            title
            url
            type
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const variables = {
    id: "gid://shopify/Menu/328729133427",
    title: "ULTRA OVERNIGHT — Primary Navigation",
    items: [
      {
        id: "gid://shopify/MenuItem/818303172979",
        title: "Home",
        type: "FRONTPAGE",
        url: "/"
      },
      {
        id: "gid://shopify/MenuItem/818303205747",
        title: "ULTRA OVERNIGHT",
        type: "HTTP",
        url: "/products/full-spine-ultra-overnight"
      },
      {
        id: "gid://shopify/MenuItem/818303238515",
        title: "Our Story",
        type: "HTTP",
        url: "/pages/about-us"
      },
      {
        id: "gid://shopify/MenuItem/818303304051",
        title: "Track Order",
        type: "HTTP",
        url: "/pages/track-order"
      },
      {
        id: "gid://shopify/MenuItem/818303336819",
        title: "Contact",
        type: "HTTP",
        url: "/pages/contact"
      }
    ]
  };

  const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token
    },
    body: JSON.stringify({ query: mutation, variables })
  });

  const data = await res.json();
  console.log('Result:', JSON.stringify(data, null, 2));
}

removeFaqFromMenu();
