import { test, expect } from '@playwright/test'

// Helper to login
async function login(page: import('@playwright/test').Page) {
    await page.goto('/login')
    const nameInput = page.locator('input.input').first()
    await nameInput.fill('Admin Test')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 10000 })
}

test.describe('POS Flow', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/pos')
    })

    test('should display POS page', async ({ page }) => {
        // May show shift warning or product grid
        const content = page.locator('text=/kasir|shift|produk/i').first()
        await expect(content).toBeVisible({ timeout: 5000 })
    })

    test('should display product grid or shift warning', async ({ page }) => {
        // Either product grid or shift warning should be visible
        const productGrid = page.locator('[data-testid="product-grid"]')
        const shiftWarning = page.locator('text=/shift belum dibuka/i')
        const emptyGrid = page.locator('[data-testid="product-grid-empty"]')

        await expect(productGrid.or(shiftWarning).or(emptyGrid)).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Products Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display products page', async ({ page }) => {
        await page.goto('/products')
        await expect(page.locator('text=/produk/i').first()).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Categories Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display categories page', async ({ page }) => {
        await page.goto('/categories')
        await expect(page.locator('text=/kategori/i').first()).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Customers Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display customers page', async ({ page }) => {
        await page.goto('/customers')
        await expect(page.locator('text=/pelanggan/i').first()).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Shifts Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display shifts page', async ({ page }) => {
        await page.goto('/shifts')
        await expect(page.locator('text=/shift/i').first()).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Reports Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display reports page', async ({ page }) => {
        await page.goto('/reports')
        await expect(page.locator('text=/laporan/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have export button', async ({ page }) => {
        await page.goto('/reports')
        const exportBtn = page.locator('button:has-text(/export|unduh/i)')
        await expect(exportBtn).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Discounts Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display discounts page', async ({ page }) => {
        await page.goto('/discounts')
        await expect(page.locator('text=/diskon|promo/i').first()).toBeVisible({ timeout: 5000 })
    })
})

test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display settings page', async ({ page }) => {
        await page.goto('/settings')
        await expect(page.locator('text=/pengaturan|settings/i').first()).toBeVisible({ timeout: 5000 })
    })
})
