// e2e/patterns.spec.js
import { test, expect } from '@playwright/test'
import { uniqueName } from './fixtures/test-data.js'

test('create a new pattern end-to-end', async ({ page }) => {
  const patternName = uniqueName('E2E Pattern')

  await page.goto('/dashboard')

  // Navigate to new pattern wizard
  await page.click('button:has-text("New Pattern")')
  await expect(page).toHaveURL(/patterns\/new/)

  // Step 1: Fill pattern name and add measurement fields
  await page.fill('input[placeholder="e.g. Ladies Salwar Kameez"]', patternName)

  // Add first measurement field
  await page.click('button:has-text("Add measurement")')
  const rows = page.locator('table tbody tr')
  await rows.nth(0).locator('input').nth(0).fill('Chest')
  await rows.nth(0).locator('input').nth(1).fill('सीना')

  // Add second measurement field
  await page.click('button:has-text("Add measurement")')
  await rows.nth(1).locator('input').nth(0).fill('Waist')
  await rows.nth(1).locator('input').nth(1).fill('कमर')

  // Go to Step 2
  await page.click('button:has-text("Next")')
  await expect(page.locator('text=Formulas')).toBeVisible()

  // Add formula field
  await page.click('button:has-text("Add formula field")')
  const formulaCard = page.locator('.card').last()
  await formulaCard.locator('input').nth(0).fill('Front Width')
  await formulaCard.locator('input').nth(1).fill('आगे की चौड़ाई')

  // Build formula: Chest ÷ 2 + 1.5
  await formulaCard.locator('button:has-text("Chest")').click()
  await formulaCard.locator('button:has-text("÷")').click()
  await formulaCard.locator('input[type="number"]').fill('2')
  await formulaCard.locator('button').filter({ hasText: /^\+$/ }).last().click()
  await formulaCard.locator('input[type="number"]').fill('1.5')
  await formulaCard.locator('button').filter({ hasText: /^\+$/ }).last().click()

  // Verify live preview shows a number
  await expect(formulaCard.locator('text=/\\d+\\.\\d+/')).toBeVisible({ timeout: 5000 })

  // Go to Step 3 and save
  await page.click('button:has-text("Next")')
  await expect(page.locator(`text=${patternName}`)).toBeVisible()

  await page.click('button:has-text("Save Pattern")')

  // Verify redirected to patterns list and pattern is visible
  await expect(page).toHaveURL(/\/patterns$/, { timeout: 10000 })
  await expect(page.locator(`text=${patternName}`)).toBeVisible()
})

test('edit an existing pattern name', async ({ page }) => {
  const originalName = uniqueName('E2E Edit Pattern')
  const updatedName = originalName + ' Updated'

  // First create a minimal pattern to edit
  await page.goto('/patterns/new')
  await page.fill('input[placeholder="e.g. Ladies Salwar Kameez"]', originalName)
  await page.click('button:has-text("Next")')
  await page.click('button:has-text("Next")')
  await page.click('button:has-text("Save Pattern")')
  await expect(page).toHaveURL(/\/patterns$/, { timeout: 10000 })

  // Click on the pattern to edit
  await page.click(`text=${originalName}`)
  await expect(page).toHaveURL(/patterns\/.+/)

  // Update name
  const nameInput = page.locator('input[placeholder="e.g. Ladies Salwar Kameez"]')
  await nameInput.clear()
  await nameInput.fill(updatedName)

  // Save
  await page.click('button:has-text("Next")')
  await page.click('button:has-text("Next")')
  await page.click('button:has-text("Save Pattern")')

  await expect(page).toHaveURL(/\/patterns$/, { timeout: 10000 })
  await expect(page.locator(`text=${updatedName}`)).toBeVisible()
})
