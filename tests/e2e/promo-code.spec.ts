// tests/e2e/promo-code.spec.ts
import { test, expect } from '@playwright/test'

const TEST_EMAIL = 'testemail@gmail.com'
const TEST_PASSWORD = 'testpassword'
const VALID_PROMO_CODE = 'VALIDCODE123'
const INVALID_PROMO_CODE = 'FAKECODE999'

test.describe('Promo code at checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', TEST_EMAIL)
    await page.fill('input[type="password"]', TEST_PASSWORD)
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Lordcay').or(page.locator('text=User'))).toBeVisible({ timeout: 15000 })

    await page.goto('/products')
    await page.click('button:has-text("Add to Cart") >> nth=0')

    await expect(page.locator('text=Added to cart').first()).toBeVisible({ timeout: 5000 })
  })

  test('applying a valid promo code reduces the total', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Order Summary')).toBeVisible({ timeout: 10000 })

    const totalBefore = await page.locator('text=Total').last().textContent()

    await page.fill('input[placeholder="Enter code"]', VALID_PROMO_CODE)
    await page.click('button:has-text("Apply")')

    await expect(page.locator('p:has-text("discount applied")')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL(/\/checkout/)

    const totalAfter = await page.locator('text=Total').last().textContent()
    expect(totalAfter).not.toBe(totalBefore)
  })

  test('applying an invalid promo code shows an error', async ({ page }) => {
    await page.goto('/checkout', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('text=Order Summary')).toBeVisible({ timeout: 10000 })

    await page.fill('input[placeholder="Enter code"]', INVALID_PROMO_CODE)
    await page.click('button:has-text("Apply")')

    await expect(page.locator('text=Invalid promo code')).toBeVisible({ timeout: 5000 })
  })
})