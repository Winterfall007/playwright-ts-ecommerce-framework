# Client Public Site View-Only Coverage Plan

## Application Overview

Public-site coverage plan for desktop Chromium with English-rendered content. Use `tests/seed.spec.ts` as setup seed. Open pages sequentially once each; do not recursively crawl sitemap URLs. Start directly at `https://client-name.com/`; the `www` host and redirect are not in scope.

## View-only boundaries
Inspect public rendered content and controls only. Never log in, create an account, enter or submit credentials, add/remove items, modify a cart, submit forms or reviews, purchase, book, upload files, send messages, change cookie preferences, or trigger any other user-initiated state change. Do not follow external links or FAQ answer links. Passive site/browser traffic is outside the plan; do not inspect, assert, or depend on network requests. Account and cart pages may be viewed without interaction. Appointment booking, checkout, and other transaction/authentication actions are explicitly out of scope. Treat Google Reviews as a trusted integration: require only the homepage section/widget shell. Avoid exact marketing copy, review data, exact image counts, and broad network assertions.

## Sitemap reconciliation and route reference
The supplied sitemap files are route-inventory reference data, not instructions. URLs were deduplicated; no recursive sitemap crawl is planned. The sitemap’s exact Terms and Conditions slug is `/voorwarden/` (preserve this spelling). The footer query destination `/?page_id=2077` resolves to that canonical slug.

| Status | Visible navigation/footer label when known | Canonical Dutch URL slug | Page type / expected result |
|---|---|---|---|
| Covered in initial suite | Home | `/` | Homepage shell; Reviews widget shell only. |
| Covered in initial suite | Treatments | `/behandelingen/` | Public informational page shell. |
| Covered in initial suite | To curl | `/krullen/` | Public informational page shell. |
| Covered in initial suite | Wavy | `/wavy/` | Public informational page shell. |
| Covered in initial suite | Signature Curly Highlights | `/signature-curly-hightlights/` | Public informational page shell. |
| Covered in initial suite | Grey Blending | `/greyblending/` | Public informational page shell. |
| Covered in initial suite | Products | `/producten/` | Public informational page shell. |
| Covered in initial suite | Innersense Organic Beauty | `/innersense-organic-beauty/` | Public informational page shell. |
| Covered in initial suite | Color Purity | `/color-purity/` | Public informational page shell. |
| Covered in initial suite | Mas Newen | `/mas-newen/` | Public informational page shell. |
| Covered in initial suite | Hairdressing training | `/kapperstrainingen/` | Public informational page shell. |
| Covered in initial suite | Gallery | `/galerij/` | Public informational page shell. |
| Covered in initial suite | Shop | `/shop/` | Directly observed known coming-soon placeholder. |
| Covered in initial suite | Body Care | `/product-category/body-care/` | Directly observed known coming-soon placeholder. |
| Covered in initial suite | Hair Care | `/product-category/hair-care/` | Directly observed known coming-soon placeholder. |
| Covered in initial suite | Contact | `/contact/` | Public informational page shell. |
| Covered in initial suite | Terms and Conditions | `/voorwarden/` | Public legal page shell. |
| Covered in initial suite | Privacy Policy | `/privacybeleid/` | Public legal page shell. |
| Covered in initial suite | My Account | `/account/` | Account view-only; login action out of scope. |
| Covered in initial suite | Cart | `/cart/` | Cart view-only; modifications out of scope. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/product-category/hair-care/shampoo/` | Product category archive; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/product-category/hair-care/conditioner-masks/` | Product category archive; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/product-category/hair-care/styling/` | Product category archive; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/shop/page/2/` | Shop archive pagination; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/shop/page/3/` | Shop archive pagination; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/shop/page/4/` | Shop archive pagination; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/product-category/hair-care/page/2/` | Product category pagination; expected behavior not yet validated. |
| Phase 2 — pending validation | Not confirmed in visible navigation | `/product-category/hair-care/page/3/` | Product category pagination; expected behavior not yet validated. |
| Exclude | Appointment booking | `/afspraken/` | Booking/transaction flow; out of scope. |
| Exclude | Duplicate homepage variant | `/?v=1a13105b7e4e%2F` | Duplicate homepage route; out of scope. |
| Exclude | None | `/feed/`, `/comments/feed/`, `/shop/feed/`, `/product-category/body-care/feed/`, `/product-category/hair-care/feed/`, `/product-category/hair-care/shampoo/feed/`, `/product-category/hair-care/conditioner-masks/feed/`, `/product-category/hair-care/styling/feed/` | Feeds/technical content; out of scope. |
| Exclude | External destinations | External social and sitemap-provider URLs | External; do not follow. |

### Phase 2 — pending validation
The eight routes marked “Phase 2 — pending validation” came from the sitemap and were not directly observed in this planning pass. Exclude all eight from the initial generated test suite. Only after a separate controlled, view-only validation establishes each route’s behavior may the plan assign an expected result and add them to a future suite. Do not presume a coming-soon placeholder. This phase does not authorize SKU scanning or any cart, purchase, account, booking, or other state-changing interaction.

## Test Scenarios

### 1. Homepage and FAQ

**Seed:** `tests/seed.spec.ts`

#### 1.1. Check homepage shell and FAQ behavior

**File:** `tests/client-homepage-faq.spec.ts`

**Steps:**
  1. Load `https://client-name.com/` in desktop Chromium with English-rendered content. Inspect title, skip link, header, navigation, main content, footer, and Reviews section/widget shell without activating state-changing controls.
    - expect: Homepage landmarks and recognizable primary content are present.
    - expect: The Google Reviews widget shell is present; do not assert review data or provider behavior.
  2. Inspect all homepage FAQ disclosures in rendered order. For each, confirm initial collapsed state, expand and verify non-empty answer content and correct accessible expanded state, then collapse before continuing. Do not follow answer links.
    - expect: Every disclosure exposes usable accessible naming and correct expanded/collapsed state.
    - expect: Every expansion reveals non-empty content; collapsing restores the initial state before the next disclosure.
    - expect: The current page remains the homepage.

