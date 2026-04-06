// e2e/auth.setup.js
import { test as setup, expect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const authFile = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  // Ensure auth directory exists
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await page.goto('login')
  await expect(page).toHaveURL(/login/)

  // Enter phone number
  await page.fill('input[type="tel"]', '9999999999')
  await page.click('button:has-text("Send OTP")')

  // Wait for OTP boxes to appear
  await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible()

  // Fill 6 OTP boxes with '1','2','3','4','5','6'
  const otpDigits = '123456'.split('')
  const boxes = page.locator('input[inputmode="numeric"]')
  for (let i = 0; i < 6; i++) {
    await boxes.nth(i).fill(otpDigits[i])
  }

  // Click the Verify button to submit OTP
  await page.click('button:has-text("Verify")')

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 15000 })

  // Save auth state
  await page.context().storageState({ path: authFile })
})
