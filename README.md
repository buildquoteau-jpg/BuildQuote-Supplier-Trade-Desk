# BuildQuote Trade Desk

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
  **Data Studio**. Trade Desk only reads it (read-only `manufacturers`, `systems`,
  `components` tables) to power supplier widgets and the directory.

### Builders
- Browse the public supplier directory (`/supplierdirectory`) to find a local
  supplier, then jump straight into an RFQ.
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

**Never commit real Supabase or Resend keys.** This repo has no `.env.example`
yet — see Open source status below.

---

## Open source status

- **License:** not yet chosen — **TODO**. Until a `LICENSE` file with a real
  license is added, standard copyright applies (no reuse rights are granted). See
  [`LICENSE`](LICENSE).
- **Secrets:** a pattern scan of tracked files found no committed API keys /
  service-role keys / JWTs at time of writing. No `.env.example` exists yet —
  add one (variable names only, no values) before treating this as a
  self-host-ready open-source repo. A full manual audit of git history is still
  recommended before relying on this scan alone.
