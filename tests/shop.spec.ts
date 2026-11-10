// spec: specs/shop-smoke-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect, type Page } from '@playwright/test';

const PRODUCT_CARD_SELECTOR = 'ul.products > li.product:not(.product-category)';
const CATEGORY_URLS = [
  '/product-category/body-care/',
  '/product-category/hair-care/',
];

interface ProductCandidate {
  name: string;
  categoryUrl: string;
  productUrl: string;
  isOutOfStock: boolean;
  hasAddToCart: boolean;
  readMoreUrl?: string;
}

async function clearCart(page: Page): Promise<void> {
  await page.goto('/cart/');

  const cartRows = page.locator('tr.woocommerce-cart-form__cart-item');
  while (await cartRows.count()) {
    const previousCount = await cartRows.count();
    const row = cartRows.first();
    const removeLink = row.locator('a.remove');

    await expect(removeLink).toBeVisible();
    await removeLink.click();
    await expect(cartRows).toHaveCount(previousCount - 1);
  }

  await expect(cartRows).toHaveCount(0);
  await expect(
    page.getByText(/your shopping cart is currently empty|winkelwagen.*leeg/i),
  ).toBeVisible();
}

async function collectProducts(page: Page): Promise<ProductCandidate[]> {
  const pendingUrls = [...CATEGORY_URLS];
  const visitedUrls = new Set<string>();
  const products: ProductCandidate[] = [];

  while (pendingUrls.length > 0) {
    const categoryUrl = pendingUrls.shift();
    if (!categoryUrl || visitedUrls.has(categoryUrl)) {
      continue;
    }

    visitedUrls.add(categoryUrl);
    await page.goto(categoryUrl);
    await expect(page.locator('ul.products')).toBeVisible();

    const productCards = page.locator(PRODUCT_CARD_SELECTOR);
    const cardCount = await productCards.count();

    if (cardCount === 0) {
      const subcategoryLinks = page.locator(
        'ul.products > li.product-category a[href*="/product-category/"]',
      );
      for (let index = 0; index < await subcategoryLinks.count(); index += 1) {
        const href = await subcategoryLinks.nth(index).getAttribute('href');
        if (href) {
          pendingUrls.push(new URL(href, page.url()).toString());
        }
      }
      continue;
    }

    for (let index = 0; index < cardCount; index += 1) {
      const card = productCards.nth(index);
      const titleLink = card.locator('a.ast-loop-product__link').first();
      const name = (await titleLink.innerText()).trim();
      const href = await titleLink.getAttribute('href');
      if (!href) {
        throw new Error(`Product card "${name}" has no product-detail link.`);
      }

      const readMoreLink = card
        .locator('a.button')
        .filter({ hasText: /^(read more|lees meer)$/i })
        .first();
      const readMoreHref = (await readMoreLink.count())
        ? await readMoreLink.getAttribute('href')
        : null;

      products.push({
        name,
        categoryUrl,
        productUrl: new URL(href, page.url()).toString(),
        isOutOfStock: await card.evaluate((element) =>
          element.classList.contains('outofstock'),
        ),
        hasAddToCart: (await card.locator('a.add_to_cart_button').count()) > 0,
        readMoreUrl: readMoreHref
          ? new URL(readMoreHref, page.url()).toString()
          : undefined,
      });
    }

    const paginationLinks = page.locator('.woocommerce-pagination a[href]');
    for (let index = 0; index < await paginationLinks.count(); index += 1) {
      const href = await paginationLinks.nth(index).getAttribute('href');
      if (href) {
        pendingUrls.push(new URL(href, page.url()).toString());
      }
    }
  }

  return products;
}

async function expectCartContainsOnly(page: Page, productName: string): Promise<void> {
  const cartRows = page.locator('tr.woocommerce-cart-form__cart-item');
  await expect(cartRows).toHaveCount(1);

  const cartRow = cartRows.first();
  await expect
    .poll(async () =>
      (await cartRow.locator('.product-name').innerText()).toLocaleLowerCase(),
    )
    .toContain(productName.toLocaleLowerCase());
  await expect(cartRow.locator('input.qty')).toHaveValue('1');
}

