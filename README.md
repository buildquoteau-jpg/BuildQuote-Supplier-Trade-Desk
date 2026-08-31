# BuildQuote Trade Desk

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth_%2B_DB-3ECF8E?logo=supabase&logoColor=white)
![Resend](https://img.shields.io/badge/Resend-email-000000?logo=resend&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

Supplier and admin portal for BuildQuote. Suppliers manage their profile, embed
widgets, and their RFQ inbox; BuildQuote staff create suppliers and assign
widgets. Public surfaces are the supplier directory and embeddable widgets.

**Not** a manufacturer login or catalogue-management app — catalogue data
(manufacturers/systems/components) is read here, not authored here.

---

## Why fork this

- Turnkey supplier-portal pattern: auth-gated dashboard (profile, widget
  management, RFQ inbox, account) built on Supabase Auth, ready to adapt for any
  directory-of-vendors product.
- **Embeddable widgets are the standout standalone piece** — a single-brand
  widget (`/widget/[token]`) or a multi-brand widget (`/embed/[slug]`) that
  suppliers can drop straight onto their own external website, independent of
  everything else in this repo.
- Clean separation from catalogue authoring and RFQ/builder logic — read this repo
  if you want "how do vendors manage their own listing + leads," not "how is
  product data parsed."

---

## About the creator

This was built solo by **Melia Knapp**, after seeing — from inside a local
hardware supply store — how scattered building-product information is for
everyone who needs it, suppliers included. The full story of why this exists
and why it's open source is in the
[Build-Quote-Library-and-Request-for-Quotation README](https://github.com/buildquoteau-jpg/Build-Quote-Library-and-Request-for-Quotation#about-the-creator).
Questions or feedback: [meliagrace@gmail.com](mailto:meliagrace@gmail.com).

**Want to try it live?** The public
[supplier directory](https://search.buildquote.com.au/supplierdirectory) is
open to everyone, no account needed. The supplier dashboard and admin panel
aren't open self-serve — accounts are created manually to keep a lid on
potential misuse of a public directory listing. Email
[meliagrace@gmail.com](mailto:meliagrace@gmail.com) for a demo login, or fork
the repo and run it on your own infrastructure to try the full thing
yourself.

---

## Who this is for

### Suppliers
- Log in, manage your own profile and which product systems you're listed
  against (`/supplier/[slug]`).
- Get an embeddable widget for your own website — no code, just a token URL —
  showing your products with BuildQuote branding.
- Receive and manage incoming RFQs and enquiries in one inbox, plus a
  customer-review flow (`/supplier-review/[token]`).
- **Just this piece:** the widget alone (`/widget/[token]` or `/embed/[slug]`) is
  usable as an embed on a supplier's own site without them ever touching the
  dashboard.

### Manufacturers
- Not this repo's job directly — manufacturer catalogue data is authored in
  **[Data Studio](https://github.com/buildquoteau-jpg/BuildQuote-Manufacturer-Data-Studio)**.
  Trade Desk only reads it (read-only `manufacturers`, `systems`, `components`
  tables) to power supplier widgets and the directory.

### Builders
- Browse the public supplier directory
  ([`/supplierdirectory`](https://search.buildquote.com.au/supplierdirectory))
  to find a local supplier, then jump straight into an RFQ.
- **Just this piece:** the directory is public and unauthenticated — usable as a
  standalone "find a supplier" reference even without ever sending an RFQ.

### BuildQuote staff
- Admin panel (`/admin`) to create suppliers and assign widgets — the
  provisioning side of the portal.

---

## How the three BuildQuote repos fit together

```
Data Studio  ──publish──▶  Shared production Supabase  ◀──manage listing──  Trade Desk (this repo)
                                     │                          │
                                     ▼                          │
                         Build-Quote-Library-and-               │
                         Request-for-Quotation                  │
                         (buildquote.com.au)                    │
                         renders System Card, builder            │
                         picks a supplier from the ─────────────┘
                         Trade Desk directory, sends RFQ
                         → lands in supplier's Trade Desk inbox
```

- **Trade Desk → builder flow:** the supplier directory here is where a builder
  discovers who to send an RFQ to; the RFQ is composed and sent from
  buildquote.com.au, not from here.
- **Trade Desk ← Data Studio:** catalogue data (manufacturers/systems/components)
  used to build widgets and directory listings is authored in Data Studio and
  read here — never written here.
- **Trade Desk → suppliers' own sites:** the only outbound integration surface —
  widgets embedded on third-party supplier websites.

## Live product surfaces

- [buildquote.com.au](https://buildquote.com.au) — builder-facing app
- [buildquote.com.au/library](https://buildquote.com.au/library) — public product
  library (System Cards)
- [search.buildquote.com.au](https://search.buildquote.com.au) — this app
  (supplier directory + supplier/admin portal)
- [studio.buildquote.com.au](https://studio.buildquote.com.au) — manufacturer data
  ingestion (Data Studio)

---

## The invisible drawer, made visible

> ⚠️ **None of the current demo products have this feature turned on yet.**
> It's the newest layer of the System Card. Everything below is built from
> the real code (`buildSystemKnowledge.ts`), for a fictional product — BQ
> CladMax, from a fictional manufacturer, Southline Building Products — so
> nothing here is mistaken for real production data.

**Why this is built the way it is** — the things that actually matter if
you're grounding or training an agent on Australian building-material data:

- **Every fact traces to a source** — the exact document and page number,
  and for lower-confidence extractions, the verbatim quote it came from.
  Nothing is asserted without a citation trail.
- **Confidence and trust level on every fact** — `bq:trustLevel` and
  `bq:epistemicStatus` distinguish a manufacturer-verified fact from a raw
  AI extraction, so an agent (or the team building one) knows exactly how
  much weight to give each one.
- **Disputed facts are shipped, not hidden.** A fact under dispute (see the
  acoustic rating below) still appears in the agent-facing layer, correctly
  flagged, with an `answerPolicy` telling an agent to cite it as unconfirmed
  rather than silently disappearing or being asserted as fact.
- **Explicit negative constraints** — not just what a product does, but what
  it must never be used for and why (`bq:incompatibleWith`), and warranty
  conditions tied to specific installation requirements. This is exactly the
  kind of data that's usually locked inside a PDF, if it exists at all.
- **Standard vocabulary, not a private format** — schema.org where it
  fits, a documented `bq:` extension only where construction relationships
  have no standard equivalent (see `/ns/v1`).
- **An explicit data licence block** (`bq:dataLicence`) states exactly what
  an agent is and isn't allowed to do with the data — search, retrieval,
  training, redistribution — per product, not buried in a terms-of-service
  page somewhere else.

This is exactly what an AI agent receives when it reads this System Card —
every fact, its verification status, and where it came from. In the real
app (the **Agent Ready** tab), this shows as two panels: the JSON-LD itself
as a collapsible "layered reveal" tree — top level open, deeper nesting
folded away until clicked — and the same data again as human-readable
markdown underneath.

<details>
<summary><strong>JSON-LD (the actual blob)</strong> — layered reveal</summary>

```json
{
  "@context": "https://studio.buildquote.com.au/ns/v1",
  "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system",
  "@type": [
    "bq:ConstructionSystem",
    "Product"
  ],
  "bq:format": "buildquote-knowledge-object",
  "bq:formatVersion": "1.0",
  "bq:generatedAt": "2026-08-30T04:12:00.000Z",
  "bq:canonicalUrl": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system",
  "bq:customerCardUrl": "https://buildquote.com.au/library/southline-building-products/bq-cladmax-cladding-system",
  "name": "BQ CladMax Cladding System",
  "sku": "BQCM-SYS",
  "category": "Cladding > Fibre Cement",
  "description": "Vertically jointed fibre cement cladding system for residential and light commercial facades, available in standard and wide-board profiles with a factory-primed, paint-ready finish.",
  "manufacturer": {
    "@type": "Organization",
    "@id": "https://studio.buildquote.com.au/manufacturers/southline-building-products",
    "name": "Southline Building Products",
    "identifier": {
      "@type": "PropertyValue",
      "propertyID": "ABN",
      "value": "55 123 456 789"
    },
    "url": "https://southlinebp.example.com.au"
  },
  "bq:contains": [
    {
      "@type": [
        "bq:SystemProfile",
        "Product"
      ],
      "@id": "#profile-180",
      "name": "BQ CladMax 180 Board",
      "sku": "BQCM-180-3000",
      "bq:isPrimarySellableUnit": true,
      "length": {
        "@type": "QuantitativeValue",
        "value": 3000,
        "unitCode": "MMT"
      },
      "width": {
        "@type": "QuantitativeValue",
        "value": 180,
        "unitCode": "MMT"
      },
      "thickness": {
        "@type": "QuantitativeValue",
        "value": 8,
        "unitCode": "MMT"
      },
      "weight": {
        "@type": "QuantitativeValue",
        "value": 13.4,
        "unitCode": "KGM"
      },
      "bq:sellUnit": "each",
      "bq:supplierPack": {
        "quantity": 20,
        "unit": "boards/pack"
      }
    },
    {
      "@type": [
        "bq:SystemProfile",
        "Product"
      ],
      "@id": "#profile-300",
      "name": "BQ CladMax 300 Wide Board",
      "sku": "BQCM-300-3000",
      "bq:isPrimarySellableUnit": true,
      "length": {
        "@type": "QuantitativeValue",
        "value": 3000,
        "unitCode": "MMT"
      },
      "width": {
        "@type": "QuantitativeValue",
        "value": 300,
        "unitCode": "MMT"
      },
      "thickness": {
        "@type": "QuantitativeValue",
        "value": 8,
        "unitCode": "MMT"
      },
      "weight": {
        "@type": "QuantitativeValue",
        "value": 22.1,
        "unitCode": "KGM"
      },
      "bq:sellUnit": "each",
      "bq:supplierPack": {
        "quantity": 12,
        "unit": "boards/pack"
      }
    },
    {
      "@type": [
        "bq:SystemProfile",
        "Product"
      ],
      "@id": "#profile-soffit",
      "name": "BQ CladMax Soffit Lining 4.5mm",
      "sku": "BQCM-SOF-4500",
      "bq:isPrimarySellableUnit": true,
      "length": {
        "@type": "QuantitativeValue",
        "value": 1800,
        "unitCode": "MMT"
      },
      "width": {
        "@type": "QuantitativeValue",
        "value": 1200,
        "unitCode": "MMT"
      },
      "thickness": {
        "@type": "QuantitativeValue",
        "value": 4.5,
        "unitCode": "MMT"
      },
      "bq:sellUnit": "sheet"
    }
  ],
  "bq:requires": [
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-batten",
      "name": "BQ CladMax Vertical Jointing Batten",
      "sku": "BQCM-VJB-3000",
      "description": "Factory-grooved PVC jointing batten — sets the 8mm shadow-line joint.",
      "category": "Jointing",
      "bq:componentRole": "required"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-starter",
      "name": "BQ CladMax Starter Track",
      "sku": "BQCM-ST-3000",
      "description": "Base-of-wall aluminium starter track — sets the first board level and provides the required drainage gap.",
      "category": "Trim",
      "bq:componentRole": "required"
    }
  ],
  "bq:optionalComponent": [
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-cornerext",
      "name": "BQ CladMax External Corner Trim",
      "sku": "BQCM-COE-3000",
      "category": "Trim",
      "bq:componentRole": "optional"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-cornerint",
      "name": "BQ CladMax Internal Corner Trim",
      "sku": "BQCM-COI-3000",
      "category": "Trim",
      "bq:componentRole": "optional"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-controljoint",
      "name": "BQ CladMax Vertical Control Joint",
      "sku": "BQCM-CJ-3000",
      "description": "Required at maximum 6m board runs to accommodate movement.",
      "category": "Trim",
      "bq:componentRole": "optional"
    }
  ],
  "bq:accessory": [
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-fixings",
      "name": "BQ CladMax Stainless Fixings (500pk)",
      "sku": "BQCM-FIX-500",
      "category": "Fixings",
      "bq:componentRole": "accessory"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-sealant",
      "name": "BQ CladMax Paintable Sealant",
      "sku": "BQCM-SEAL-600",
      "description": "UV-stable, paintable polyurethane sealant for joints and trims.",
      "category": "Sealant",
      "bq:componentRole": "accessory"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-blade",
      "name": "BQ CladMax Diamond-Tipped Cutting Blade",
      "sku": "BQCM-BLADE-165",
      "description": "Required cutting blade — polycrystalline diamond tip rated for fibre cement.",
      "category": "Tool",
      "bq:componentRole": "accessory"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-shroud",
      "name": "BQ CladMax Dust Extraction Shroud",
      "sku": "BQCM-SHRD-01",
      "description": "On-tool dust extraction shroud — mandatory for compliant silica dust control when cutting.",
      "category": "Tool",
      "bq:componentRole": "accessory"
    },
    {
      "@type": [
        "bq:Component",
        "Product"
      ],
      "@id": "#comp-touchup",
      "name": "BQ CladMax Touch-Up Paint (custom match)",
      "sku": "BQCM-TU-250",
      "category": "Finishing",
      "bq:componentRole": "accessory"
    }
  ],
  "bq:finishOption": [
    {
      "@type": "bq:FinishOption",
      "name": "Surfmist",
      "sku": "-SFM",
      "bq:isStocked": true
    },
    {
      "@type": "bq:FinishOption",
      "name": "Monument",
      "sku": "-MON",
      "bq:isStocked": true
    },
    {
      "@type": "bq:FinishOption",
      "name": "Dune",
      "sku": "-DUN",
      "bq:isStocked": true
    },
    {
      "@type": "bq:FinishOption",
      "name": "Custom colour match (paint-to-order)",
      "sku": "-CUSTOM",
      "bq:isStocked": false
    }
  ],
  "bq:compatibleWith": [
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-timberframe-batten-system",
        "name": "BQ TimberFrame Batten System"
      },
      "bq:note": "Standard cavity-batten substrate for this system.",
      "bq:epistemicStatus": "manufacturer_verified"
    },
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@type": "Product",
        "name": "Standard 90x45mm timber wall framing, F5/MGP10, studs at 450mm or 600mm centres",
        "bq:targetKind": "substrate"
      },
      "bq:note": "Direct compatibility per span tables in the install guide.",
      "bq:epistemicStatus": "manufacturer_verified"
    },
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@type": "Product",
        "name": "Light steel wall framing, 0.55mm BMT or heavier",
        "bq:targetKind": "substrate"
      },
      "bq:epistemicStatus": "manufacturer_verified"
    }
  ],
  "bq:incompatibleWith": [
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@type": "Product",
        "name": "Generic non-BQ jointing battens",
        "bq:targetKind": "component"
      },
      "bq:reason": "Board spacing and shadow-line tolerance are calibrated to the BQ CladMax batten profile only.",
      "bq:note": "Using a substitute batten voids the structural warranty.",
      "bq:epistemicStatus": "manufacturer_verified"
    },
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@type": "Product",
        "name": "Direct fixing to masonry or concrete with no cavity batten",
        "bq:targetKind": "installation_method"
      },
      "bq:reason": "System requires a ventilated cavity behind the board — direct-fix to a solid substrate traps moisture.",
      "bq:epistemicStatus": "manufacturer_verified"
    },
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@type": "Product",
        "name": "Permanent or below-ground-level ground contact",
        "bq:targetKind": "application"
      },
      "bq:reason": "Not rated for continuous moisture exposure or soil contact.",
      "bq:epistemicStatus": "manufacturer_verified"
    },
    {
      "@type": "bq:ProductRelationship",
      "bq:target": {
        "@type": "Product",
        "name": "Use as a structural bracing element",
        "bq:targetKind": "application"
      },
      "bq:reason": "BQ CladMax is a non-structural cladding product; it does not contribute to a wall's racking/bracing capacity.",
      "bq:epistemicStatus": "manufacturer_verified"
    }
  ],
  "bq:documentedBy": [
    {
      "@id": "#doc-design-guide",
      "@type": [
        "bq:SourceDocument",
        "DigitalDocument"
      ],
      "name": "Design guide",
      "bq:documentRole": "design_guide",
      "url": "https://southlinebp.example.com.au/bq-cladmax/design-guide.pdf"
    },
    {
      "@id": "#doc-tds",
      "@type": [
        "bq:SourceDocument",
        "DigitalDocument"
      ],
      "name": "Technical data sheet",
      "bq:documentRole": "tech_data",
      "url": "https://southlinebp.example.com.au/bq-cladmax/tds.pdf"
    },
    {
      "@id": "#doc-install-guide",
      "@type": [
        "bq:SourceDocument",
        "DigitalDocument"
      ],
      "name": "Installation guide",
      "bq:documentRole": "install_guide",
      "url": "https://southlinebp.example.com.au/bq-cladmax/install-guide.pdf"
    },
    {
      "@id": "#doc-warranty",
      "@type": [
        "bq:SourceDocument",
        "DigitalDocument"
      ],
      "name": "Warranty terms",
      "bq:documentRole": "warranty",
      "url": "https://southlinebp.example.com.au/bq-cladmax/warranty.pdf"
    }
  ],
  "bq:coverage": {
    "standards": "not_yet_captured — no standards data model yet"
  },
  "bq:knowledgeGaps": [
    {
      "@type": "bq:KnowledgeGap",
      "bq:about": "bq:acousticRating",
      "bq:status": "disputed",
      "bq:reason": "Flagged incorrect by the manufacturer pending an updated third-party acoustic test report; not stated pending resolution."
    }
  ],
  "bq:assertions": [
    {
      "@id": "fact:bq-cladmax-001",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:fireRating",
      "bq:objectValue": "Non-combustible (AS1530.1)",
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      },
      "bq:confidence": 0.97,
      "bq:evidence": [
        {
          "@type": "bq:EvidenceReference",
          "bq:document": {
            "@id": "#doc-tds"
          },
          "bq:pageStart": 4
        }
      ]
    },
    {
      "@id": "fact:bq-cladmax-002",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:balRating",
      "bq:objectValue": "BAL-40",
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      }
    },
    {
      "@id": "fact:bq-cladmax-003",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:structuralGrade",
      "bq:objectValue": "N3 (AS4055) with framing at 600mm centres",
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      }
    },
    {
      "@id": "fact:bq-cladmax-004",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:moistureResistant",
      "bq:objectValue": true,
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      }
    },
    {
      "@id": "fact:bq-cladmax-005",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:countryOfOrigin",
      "bq:objectValue": true,
      "bq:origin": "manufacturer_supplied",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      }
    },
    {
      "@id": "fact:bq-cladmax-006",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:acousticRating",
      "bq:objectValue": "Rw 45 (with 90mm insulated stud cavity)",
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "disputed",
      "bq:trustLevel": "extracted",
      "bq:confidence": 0.62,
      "bq:evidence": [
        {
          "@type": "bq:EvidenceReference",
          "bq:document": {
            "@id": "#doc-tds"
          },
          "bq:pageStart": 9,
          "bq:quote": "Acoustic performance: Rw 45 when installed over a 90mm insulated stud cavity (indicative, third-party retest pending)."
        }
      ]
    },
    {
      "@id": "fact:bq-cladmax-007",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:warrantyCondition",
      "bq:objectValue": {
        "value": "25-year structural warranty, 15-year finish warranty",
        "condition": "Warranty is voided if the system is installed without the BQ CladMax Starter Track and Vertical Jointing Batten, or if installed other than in accordance with the current BQ CladMax Installation Guide."
      },
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      },
      "bq:evidence": [
        {
          "@type": "bq:EvidenceReference",
          "bq:document": {
            "@id": "#doc-warranty"
          },
          "bq:pageStart": 1
        }
      ]
    },
    {
      "@id": "fact:bq-cladmax-008",
      "@type": [
        "bq:Assertion",
        "prov:Entity"
      ],
      "bq:subject": {
        "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
      },
      "bq:predicate": "bq:cuttingRequirement",
      "bq:objectValue": {
        "value": "Must be cut using a diamond-tipped blade with on-tool dust extraction (BQ CladMax Cutting Blade + Dust Extraction Shroud).",
        "condition": "Cutting without dust extraction breaches respirable crystalline silica (RCS) safety requirements and is not a supported installation method."
      },
      "bq:origin": "document_extracted",
      "bq:epistemicStatus": "manufacturer_verified",
      "bq:trustLevel": "verified",
      "bq:verifiedBy": {
        "name": "Southline Building Products"
      }
    }
  ],
  "bq:knowledge": {
    "bq:knowledgeVersion": "1.0",
    "bq:retrievalEnabled": true,
    "bq:atomicAssertions": [
      {
        "@id": "https://studio.buildquote.com.au/id/assertion/bq-cladmax-001",
        "@type": "bq:AtomicAssertion",
        "bq:system": {
          "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
        },
        "bq:manufacturer": {
          "@id": "https://studio.buildquote.com.au/manufacturers/southline-building-products"
        },
        "bq:subject": "BQ CladMax Cladding System",
        "bq:claim": "Fire rating: Non-combustible (AS1530.1).",
        "bq:claimType": "performance_claim",
        "bq:value": "Non-combustible (AS1530.1)",
        "bq:epistemicStatus": "manufacturer_verified",
        "bq:trustLevel": "verified",
        "bq:answerPolicy": "answer_with_source",
        "bq:retrievalText": "BQ CladMax Cladding System (Southline Building Products). Fire rating: Non-combustible (AS1530.1). Manufacturer verified.",
        "bq:canonicalAssertion": {
          "@id": "fact:bq-cladmax-001"
        },
        "bq:sourceSummary": {
          "documentName": "Technical data sheet",
          "page": 4,
          "verifiedBy": "Southline Building Products",
          "verifiedAt": "2026-07-14T00:00:00.000Z"
        }
      },
      {
        "@id": "https://studio.buildquote.com.au/id/assertion/bq-cladmax-006",
        "@type": "bq:AtomicAssertion",
        "bq:system": {
          "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
        },
        "bq:manufacturer": {
          "@id": "https://studio.buildquote.com.au/manufacturers/southline-building-products"
        },
        "bq:subject": "BQ CladMax Cladding System",
        "bq:claim": "Acoustic rating: Rw 45 (with 90mm insulated stud cavity).",
        "bq:claimType": "performance_claim",
        "bq:value": "Rw 45 (with 90mm insulated stud cavity)",
        "bq:epistemicStatus": "disputed",
        "bq:trustLevel": "extracted",
        "bq:confidence": 0.62,
        "bq:answerPolicy": "flag_uncertain",
        "bq:sourceSummary": {
          "documentName": "Technical data sheet",
          "page": 9,
          "verifiedBy": null,
          "verifiedAt": null
        },
        "bq:retrievalText": "BQ CladMax Cladding System (Southline Building Products). Acoustic rating: Rw 45 (with 90mm insulated stud cavity). Disputed by the manufacturer pending an updated third-party test report -- cite as unconfirmed, not as a verified rating.",
        "bq:canonicalAssertion": {
          "@id": "fact:bq-cladmax-006"
        }
      },
      {
        "@id": "https://studio.buildquote.com.au/id/assertion/bq-cladmax-007",
        "@type": "bq:AtomicAssertion",
        "bq:system": {
          "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
        },
        "bq:manufacturer": {
          "@id": "https://studio.buildquote.com.au/manufacturers/southline-building-products"
        },
        "bq:subject": "BQ CladMax Cladding System",
        "bq:claim": "Warranty condition: 25-year structural warranty, 15-year finish warranty.",
        "bq:claimType": "manufacturer_statement",
        "bq:value": {
          "value": "25-year structural warranty, 15-year finish warranty"
        },
        "bq:epistemicStatus": "manufacturer_verified",
        "bq:trustLevel": "verified",
        "bq:answerPolicy": "answer_with_source",
        "bq:conditions": [
          "Warranty is voided if installed without the BQ CladMax Starter Track and Vertical Jointing Batten, or other than per the current Installation Guide."
        ],
        "bq:retrievalText": "BQ CladMax Cladding System (Southline Building Products). Warranty condition: 25-year structural warranty, 15-year finish warranty. Warranty is voided if installed without the BQ CladMax Starter Track and Vertical Jointing Batten, or other than per the current Installation Guide. Manufacturer verified.",
        "bq:canonicalAssertion": {
          "@id": "fact:bq-cladmax-007"
        },
        "bq:sourceSummary": {
          "documentName": "Warranty terms",
          "page": 1,
          "verifiedBy": "Southline Building Products",
          "verifiedAt": "2026-07-14T00:00:00.000Z"
        }
      },
      {
        "@id": "https://studio.buildquote.com.au/id/assertion/bq-cladmax-008",
        "@type": "bq:AtomicAssertion",
        "bq:system": {
          "@id": "https://studio.buildquote.com.au/cards/southline-building-products/bq-cladmax-cladding-system"
        },
        "bq:manufacturer": {
          "@id": "https://studio.buildquote.com.au/manufacturers/southline-building-products"
        },
        "bq:subject": "BQ CladMax Cladding System",
        "bq:claim": "Cutting requirement: diamond-tipped blade with on-tool dust extraction.",
        "bq:claimType": "installation_requirement",
        "bq:value": {
          "value": "Must be cut using a diamond-tipped blade with on-tool dust extraction."
        },
        "bq:epistemicStatus": "manufacturer_verified",
        "bq:trustLevel": "verified",
        "bq:answerPolicy": "answer_with_source",
        "bq:conditions": [
          "Cutting without dust extraction breaches RCS safety requirements and is not a supported installation method."
        ],
        "bq:retrievalText": "BQ CladMax Cladding System (Southline Building Products). Cutting requirement: diamond-tipped blade with on-tool dust extraction. Cutting without dust extraction breaches RCS safety requirements and is not a supported installation method. Manufacturer verified.",
        "bq:canonicalAssertion": {
          "@id": "fact:bq-cladmax-008"
        }
      }
    ],
    "bq:retrievalDocuments": [
      {
        "@id": "https://studio.buildquote.com.au/api/cards/bq-cladmax-cladding-system/retrieval/performance_claim",
        "bq:type": "performance_claim",
        "bq:title": "BQ CladMax Cladding System — performance claim",
        "bq:text": "BQ CladMax Cladding System (Southline Building Products). Fire rating: Non-combustible (AS1530.1). Bushfire Attack Level: BAL-40. Structural grade: N3 (AS4055) with framing at 600mm centres. Moisture resistant: true."
      },
      {
        "@id": "https://studio.buildquote.com.au/api/cards/bq-cladmax-cladding-system/retrieval/document/install-guide",
        "bq:type": "install_guide",
        "bq:title": "BQ CladMax Cladding System — Installation guide",
        "bq:text": "BQ CladMax Cladding System (Southline Building Products). Installation guide: covers substrate preparation, batten and starter track layout, board fixing schedule, cutting and dust control requirements, jointing and sealant detailing, and warranty-affecting installation conditions."
      }
    ],
    "bq:queryTerms": [
      {
        "concept": "fire rating",
        "synonyms": [
          "fire resistance",
          "non-combustible rating",
          "AS1530"
        ]
      },
      {
        "concept": "bushfire attack level",
        "synonyms": [
          "BAL rating",
          "bushfire rating"
        ]
      },
      {
        "concept": "warranty",
        "synonyms": [
          "guarantee",
          "warranty terms",
          "warranty conditions"
        ]
      }
    ]
  },
  "bq:dataLicence": {
    "status": "granted",
    "permissions": {
      "publicSearch": true,
      "aiRetrieval": true,
      "aiTraining": true,
      "commercialRedistribution": false,
      "benchmarking": true
    }
  },
  "bq:usageNote": "Facts without epistemicStatus manufacturer_verified or manufacturer_corrected are BuildQuote extractions and must be attributed as such, not presented as manufacturer statements. This example has aiRetrieval and publicSearch enabled to demonstrate full agent-searchability -- commercialRedistribution stays false, matching how a real manufacturer's licence would typically be granted. BQ CladMax and Southline Building Products are fictional, used solely to illustrate the knowledge object's shape."
}
```

</details>

<details>
<summary><strong>Markdown</strong> (same information, human-readable)</summary>

```markdown
# BQ CladMax Cladding System
Southline Building Products

## Identity
- SKU: BQCM-SYS
- Category: Cladding > Fibre Cement
- Vertically jointed fibre cement cladding system for residential and light
  commercial facades, available in standard and wide-board profiles with a
  factory-primed, paint-ready finish.

## Profiles
- BQ CladMax 180 Board (BQCM-180-3000) — 3000 x 180 x 8mm, 13.4kg
- BQ CladMax 300 Wide Board (BQCM-300-3000) — 3000 x 300 x 8mm, 22.1kg
- BQ CladMax Soffit Lining 4.5mm (BQCM-SOF-4500) — 1800 x 1200 x 4.5mm

## Required components
- BQ CladMax Vertical Jointing Batten (BQCM-VJB-3000)
- BQ CladMax Starter Track (BQCM-ST-3000)

## Optional / accessories
- External & internal corner trim, vertical control joint
- Stainless fixings, paintable sealant, touch-up paint
- Diamond-tipped cutting blade + dust extraction shroud (required for cutting)

## Finishes
Surfmist, Monument, Dune, custom colour match (paint-to-order)

## Verified facts (source-cited)
- Fire rating: Non-combustible (AS1530.1) — manufacturer verified,
  confidence 0.97, Technical data sheet p.4
- Bushfire Attack Level: BAL-40 — manufacturer verified
- Structural grade: N3 (AS4055) at 600mm centres — manufacturer verified
- Moisture resistant: true — manufacturer verified
- Australian made: true — manufacturer verified
- Acoustic rating: Rw 45 (90mm insulated cavity) — **disputed**, confidence
  0.62, pending an updated third-party test report. Quoted verbatim from
  Technical data sheet p.9, not presented as a confirmed rating.

## Warranty condition (source-cited)
25-year structural / 15-year finish warranty — voided if installed without
the Starter Track and Vertical Jointing Batten, or other than per the
current Installation Guide. Warranty terms p.1.

## Cutting requirement
Must be cut with a diamond-tipped blade and on-tool dust extraction —
cutting without dust extraction breaches RCS safety requirements.

## Compatible with
BQ TimberFrame Batten System · standard 90x45mm timber framing (F5/MGP10)
at 450/600mm centres · light steel framing (0.55mm BMT+)

## Not compatible with
- Generic non-BQ jointing battens — voids the structural warranty
- Direct fixing to masonry/concrete with no cavity batten
- Permanent or below-ground-level ground contact
- Use as a structural bracing element

## Documents
Design guide · Technical data sheet · Installation guide · Warranty terms
```

</details>

<details>
<summary><strong>Markdown</strong> (same information, human-readable)</summary>

```markdown
# BQ CladMax Cladding System
Southline Building Products

## Identity
- SKU: BQCM-SYS
- Category: Cladding > Fibre Cement
- Vertically jointed fibre cement cladding system for residential and light
  commercial facades, available in standard and wide-board profiles with a
  factory-primed, paint-ready finish.

## Profiles
- BQ CladMax 180 Board (BQCM-180-3000) — 3000 x 180 x 8mm, 13.4kg
- BQ CladMax 300 Wide Board (BQCM-300-3000) — 3000 x 300 x 8mm, 22.1kg
- BQ CladMax Soffit Lining 4.5mm (BQCM-SOF-4500) — 1800 x 1200 x 4.5mm

## Required components
- BQ CladMax Vertical Jointing Batten (BQCM-VJB-3000)
- BQ CladMax Starter Track (BQCM-ST-3000)

## Optional / accessories
- External & internal corner trim, vertical control joint
- Stainless fixings, paintable sealant, touch-up paint
- Diamond-tipped cutting blade + dust extraction shroud (required for cutting)

## Finishes
Surfmist, Monument, Dune, custom colour match (paint-to-order)

## Verified facts
- Fire rating: Non-combustible (AS1530.1) — manufacturer verified
- Bushfire Attack Level: BAL-40 — manufacturer verified
- Structural grade: N3 (AS4055) at 600mm centres — manufacturer verified
- Moisture resistant: true — manufacturer verified
- Australian made: true — manufacturer verified
- Acoustic rating: Rw 45 (90mm insulated cavity) — disputed, pending an
  updated third-party test report

## Warranty condition
25-year structural / 15-year finish warranty — voided if installed without
the Starter Track and Vertical Jointing Batten, or other than per the
current Installation Guide.

## Cutting requirement
Must be cut with a diamond-tipped blade and on-tool dust extraction —
cutting without dust extraction breaches RCS safety requirements.

## Compatible with
BQ TimberFrame Batten System · standard 90x45mm timber framing (F5/MGP10)
at 450/600mm centres · light steel framing (0.55mm BMT+)

## Not compatible with
- Generic non-BQ jointing battens — voids the structural warranty
- Direct fixing to masonry/concrete with no cavity batten
- Permanent or below-ground-level ground contact
- Use as a structural bracing element

## Documents
Design guide · Technical data sheet · Installation guide · Warranty terms
```

</details>

---

## Stack

- Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS
- Supabase Auth + Supabase DB (shared production project)
- Resend — transactional email (RFQ / review notifications)

## Setup

```bash
npm install
npm run dev -- -p 3001   # buildquote usually holds :3000
```

Env vars — see [`CLAUDE.md`](CLAUDE.md#environment-variables) for the full table;
notably `RESEND_API_KEY` is required at build time (the Resend client is
instantiated at module load). Before pushing: `npx tsc --noEmit && npm run build`.

Copy [`.env.example`](.env.example) → `.env.local` and fill in values. **Never
commit real Supabase or Resend keys.**

---

## Open source status

- **License:** [MIT](LICENSE) — free to use, modify, and redistribute, no
  restrictions. If you do use any part of this, a heads-up to
  [meliagrace@gmail.com](mailto:meliagrace@gmail.com) is genuinely
  appreciated (not required — see [`LICENSE`](LICENSE)).
- **Secrets:** a pattern scan of tracked files found no committed API keys /
  service-role keys / JWTs at time of writing. A full manual audit of git
  history is still recommended before relying on this scan alone.
