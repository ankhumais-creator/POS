import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
    test('should display login page', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('h1, h2').first()).toContainText(/masuk|login/i)
    })

    test('should login with demo credentials', async ({ page }) => {
        await page.goto('/login')

        // Fill login form
        await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@toko.com')
        await page.fill('input[type="password"]', 'admin123')

        // Submit
        await page.click('button[type="submit"]')

        // Should redirect to dashboard
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/login')

        await page.fill('input[type="email"], input[placeholder*="email" i]', 'wrong@email.com')
        await page.fill('input[type="password"]', 'wrongpassword')
        await page.click('button[type="submit"]')

        // Should show error message
        await expect(page.locator('text=/invalid|salah|error/i')).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login')
        await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@toko.com')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should display dashboard with stats', async ({ page }) => {
        // Check for summary cards
        await expect(page.locator('text=/penjualan|transaksi|produk/i').first()).toBeVisible()
    })

    test('should navigate to POS page', async ({ page }) => {
        await page.click('a[href="/pos"], text=/kasir/i')
        await expect(page).toHaveURL('/pos')
    })
})
