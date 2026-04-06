// e2e/login.spec.js
import { test, expect } from '@playwright/test'

// This test uses NO saved auth state — it tests the login flow itself
test.use({ storageState: { cookies: [], origins: [] } })

test('redirects unauthenticated user to login', async ({ page }) => {
  await page.goto('')
  await expect(page).toHaveURL(/login/)
})

test('login with test phone number lands on dashboard', async ({ page }) => {
  await page.addInitScript(() => { window.__e2e__ = true })
  await page.goto('login')

  await page.fill('input[type="tel"]', '9999999999')
  await page.click('button:has-text("Send OTP")')

  await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible()

  const otpDigits = '123456'.split('')
  const boxes = page.locator('input[inputmode="numeric"]')
  for (let i = 0; i < 6; i++) {
    await boxes.nth(i).fill(otpDigits[i])
  }

  // Click the Verify button to submit OTP
  await page.click('button:has-text("Verify")')

  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 })
  await expect(page.locator('text=TailorMeasure')).toBeVisible()
})
