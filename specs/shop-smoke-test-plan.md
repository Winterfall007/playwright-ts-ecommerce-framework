# WooCommerce Shop Smoke Test Plan

## Application Overview

Plan for rebuilding tests/shop.spec.ts in Playwright. Run in Chromium through the existing authenticated setup (playwright.config.ts depends on tests/auth.setup.ts and uses the configured staging storage state). Start every test with a clean cart; keep all cart activity to add/verify/remove only and never visit Checkout. During planning, /shop/ exposed Body Care and Hair Care; Body Care rendered product cards including one Read more card whose parent was marked instock, while Hair Care rendered subcategory tiles rather than product cards. Hair Care's Shampoo leaf rendered available products and pagination. These live observations conflict with parts of the stated contract, so tests should report the discrepancies rather than silently walking around the primary-category requirement.

## Test Scenarios

### 1. Authenticated WooCommerce shop smoke tests

**Seed:** `tests/seed.spec.ts`

#### 1.1. Verify Shop categories and product availability markup

**File:** `tests/shop.spec.ts`

**Steps:**
  1. Start from the authenticated Playwright project with no cart assumptions. Visit /shop/ and locate the Body Care and Hair Care category links by their category hrefs or accessible link names, scoped to the category-card list where possible.
    - expect: The Shop page renders both Body Care and Hair Care category links.
  2. Open each category using its canonical category link (Body Care and Hair Care) and inspect the product list. Count only product cards such as ul.products > li.product that are not category tiles; distinguish product cards from li.product-category.
    - expect: Each main category page displays a product grid as specified by the business rule. A page that displays only nested category tiles is a contract failure, not a reason to report a passing product-grid check.
    - expect: For each card, available products have a.add_to_cart_button and unavailable cards use the Read More / Lees meer link. Cards identified as unavailable have .outofstock and do not have a.add_to_cart_button.
    - expect: A Read More / Lees meer card without .outofstock is reported as an availability-markup inconsistency.
  3. Use stable, scoped locators: category links by /product-category/body-care/ and /product-category/hair-care/ href; product cards by ul.products > li.product:not(.product-category); availability by the card's .outofstock class and descendant a.add_to_cart_button; Read More / Lees meer by a.button with a case-insensitive accessible-name regular expression.
    - expect: Selectors do not accidentally treat category tiles as products or match unrelated navigation and recommendation links.

#### 1.2. Add the same randomly selected available product from grid and product detail

**File:** `tests/shop.spec.ts`

**Steps:**
  1. Visit /cart/ and establish a clean baseline by removing all existing cart rows through their visible remove controls, waiting for each update, then asserting the cart-empty state. Use the same reset before and after the scenario so this test is independent of test order or a prior authenticated cart session.
    - expect: The cart is empty before the product is selected. Cleanup only removes items; no checkout or order submission is attempted.
  2. Visit the main category pages and collect eligible product cards only from product grids (exclude .product-category cards). Build candidates from cards that contain a.add_to_cart_button and are not .outofstock, retaining the product name and the product-detail href from the card's title/loop-product link. Choose one candidate randomly and keep that exact name and href for the remainder of the test.
    - expect: At least one available product candidate exists; fail with a clear message if none exists instead of silently returning or passing.
    - expect: The randomly selected item is a real product card with an Add to Cart action, not an unavailable item or category tile.
  3. From the selected card, click its descendant a.add_to_cart_button (WooCommerce grid action). Wait for the add-to-cart operation to settle, then visit /cart/.
    - expect: The cart contains exactly the selected product as a cart line, with quantity 1 and the expected product name. Assert the matching cart row, not merely that the cart is non-empty.
    - expect: No Checkout link or button is activated.
  4. Remove the selected cart row, wait for the cart update, and assert the empty-cart state before continuing. Navigate to the stored product-detail href for that same item.
    - expect: The cart is empty between the grid and product-detail add-to-cart attempts.
    - expect: The product detail page belongs to the same selected product and its primary product purchase form contains the visible, enabled button.single_add_to_cart_button. Scope the locator to the primary product summary/form so related-product buttons cannot satisfy the check.
  5. Click the primary product form's button.single_add_to_cart_button, then visit /cart/ after the operation settles.
    - expect: The cart again contains exactly the same selected product with quantity 1.
    - expect: The workflow stops at cart verification; it never proceeds to Checkout.
  6. Remove the cart row and assert the empty-cart state, including in test cleanup if an assertion fails after cart setup.
    - expect: The test leaves no cart item behind for subsequent tests.

#### 1.3. Follow an unavailable product Read More link and reject product-page Add to Cart

**File:** `tests/shop.spec.ts`

**Steps:**
  1. Start with an empty cart. Inspect product cards on the main category routes (and their visible product-bearing category/pagination routes only where needed to locate actual product cards). Select an unavailable candidate marked .outofstock; if no such card exists but a card has a Read More / Lees meer action and no a.add_to_cart_button, use that card as a diagnostic candidate so the negative product-page check still runs.
    - expect: If there are no .outofstock cards and no Read More / Lees meer non-purchasable cards anywhere in the inspected category grids, mark this scenario skipped with an explicit reason: no unavailable product is currently present.
    - expect: When a Read More / Lees meer card exists without .outofstock, record that as a failure of the stated category availability contract, but continue to the product detail check rather than masking the negative-flow coverage.
  2. Within the selected card, assert there is no a.add_to_cart_button and locate the Read More / Lees meer link using a case-insensitive accessible-name matcher. Save its href, then click it.
    - expect: The selected card links to its individual product page; the link destination is the same product URL represented by the card title/loop-product link.
    - expect: An unavailable product card exposes Read More / Lees meer instead of a grid Add to Cart control.
  3. On the resulting single-product page, scope assertions to the primary product element and product summary/form, not the entire page (related products may have their own purchase controls).
    - expect: The page identifies the selected item as the primary product.
    - expect: The primary product's form.cart button.single_add_to_cart_button is absent or not visible, and the product cannot be added from its single-product page.
    - expect: No Add to Cart control in a related-products area is mistaken for the primary product's control.
  4. Leave the cart unchanged and do not follow any checkout flow.
    - expect: The unavailable-product negative case performs no cart mutation and never visits Checkout.
