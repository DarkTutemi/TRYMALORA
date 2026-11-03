# Collection Cleanup & Navigation Realignment Plan

> **Store**: `ikwh1h-fx.myshopify.com` (`Trymalora Official Store`)  
> **Development Theme ID**: `197111906675`  
> **Status**: **PENDING EXPLICIT USER APPROVAL** (Zero deletions will occur until approved)  

---

## 1. Action Summary Table

| Action Category | Target Resource | Type | Rationale | Reversible |
| :--- | :--- | :---: | :--- | :---: |
| **PROPOSED DELETION** | `Home page` (`frontpage`, ID: `708548493683`) | Backend Collection | Empty system artifact with 0 products; never displayed in main menu or marketing. | Yes (Can re-create) |
| **PROPOSED RETIREMENT** | `Handpans` (`/collections/zavelyn-handpans`) | Navigation Link & Liquid Template | Legacy niche instrument from previous store campaign. Not aligned with modern lifestyle store. | Yes |
| **PROPOSED RETIREMENT** | `Fence & Farm` (`/collections/fence-and-farm`) | Navigation Link | Legacy niche advertorial campaign. Causes 404 in header. | Yes |
| **PROPOSED RETIREMENT** | `Power & Tools` (`/collections/power-tools`) | Primary Navigation Link | Relocate to secondary category or sub-category to prioritize lifestyle & toys. | Yes |
| **PROPOSED CREATION** | `Interactive Toys` (`/collections/interactive-toys`) | Automated Collection | Dedicated home for the newly imported Infrared Laser Battle Set and future interactive toys. | Yes |
| **PROPOSED CREATION** | `Best Sellers` (`/collections/best-sellers`) | Automated Collection | Required by Header Navigation and Willa Cart Drawer empty state links. | Yes |
| **PROPOSED CREATION** | `Smart Home & Living` (`/collections/smart-home-living`) | Automated Collection | Modern umbrella category replacing fragmented tool/workshop links. | Yes |

---

## 2. Navigation Realignment Specification

### 2.1 Proposed New Header Menu Structure in [`sections/header-group.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/header-group.json)

To ensure **zero 404 errors** and an intuitive customer journey, the header links will be updated:

```json
[
  { "title": "Home", "link": "/", "icon": "🏠" },
  { "title": "Best Sellers", "link": "/collections/best-sellers", "icon": "🌟", "badge": "HOT" },
  { "title": "Interactive Toys", "link": "/collections/interactive-toys", "icon": "🎯", "badge": "NEW" },
  { "title": "Smart Home", "link": "/collections/smart-home-living", "icon": "💡" },
  { "title": "All Products", "link": "/collections/all-products", "icon": "🛍️" },
  { "title": "Track Order", "link": "/pages/track-order", "icon": "🚚" }
]
```

### 2.2 Showroom 2.5D Department Portals Realignment in [`sections/zavelyn-v4-stores.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-stores.liquid)
Update portal links to match real collections:
- **Dept 01 (Play & Interactive)**: `/collections/interactive-toys?view=showroom` (Theme: `tech` / dark neon shelf)
- **Dept 02 (Smart Home & Living)**: `/collections/smart-home-living?view=showroom` (Theme: `wood` oak shelf)
- **Dept 03 (Best Sellers & Trends)**: `/collections/best-sellers?view=showroom` (Theme: `boutique` white shelf)
- **Dept 04 (All Innovations)**: `/collections/all-products?view=showroom` (Theme: `metal` brushed steel shelf)

---

## 3. Risk Mitigation & Verification Checklist

- [x] Zero products will be deleted (store currently has 0 products on backend).
- [x] Pre-cleanup JSON snapshot saved to [`docs/backups/collections_backup_20261103.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/docs/backups/collections_backup_20261103.json).
- [ ] Explicit user approval received before executing GraphQL collection delete mutation.
- [ ] Verification of HTTP 200 OK responses across all remaining navigation links after realigning.