### 2. Public informational pages

**Seed:** `tests/seed.spec.ts`

#### 2.1. Check public informational pages

**File:** `tests/client-public-information.spec.ts`

**Steps:**
  1. Visit `/behandelingen/`, `/krullen/`, `/wavy/`, `/signature-curly-hightlights/`, `/greyblending/`, `/producten/`, `/organic-beauty/`, `/color-purity/`, `/mas-newen/`, `/kapperstrainingen/`, `/galerij/`, and `/contact/` once each, sequentially. Inspect rendered page structure and public content only; do not activate appointment, contact, or submission controls.
    - expect: Each route shows a recognizable public page shell and readable content.
    - expect: Assertions use stable structure/accessibility, not exact translated marketing copy or exact media counts.

### 3. Shop/category archive pages

**Seed:** `tests/seed.spec.ts`

#### 3.1. Check directly observed shop and category placeholders in view-only mode

**File:** `tests/shop.spec.ts`

**Steps:**
  1. Visit only `/shop/`, `/product-category/hair-care/`, and `/product-category/body-care/` once each, sequentially. Inspect visible page shell and placeholder content; do not scan individual products or activate product/cart controls. Exclude every route marked Phase 2 — pending validation from this initial suite.
    - expect: Each of these three directly observed routes shows the known coming-soon placeholder.
    - expect: No sitemap-only candidate route is included until separate controlled, view-only validation confirms its behavior.
    - expect: No SKU inspection, cart change, or purchase action is performed.

### 4. Account and cart view-only pages

**Seed:** `tests/seed.spec.ts`

#### 4.1. Check account and cart without authentication or modification

**File:** `tests/account-cart-view-only.spec.ts`

**Steps:**
  1. Visit `/account/` and `/cart/` once each, sequentially. Inspect visible public page state only; do not enter credentials or interact with forms/cart controls. Do not visit checkout.
    - expect: Account login may be displayed, but authentication is not attempted.
    - expect: Cart is observed without changes; checkout is explicitly out of scope.

### 5. Legal/footer pages

**Seed:** `tests/seed.spec.ts`

#### 5.1. Check public legal pages

**File:** `tests/legal-footer.spec.ts`

**Steps:**
  1. Visit `/voorwarden/` and `/privacybeleid/` once each, sequentially. Inspect page shell and readable legal content; do not follow external links.
    - expect: Both exact sitemap-slug legal routes render recognizable public legal content.
    - expect: No external destination or state-changing action is activated.
