// e2e/i18n.spec.js
import { test, expect } from '@playwright/test'

test('language toggle switches UI between English and Hindi', async ({ page }) => {
  await page.goto('/dashboard')

  // Verify English nav label
  await expect(page.locator('.bottom-nav a:has-text("Clients")')).toBeVisible()

  // Click Hindi toggle
  await page.click('.bottom-nav button:has-text("हिंदी")')

  // Verify Hindi nav label
  await expect(page.locator('.bottom-nav a:has-text("ग्राहक")')).toBeVisible()

  // Switch back to English
  await page.click('.bottom-nav button:has-text("English")')

  // Verify English restored
  await expect(page.locator('.bottom-nav a:has-text("Clients")')).toBeVisible()
})
