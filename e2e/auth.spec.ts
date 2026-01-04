import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test('should display login page', async ({ page }) => {
        await page.goto('/login')

        // Check for title
        await expect(page.locator('h1')).toContainText('POS Kasir')
    })

    test('should login in demo mode', async ({ page }) => {
        await page.goto('/login')

        // In demo mode, just fill name and submit
        const nameInput = page.locator('input.input').first()
        await nameInput.fill('Admin Test')

        // Submit
        await page.click('button[type="submit"]')

        // Should redirect to dashboard
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })
})

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login first (demo mode)
        await page.goto('/login')
        const nameInput = page.locator('input.input').first()
        await nameInput.fill('Admin Test')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should display dashboard', async ({ page }) => {
        // Check for main layout
        await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 5000 })
    })

    test('should navigate to POS page', async ({ page }) => {
        // Click kasir menu
        await page.click('a[href="/pos"]')
        await expect(page).toHaveURL('/pos')
    })
})
