// e2e/clients.spec.js
import { test, expect } from '@playwright/test'
import { uniqueName } from './fixtures/test-data.js'

test('add a new client', async ({ page }) => {
  const clientName = uniqueName('E2E Client')

  await page.goto('/clients/new')

  await page.fill('input[placeholder="Priya Sharma"]', clientName)
  await page.fill('input[type="tel"]', '9876543210')
  await page.click('button:has-text("Save Client")')

  await expect(page).toHaveURL(/\/clients$/, { timeout: 10000 })
  await expect(page.locator(`text=${clientName}`)).toBeVisible()
})

test('take measurement for a client and view history', async ({ page }) => {
  const clientName = uniqueName('E2E Measure Client')
  const patternName = uniqueName('E2E Measure Pattern')

  // Create a pattern with one measurement field and one formula
  await page.goto('/patterns/new')
  await page.fill('input[placeholder="e.g. Ladies Salwar Kameez"]', patternName)
  await page.click('button:has-text("Add measurement")')
  const rows = page.locator('table tbody tr')
  await rows.nth(0).locator('input').nth(0).fill('Chest')
  await rows.nth(0).locator('input').nth(1).fill('सीना')
  await page.click('button:has-text("Next")')
  await page.click('button:has-text("Add formula field")')
  const formulaCard = page.locator('.card').last()
  await formulaCard.locator('input').nth(0).fill('Front Width')
  await formulaCard.locator('button:has-text("Chest")').click()
  await formulaCard.locator('button:has-text("÷")').click()
  await formulaCard.locator('input[type="number"]').fill('2')
  await formulaCard.locator('button').filter({ hasText: /^\+$/ }).last().click()
  await page.click('button:has-text("Next")')
  await page.click('button:has-text("Save Pattern")')
  await expect(page).toHaveURL(/\/patterns$/, { timeout: 10000 })

  // Create client
  await page.goto('/clients/new')
  await page.fill('input[placeholder="Priya Sharma"]', clientName)
  await page.fill('input[type="tel"]', '9876543211')
  await page.click('button:has-text("Save Client")')
  await expect(page).toHaveURL(/\/clients$/, { timeout: 10000 })

  // Open client and take measurement
  await page.click(`text=${clientName}`)
  await expect(page).toHaveURL(/\/clients\/.+$/)
  await page.click('button:has-text("New Measurement")')
  await expect(page).toHaveURL(/measure/)

  // Select pattern
  await page.selectOption('select', { label: patternName })

  // Enter measurement value
  await page.locator('input[type="number"]').first().fill('38')

  // Compute
  await page.click('button:has-text("Compute")')
  await expect(page.locator('text=Computed Results')).toBeVisible()
  await expect(page.locator('text=19.00')).toBeVisible()

  // Save
  await page.click('button:has-text("Save")')
  await expect(page).toHaveURL(/\/clients\/.+$/, { timeout: 10000 })

  // Verify measurement appears in history
  await expect(page.locator(`text=${patternName}`)).toBeVisible()
})