test.describe('Authenticated WooCommerce shop smoke tests', () => {
  test.beforeEach(async ({ page }) => {
    await clearCart(page);
  });

  test.afterEach(async ({ page }) => {
    await clearCart(page);
  });

  test('Verify Shop categories and product availability markup', async ({ page }) => {
    // 1. Visit the Shop page and locate both categories by their accessible labels.
    await page.goto('/shop/');
    const bodyCareLink = page.getByLabel('View product category Body Care');
    const hairCareLink = page.getByLabel('View product category Hair Care');
    await expect(bodyCareLink).toBeVisible();
    await expect(hairCareLink).toBeVisible();

    // 2. Open each category and check its actual product cards, excluding category tiles.
    const categories = [
      { name: 'Body Care', link: bodyCareLink, url: CATEGORY_URLS[0] },
      { name: 'Hair Care', link: hairCareLink, url: CATEGORY_URLS[1] },
    ];

    for (const category of categories) {
      await page.goto('/shop/');
      await category.link.click();
      await expect(page).toHaveURL(new RegExp(category.url.replaceAll('/', '\\/')));

      const productCards = page.locator(PRODUCT_CARD_SELECTOR);
      const cardCount = await productCards.count();
      await expect.soft(
        productCards,
        `${category.name} must render a product grid rather than only category tiles.`,
      ).not.toHaveCount(0);

      for (let index = 0; index < cardCount; index += 1) {
        const card = productCards.nth(index);
        const name = (await card.locator('a.ast-loop-product__link').first().innerText()).trim();
        const isOutOfStock = await card.evaluate((element) =>
          element.classList.contains('outofstock'),
        );
        const addToCart = card.locator('a.add_to_cart_button');
        const readMore = card
          .locator('a.button')
          .filter({ hasText: /^(read more|lees meer)$/i });

        if (isOutOfStock) {
          await expect.soft(addToCart, `${name} is unavailable`).toHaveCount(0);
          await expect.soft(readMore, `${name} must link to its product page`).toBeVisible();
        } else {
          await expect.soft(
            addToCart,
            `${name} is not marked out of stock and must have an Add to Cart action.`,
          ).toHaveCount(1);
        }

        if (await readMore.count()) {
          expect.soft(
            isOutOfStock,
            `${name} uses Read More but its product card is not marked .outofstock.`,
          ).toBe(true);
        }
      }
    }
  });

  test('Add the same randomly selected available product from grid and product detail', async ({ page }) => {
    // 1. Start from an empty cart before selecting a product.
    await clearCart(page);

    try {
      // 2. Collect purchasable products from both main categories and visible product-bearing descendants.
      const products = await collectProducts(page);
      const availableProducts = products.filter(
        (product) => !product.isOutOfStock && product.hasAddToCart,
      );
      expect(
        availableProducts.length,
        'Expected at least one available product with a grid Add to Cart button.',
      ).toBeGreaterThan(0);

      const selectedProduct =
        availableProducts[Math.floor(Math.random() * availableProducts.length)];
      if (!selectedProduct) {
        throw new Error('No available product was selected from the catalog.');
      }

      await page.goto(selectedProduct.categoryUrl);
      const selectedCard = page
        .locator(PRODUCT_CARD_SELECTOR)
        .filter({ hasText: selectedProduct.name })
        .first();
      await expect(selectedCard).toBeVisible();
      await expect(selectedCard.locator('a.add_to_cart_button')).toBeVisible();

      // 3. Add the selected item from the grid and verify its single cart row and quantity.
      await selectedCard.locator('a.add_to_cart_button').click();
      await page.goto('/cart/');
      await expectCartContainsOnly(page, selectedProduct.name);

      // 4. Remove the grid-added item, then open that same item's product detail page.
      await clearCart(page);
      await page.goto(selectedProduct.productUrl);
      const primaryProduct = page.locator('main .ast-article-single.product');
      await expect(primaryProduct).toBeVisible();
      await expect(primaryProduct.locator('h1.product_title, h1').first()).toContainText(
        new RegExp(selectedProduct.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
      );

      const primaryAddToCart = primaryProduct.locator(
        'form.cart button.single_add_to_cart_button',
      );
      await expect(primaryAddToCart).toBeVisible();
      await expect(primaryAddToCart).toBeEnabled();

      // 5. Add the same item from its primary product form and verify the cart again.
      await primaryAddToCart.click();
      await page.goto('/cart/');
      await expectCartContainsOnly(page, selectedProduct.name);
    } finally {
      // 6. Remove any remaining item even if an earlier assertion fails.
      await clearCart(page);
    }
  });

  test('Follow an unavailable product Read More link and reject product-page Add to Cart', async ({ page }) => {
    // 1. Start from an empty cart and search category product grids for an unavailable item.
    await clearCart(page);
    const products = await collectProducts(page);
    const unavailableProduct = products.find((product) => product.isOutOfStock);
    const diagnosticProduct = products.find(
      (product) => !product.hasAddToCart && Boolean(product.readMoreUrl),
    );
    const selectedProduct = unavailableProduct ?? diagnosticProduct;

    if (!selectedProduct) {
      test.skip(true, 'No unavailable or Read More-only product is currently present.');
      return;
    }

    if (!selectedProduct.readMoreUrl) {
      throw new Error(`Unavailable product "${selectedProduct.name}" has no Read More link.`);
    }

    // 2. Verify the grid action and follow the selected product's Read More link.
    expect.soft(
      selectedProduct.isOutOfStock,
      `${selectedProduct.name} must have the .outofstock class.`,
    ).toBe(true);

    await page.goto(selectedProduct.categoryUrl);
    const selectedCard = page
      .locator(PRODUCT_CARD_SELECTOR)
      .filter({ hasText: selectedProduct.name })
      .first();
    await expect(selectedCard).toBeVisible();
    await expect(selectedCard.locator('a.add_to_cart_button')).toHaveCount(0);

    const readMoreLink = selectedCard.getByRole('link', {
      name: /^(read more|lees meer)$/i,
    });
    await expect(readMoreLink).toBeVisible();
    const actualReadMoreUrl = new URL(
      (await readMoreLink.getAttribute('href')) ?? '',
      page.url(),
    ).toString();
    expect(actualReadMoreUrl).toBe(selectedProduct.productUrl);
    expect(actualReadMoreUrl).toBe(selectedProduct.readMoreUrl);
    await readMoreLink.click();

    // 3. Assert the primary product identity and absence of its Add to Cart control.
    await expect(page).toHaveURL(selectedProduct.productUrl);
    const primaryProduct = page.locator('main .ast-article-single.product');
    await expect(primaryProduct).toBeVisible();
    await expect(primaryProduct.locator('h1.product_title, h1').first()).toContainText(
      new RegExp(selectedProduct.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    );

    const primaryAddToCart = primaryProduct.locator(
      'form.cart button.single_add_to_cart_button',
    );
    if (await primaryAddToCart.count()) {
      await expect(primaryAddToCart).not.toBeVisible();
    }

    // 4. Do not interact with the cart or continue to Checkout.
  });
});