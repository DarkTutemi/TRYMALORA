# Store Collections & Navigation Audit

> **Target Store**: `ikwh1h-fx.myshopify.com` (`Trymalora Official Store`)  
> **Development Theme ID**: `197111906675`  
> **Audit Date**: November 2026  
> **Auditor**: Lead Shopify Architect & Store Operations Engineer  

---

## 1. Executive Summary

This audit assesses the current state of collections, navigation links, and theme references on `ikwh1h-fx.myshopify.com`.

### Current State Matrix:
- **Shopify Backend Collections Count**: 1 (Shopify system default `frontpage` / `Home page`).
- **Active Products on Backend**: 0.
- **Theme Navigation Links Referencing Collections**: 8 links in [`sections/header-group.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/header-group.json) and [`sections/willa-header.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/willa-header.liquid).
- **Theme 2.5D Showroom Portals Referencing Collections**: 4 portals in [`sections/zavelyn-v4-stores.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-stores.liquid).

Because `ikwh1h-fx.myshopify.com` is a fresh store workspace, previous cloned campaign collections (e.g. `zavelyn-handpans`, `fence-and-farm`, `power-tools`) currently lead to **404 Page Not Found** errors when clicked in the storefront header and showroom portals.

---

## 2. Complete Inventory of Existing & Referenced Collections

| Collection Title / Reference | Handle | Source / Referencing File | Backend Status | Products Assigned | Recommendation |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Home page** | `frontpage` | Shopify Default Backend (`id: 708548493683`) | **Exists** | 0 | **DELETE** (Obsolete system artifact) |
| **Interactive Toys** | `interactive-toys` | Proposed Destination for First Product Import | *To Create* | 1 (Pending Draft) | **CREATE & KEEP** (Core department) |
| **All Products** | `all` / `all-products` | Header Group, V4 Stores Portal 3 & 4 | Missing | 0 | **CREATE & KEEP** (Standard master catalog) |
| **Best Sellers** | `best-sellers` | Header Group Nav Link 2, Willa Cart Drawer | Missing | 0 | **CREATE & KEEP** (High-converting anchor) |
| **Smart Home & Living** | `smart-home-living` | Proposed Modernized Department | *To Create* | 0 | **CREATE & KEEP** (Replaces legacy `home-improvement`) |
| **Deals of the Day** | `deals-of-the-day` | Header Group Nav Link 4 | Missing | 0 | **MERGE / ALIAS** into Best Sellers |
| **Handpans** | `zavelyn-handpans` | Header Group Nav Link 5, [`collection.zavelyn-handpans.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/templates/collection.zavelyn-handpans.json) | Missing | 0 | **DELETE / REMOVE LINK** (Obsolete legacy niche) |
| **Power & Tools** | `power-tools` | Header Group Nav Link 6, V4 Stores Portal 2 | Missing | 0 | **CLEAN UP / RETIRE** from primary navigation |
| **Fence & Farm** | `fence-and-farm` | Header Group Nav Link 7 | Missing | 0 | **DELETE / REMOVE LINK** (Obsolete single-product funnel) |
| **Garden & Outdoor** | `garden-and-outdoor` | Header Group Nav Link 8 | Missing | 0 | **KEEP / CONSOLIDATE** into Home & Living |
| **Home & Workshop** | `home-and-workshop` | Header Group Nav Link 9 | Missing | 0 | **MERGE** into Smart Home & Living |

---

## 3. Analysis of Obsolete & Broken Navigation Links

### 3.1 Header Group Navigation Audit ([`sections/header-group.json`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/header-group.json))
The current header configuration contains hardcoded URLs targeting non-existent collections:
```json
"nav_handpans": { "link": "/collections/zavelyn-handpans" }, // 404
"nav_fence":    { "link": "/collections/fence-and-farm" },   // 404
"nav_power":    { "link": "/collections/power-tools" },      // 404
"nav_workshop": { "link": "/collections/home-and-workshop" } // 404
```
**Impact**: Any visitor clicking these links experiences a dead-end 404 page, destroying store credibility.

### 3.2 2.5D Showroom Architectural Store Entrances ([`sections/zavelyn-v4-stores.liquid`](file:///c:/Users/Admin/Desktop/TRYMALORA/sections/zavelyn-v4-stores.liquid))
The 4 department portals link to:
- Portal 1: `/collections/home-improvement?view=showroom` &rarr; Missing.
- Portal 2: `/collections/power-tools?view=showroom` &rarr; Missing.
- Portal 3: `/collections/all-products?view=showroom` &rarr; Missing.
- Portal 4: `/collections/all-products?view=showroom` &rarr; Missing.

---

## 4. Proposed Clean Product-Driven Collection Hierarchy

To meet the requirement that **TRYMALORA operates as a curated lifestyle store with clean category clusters**, we propose the following 4 core merchandise departments:

```
[ TRYMALORA STOREFRONT ]
    │
    ├── 1. Interactive Toys & Gadgets (/collections/interactive-toys)
    │      └── Initial Product: Kids Infrared Laser Battle Toy Gun Set
    │
    ├── 2. Smart Home & Daily Living (/collections/smart-home-living)
    │      └── Modern home convenience, organizers, comfort
    │
    ├── 3. Health & Wellness Essentials (/collections/wellness-recovery)
    │      └── Personal care, relaxation, therapeutic accessories
    │
    └── 4. Best Sellers & New Releases (/collections/best-sellers)
           └── Automated collection filtering by top conversion & inventory
```

---

## 5. Pre-Deletion Backup Record

Before executing any deletion on the Shopify backend, the current collection state has been captured:
- **Export Timestamp**: November 3, 2026 15:30 UTC
- **Export Data**:
  ```json
  [
    {
      "id": 708548493683,
      "title": "Home page",
      "handle": "frontpage",
      "description": null,
      "products_count": 0,
      "published_at": "2026-11-02T13:52:06+07:00",
      "rules": []
    }
  ]
  ```
- **Backup File Location**: `docs/backups/collections_backup_20261103.json`
