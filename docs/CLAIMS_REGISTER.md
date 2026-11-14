# ULTRA OVERNIGHT™ — Claims Register & Substantiation Log

## Document Purpose
This document establishes legal, regulatory, and technical advertising boundaries for the ULTRA OVERNIGHT™ brand and the FULL-SPINE ULTRA OVERNIGHT™ period underwear. All copy rendered on the storefront, marketing emails, paid ad creatives, and landing pages must adhere strictly to these approved claim boundaries.

---

## 1. Master Claims Matrix

| ID | Engineering & Design Target | Evidence Source | Evidence Status | Allowed Copy / Approved Wording | Disallowed Copy / Banned Statements | Verification Test Required | Current Approval Status |
|---|---|---|---|---|---|---|---|
| **CLM-01** | **Total Absorbency (150–160 mL)** | SPYV2 Factory Spec & Physical V4 Prototype | Target Specification (Lab validation in progress) | "Engineered for heavy-flow days and nights"; "High-capacity multi-layer core designed to absorb and lock in liquid rapidly"; "Extended absorption capacity". | "Holds 160ml guaranteed"; "Equivalent to 10 tampons without leaking"; "Clinically proven maximum absorption"; "Never overflows". | Independent lab absorption test (ISO 11948-1 or modified Rothwell method) with saline solution. | **DRAFT — PENDING LAB CONFIRMATION** |
| **CLM-02** | **Leak Protection Duration** | 5-Layer NOCTÉRA-5™ Composite Core | Engineering Intent | "Designed to keep you feeling dry and secure throughout the night"; "All-night peace of mind for restful sleep". | "Guaranteed 8–12 hours of zero leaks"; "100% leakproof"; "Zero stains forever"; "Never wake up to change sheets". | Wearer trial panel across overnight sleeping periods (minimum 30 participants, diverse flow rates). | **DRAFT — PENDING USER TRIAL** |
| **CLM-03** | **Full-Spine Coverage & Side Sleepers** | Front-to-rear extended gusset & contour barrier | CAD Pattern & Physical Garment Fit | "Full-Spine™ architecture extends continuous protective coverage from front waistband to rear waistband"; "Ergonomic side contours designed to help guard against lateral leakage". | "Zero leaks in every sleep position guaranteed"; "Impossible to leak on your side"; "Proprietary patented side seal" (unless patent officially issued). | 3D body motion capture and fluid migration testing under simulated sleep positioning. | **VERIFIED PATTERN SPECIFICATION** |
| **CLM-04** | **Sensory Comfort & Breathability** | CloudFlex™ Modal / Elastane Fabric Blend | Material Data Sheet (MDS) | "Soft, breathable micro-modal knit"; "Gentle seamless hug without crunchy noise or unnecessary bulk"; "Designed for sensory-first bedtime comfort". | "Cooler than silk"; "100% breathable membrane"; "Zero sweating"; "Hypoallergenic" (unless dermatologically certified). | Textile breathability (ASTM E96) and skin sensitivity testing. | **VERIFIED MATERIAL SPECIFICATION** |
| **CLM-05** | **Wash Durability (50–100 Cycles)** | Laminated TPU Barrier & Ultrasonic Bond Specs | Manufacturer Cycle Spec | "Engineered for repeated wash cycles when cared for as directed (cold rinse, gentle cycle, hang dry)"; "Durable, reusable alternative to disposable products". | "Lasts 100 washes guaranteed"; "Indestructible barrier"; "Never degrades". | Standard accelerated home laundering test (AATCC LP1 / ISO 6330, 50 cycles). | **DRAFT — PENDING LAUNDERING LAB DATA** |
| **CLM-06** | **Odor Control (OdorVeil™)** | Fabric finish & breathable moisture-wicking layer | Component Spec | "Helps keep you feeling fresh throughout the night"; "Breathable structure helps minimize stale moisture buildup". | "Antibacterial guaranteed"; "Kills 99.9% of bacteria"; "Eliminates all odors permanently"; "Medical-grade antimicrobial". | ISO 20743 / AATCC 100 (if antimicrobial claim is sought; currently prohibited without EPA/FDA registration). | **DISALLOWED AS ANTIMICROBIAL; ALLOWED AS BREATHABILITY FRESHNESS ONLY** |
| **CLM-07** | **Trademark & Brand Assets** | Brand Nomenclature Specification | Marketing Draft | "NOCTÉRA-5™", "VelaLock™ Core", "SpineHalo™ Shield", "SeraSeal™ Contour", "AeriDry™ Touch", "OdorVeil™", "CloudFlex™ Knit", "WashGuard™". | Using ® before registration; claiming proprietary patents without patent application numbers. | USPTO trademark application filing. | **PROPOSED BRAND MARKS (TM)** |

---

## 2. Storefront Audit & Remediation Log

| Storefront File | Original Problematic Text | Remediated Compliant Text | Resolution Status |
|---|---|---|---|
| `sections/ultra-faq.liquid` (Q1) | "...keeping you dry and secure through 8 to 12 hours of sleep." | "...helping keep you feeling dry, comfortable, and secure throughout the night." | **FIXED & VERIFIED** |
| `sections/ultra-faq.liquid` (Q2) | "Yes! Ordinary period underwear only covers the bottom gusset. Our proprietary Full-Spine™ coverage..." | "FULL-SPINE ULTRA OVERNIGHT™ features our signature extended coverage extending from the front pelvis all the way up the rear waistband, paired with ergonomic side contours designed to help guard against lateral leakage as you turn, shift, or sleep on your side." | **FIXED & VERIFIED** |
| `sections/ultra-pdp-tabs.liquid` | "Durable for 50–100 wash cycles." | "Engineered for repeated wash cycles when cared for as directed." | **FIXED & VERIFIED** |
| `sections/ultra-about-story.liquid` | "...you remain completely shielded." | "...our multi-layer design is engineered to help keep you protected and confident." | **FIXED & VERIFIED** |
| `sections/ultra-product-main.liquid` | Hardcoded 4.9 rating / 2,846 reviews and fake reviewer testimonials | Converted to dynamic rating metafield (rendered only when authentic review app data exists). Fake ratings removed. | **FIXED & VERIFIED** |
| `sections/ultra-reviews.liquid` | Emily R., Nicole M., Jasmine T. fake reviews, avatars, and "Verified Buyer" badges | Converted to Editorial Craftsmanship & Product Standards cards (Full-Spine Architecture, CloudFlex Soft Touch, WashGuard Durability) with setting for 3rd-party review app embed. | **FIXED & VERIFIED** |

---

## 3. Mandatory Copy Rules for Future Storefront & Marketing Changes
1. **Never use the word "100% leakproof" or "Guaranteed leak-free"**: Always use intent-led and design-led language ("designed for heavy flow", "helps prevent leaks", "engineered for extended overnight coverage").
2. **Never claim specific hour durations ("8–12 hours") as a guarantee**: Use "throughout the night" or "for restful nights".
3. **Never claim clinical, antimicrobial, or antibacterial efficacy without certifications**: Do not claim bactericidal or medical effects.
4. **Never publish fake reviews or fabricated reviewer avatars**: All public social proof must originate from authenticated purchase records via an integrated Shopify review application.
