# Website Test Plans

This repository contains automated browser tests for my client's website, plus documents describing what the tests should check.

The website is built with WordPress and WooCommerce, which provides the online shop. The tests use Playwright to open pages in a browser and check that important content and behavior are present.

## What’s in this folder?

The files in `specs/` describe test coverage:

- [Public website plan](./client-homepage-smoke.md) describes checks for the homepage, informational pages, shop pages, account and cart pages, and legal pages. Its planned checks are view-only: they do not log in, change the cart, or submit forms.
- [Shop plan](./shop-smoke-test-plan.md) describes checks for product availability and adding products to the cart. It allows adding and removing items to verify the cart, but does not include Checkout or placing orders.

A plan is a description of intended testing. It does not mean every scenario in that plan has been implemented.

## What do the current test files check?

The files in `tests/` contain the browser tests and setup code:

- [`shop.spec.ts`](../tests/shop.spec.ts) checks that the Shop page links to Body Care and Hair Care, then checks product availability controls on those category pages. It also picks an available product and verifies that the same product can be added from its category listing and its product page. A separate scenario follows a Read More / Lees meer link and checks that the product page does not offer a primary Add to Cart button. Cart items are removed before and after each test. The unavailable-product check is skipped if no suitable product is found.
- [`booking.spec.ts`](../tests/booking.spec.ts) opens the appointment page and checks for a booking or calendar widget, or text indicating appointment availability. It does not complete a booking.
- [`frontend.spec.ts`](../tests/frontend.spec.ts) opens the homepage and checks for the WordPress admin bar and a heading named “Client Name” in the logged-in view.
- [`auth.setup.ts`](../tests/auth.setup.ts) signs in to WordPress using credentials from a local `.env` file and saves the browser session for other tests.
- [`seed.spec.ts`](../tests/seed.spec.ts) is currently a placeholder. It does not create test data or perform setup.

The public website plan also describes scenarios that do not yet have matching test files. Those planned scenarios should not be assumed to run just because they appear in the plan.

## How test setup works

[`playwright.config.ts`](../playwright.config.ts) sets the website address used by the tests, configures a Chromium browser project, and runs tests one at a time. The Chromium project depends on the authentication setup, so its tests use the saved logged-in session.
The test files are organized into directories, each with a `test.ts` file that contains a single test. The test files are named after the scenario they test. The test files are organized into directories, each with a `test.ts` file that contains a single test. The test files are named after the scenario they test.