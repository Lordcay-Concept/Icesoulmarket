# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: promo-code.spec.ts >> Promo code at checkout >> applying a valid promo code reduces the total
- Location: tests\e2e\promo-code.spec.ts:24:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Apply")')

```

# Page snapshot

```yaml
- generic [ref=f3e1]:
  - navigation [ref=f3e2]:
    - generic [ref=f3e3]:
      - link "IcesoulMarket" [ref=f3e4] [cursor=pointer]:
        - /url: /
      - generic [ref=f3e12]:
        - link "Products" [ref=f3e13] [cursor=pointer]:
          - /url: /products
        - link "Categories" [ref=f3e14] [cursor=pointer]:
          - /url: /categories
        - link "Contact" [ref=f3e15] [cursor=pointer]:
          - /url: /contact
      - generic [ref=f3e16]:
        - link [ref=f3e17] [cursor=pointer]:
          - /url: /cart
          - button "6" [ref=f3e18]
        - generic [ref=f3e20] [cursor=pointer]:
          - generic [ref=f3e21]: L
          - generic [ref=f3e23]: Lordcay
  - main [ref=f3e26]:
    - generic [ref=f3e27]:
      - heading "Checkout" [level=1] [ref=f3e28]
      - generic [ref=f3e30]:
        - generic [ref=f3e31]:
          - generic [ref=f3e32]:
            - generic [ref=f3e33]: Contact Information
            - generic [ref=f3e38]:
              - generic [ref=f3e39]:
                - generic [ref=f3e40]: Full Name
                - textbox "Full Name" [ref=f3e45]:
                  - /placeholder: John Doe
                  - text: Lordcay
              - generic [ref=f3e46]:
                - generic [ref=f3e47]: Email Address
                - textbox "Email Address" [ref=f3e52]:
                  - /placeholder: john@example.com
                  - text: uferecaleb4170@gmail.com
              - paragraph [ref=f3e54]: 📧 Your order details and account information will be sent to this email.
          - generic [ref=f3e55]:
            - generic [ref=f3e56]: Payment Information
            - generic [ref=f3e61]:
              - generic [ref=f3e62]:
                - generic [ref=f3e63]: Secure Bank Transfer
                - paragraph [ref=f3e67]: After placing your order, you will receive bank transfer details to complete your payment.
              - generic [ref=f3e68]:
                - generic [ref=f3e69]: Order Notes (Optional)
                - textbox "Order Notes (Optional)" [ref=f3e70]:
                  - /placeholder: Any special instructions...
        - generic [ref=f3e72]:
          - generic [ref=f3e73]: Order Summary
          - generic [ref=f3e75]:
            - generic [ref=f3e77]:
              - generic [ref=f3e78]: Test 123 × 6
              - generic [ref=f3e79]: €600.00
            - generic [ref=f3e81]:
              - generic [ref=f3e82]: Subtotal
              - generic [ref=f3e83]: €600.00
            - generic [ref=f3e84]:
              - generic [ref=f3e85]: Total
              - generic [ref=f3e86]: €600.00
            - generic [ref=f3e87]:
              - generic [ref=f3e88]: Promo Code
              - generic [ref=f3e89]:
                - textbox "Enter code" [active] [ref=f3e90]: STREAMER20
                - button "Apply" [ref=f3e91] [cursor=pointer]
            - generic [ref=f3e92]: Instant digital delivery
          - generic [ref=f3e99]:
            - button "Place Order" [ref=f3e100] [cursor=pointer]
            - link [ref=f3e101] [cursor=pointer]:
              - /url: /cart
              - button "Back to Cart" [ref=f3e102]
  - link "Chat on WhatsApp" [ref=f3e103] [cursor=pointer]:
    - /url: https://wa.me/491767457435?text=Hi!%20I%20have%20a%20question%20about%20a%20product%20on%20IcesoulMarket.
  - contentinfo [ref=f3e106]:
    - generic [ref=f3e107]:
      - generic [ref=f3e108]:
        - generic [ref=f3e109]:
          - link "IcesoulMarket" [ref=f3e110] [cursor=pointer]:
            - /url: /
          - paragraph [ref=f3e117]: Premium gaming accounts, skins, and in-game currency, delivered instantly.
        - generic [ref=f3e118]:
          - heading "Shop" [level=3] [ref=f3e119]
          - list [ref=f3e120]:
            - listitem [ref=f3e121]:
              - link "All Products" [ref=f3e122] [cursor=pointer]:
                - /url: /products
            - listitem [ref=f3e123]:
              - link "Categories" [ref=f3e124] [cursor=pointer]:
                - /url: /categories
            - listitem [ref=f3e125]:
              - link "Best Sellers" [ref=f3e126] [cursor=pointer]:
                - /url: /products?sort=popular
        - generic [ref=f3e127]:
          - heading "Support" [level=3] [ref=f3e128]
          - list [ref=f3e129]:
            - listitem [ref=f3e130]:
              - link "Contact Us" [ref=f3e131] [cursor=pointer]:
                - /url: /contact
            - listitem [ref=f3e132]:
              - link "Track Order" [ref=f3e133] [cursor=pointer]:
                - /url: /account/orders
            - listitem [ref=f3e134]:
              - link "FAQ" [ref=f3e135] [cursor=pointer]:
                - /url: /faq
        - generic [ref=f3e136]:
          - heading "Legal" [level=3] [ref=f3e137]
          - list [ref=f3e138]:
            - listitem [ref=f3e139]:
              - link "Privacy Policy" [ref=f3e140] [cursor=pointer]:
                - /url: /privacy
            - listitem [ref=f3e141]:
              - link "Terms of Service" [ref=f3e142] [cursor=pointer]:
                - /url: /terms
          - link "Follow us on TikTok" [ref=f3e144] [cursor=pointer]:
            - /url: https://www.tiktok.com/@icesoulmarket.com?_r=1&_t=ZG-98MOI5C35Mm
          - link "Chat with us on WhatsApp" [ref=f3e149] [cursor=pointer]:
            - /url: https://wa.me/491767457435?text=Hi!%20I%20have%20a%20question%20about%20a%20product%20on%20IcesoulMarket.
      - generic [ref=f3e153]:
        - paragraph [ref=f3e154]: © 2026 IcesoulMarket. All rights reserved.
        - generic [ref=f3e155]: admin@icesoulmarket.com
  - region "Notifications (F8)":
    - list [ref=f3e161]:
      - listitem [ref=f3e162]:
        - generic [ref=f3e163]:
          - generic [ref=f3e164]: Cart is Empty
          - generic [ref=f3e165]: Please add items to your cart before checking out.
        - button [ref=f3e166] [cursor=pointer]
  - alert [ref=f3e171]
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
> 31 |     await page.click('button:has-text("Apply")')
     |                ^ Error: page.click: Test timeout of 60000ms exceeded.
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
  42 |     await expect(page.locator('text=Order Summary')).toBeVisible({ timeout: 10000 })
  43 | 
  44 |     await page.fill('input[placeholder="Enter code"]', INVALID_PROMO_CODE)
  45 |     await page.click('button:has-text("Apply")')
  46 | 
  47 |     await expect(page.locator('text=Invalid promo code')).toBeVisible({ timeout: 5000 })
  48 |   })
  49 | })
```