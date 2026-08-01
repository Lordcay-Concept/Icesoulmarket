# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: promo-code.spec.ts >> Promo code at checkout >> applying an invalid promo code shows an error
- Location: tests\e2e\promo-code.spec.ts:40:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Order Summary')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for locator('text=Order Summary')
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

```yaml
- navigation:
  - link "IcesoulMarket":
    - /url: /
  - link "Products":
    - /url: /products
  - link "Categories":
    - /url: /categories
  - link "Contact":
    - /url: /contact
  - link:
    - /url: /cart
    - button
  - link "Login":
    - /url: /login
    - button "Login"
- main: Loading checkout...
- region "Notifications (F8)":
  - list
- alert
```

# Test source

```ts
  1  | // tests/e2e/promo-code.spec.ts
  2  | import { test, expect } from '@playwright/test'
  3  | 
  4  | const TEST_EMAIL = 'uferecaleb4170@gmail.com'
  5  | const TEST_PASSWORD = 'lordcay4170'
  6  | const VALID_PROMO_CODE = 'STREAMER20'
  7  | const INVALID_PROMO_CODE = 'FAKECODE999'
  8  | 
  9  | test.describe('Promo code at checkout', () => {
  10 |   test.beforeEach(async ({ page }) => {
  11 |     await page.goto('/login')
  12 |     await page.fill('input[type="email"]', TEST_EMAIL)
  13 |     await page.fill('input[type="password"]', TEST_PASSWORD)
  14 |     await page.click('button[type="submit"]')
  15 | 
  16 |     await expect(page.locator('text=Lordcay').or(page.locator('text=User'))).toBeVisible({ timeout: 15000 })
  17 | 
  18 |     await page.goto('/products')
  19 |     await page.click('button:has-text("Add to Cart") >> nth=0')
  20 | 
  21 |     await expect(page.locator('text=Added to cart').first()).toBeVisible({ timeout: 5000 })
  22 |   })
  23 | 
  24 |   test('applying a valid promo code reduces the total', async ({ page }) => {
  25 |     await page.goto('/checkout', { waitUntil: 'domcontentloaded' })
  26 |     await expect(page.locator('text=Order Summary')).toBeVisible({ timeout: 10000 })
  27 | 
  28 |     const totalBefore = await page.locator('text=Total').last().textContent()
  29 | 
  30 |     await page.fill('input[placeholder="Enter code"]', VALID_PROMO_CODE)
  31 |     await page.click('button:has-text("Apply")')
  32 | 
  33 |     await expect(page.locator('p:has-text("discount applied")')).toBeVisible({ timeout: 5000 })
  34 |     await expect(page).toHaveURL(/\/checkout/)
  35 | 
  36 |     const totalAfter = await page.locator('text=Total').last().textContent()
  37 |     expect(totalAfter).not.toBe(totalBefore)
  38 |   })
  39 | 
  40 |   test('applying an invalid promo code shows an error', async ({ page }) => {
  41 |     await page.goto('/checkout', { waitUntil: 'domcontentloaded' })
> 42 |     await expect(page.locator('text=Order Summary')).toBeVisible({ timeout: 10000 })
     |                                                      ^ Error: expect(locator).toBeVisible() failed
  43 | 
  44 |     await page.fill('input[placeholder="Enter code"]', INVALID_PROMO_CODE)
  45 |     await page.click('button:has-text("Apply")')
  46 | 
  47 |     await expect(page.locator('text=Invalid promo code')).toBeVisible({ timeout: 5000 })
  48 |   })
  49 | })
```