import { test, expect, Page } from '@playwright/test'

/**
 * Helper: Login to the app (demo mode)
 */
async function login(page: Page, name = 'Admin Test') {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    const nameInput = page.locator('input.input').first()
    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await nameInput.fill(name)

    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 15000 })
}

// ============================================
// AUTHENTICATION TESTS
// ============================================
test.describe('Authentication', () => {
    test('should display login page with branding', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('h1')).toContainText('POS Kasir')
    })

    test('should login successfully in demo mode', async ({ page }) => {
        await login(page)
        await expect(page).toHaveURL('/')
    })

    test('should redirect unauthenticated users to login', async ({ page }) => {
        await page.goto('/products')
        await expect(page).toHaveURL('/login', { timeout: 10000 })
    })

    test('should persist session across page reloads', async ({ page }) => {
        await login(page)
        await page.reload()
        await page.waitForLoadState('networkidle')
        await expect(page).toHaveURL('/')
    })
})

// ============================================
// DASHBOARD TESTS
// ============================================
test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display dashboard with content', async ({ page }) => {
        // Just verify we're on dashboard and it has some content
        await expect(page.locator('body')).not.toBeEmpty()
        const content = page.locator('.card, div')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })

    test('should have sidebar navigation links', async ({ page }) => {
        await expect(page.locator('a[href="/pos"]')).toBeVisible()
        await expect(page.locator('a[href="/products"]')).toBeVisible()
    })

    test('should navigate to POS page', async ({ page }) => {
        await page.click('a[href="/pos"]')
        await expect(page).toHaveURL('/pos')
    })

    test('should navigate to Products page', async ({ page }) => {
        await page.click('a[href="/products"]')
        await expect(page).toHaveURL('/products')
    })

    test('should navigate to Categories page', async ({ page }) => {
        await page.click('a[href="/categories"]')
        await expect(page).toHaveURL('/categories')
    })

    test('should navigate to Customers page', async ({ page }) => {
        await page.click('a[href="/customers"]')
        await expect(page).toHaveURL('/customers')
    })

    test('should navigate to Shifts page', async ({ page }) => {
        await page.click('a[href="/shifts"]')
        await expect(page).toHaveURL('/shifts')
    })

    test('should navigate to Reports page', async ({ page }) => {
        await page.click('a[href="/reports"]')
        await expect(page).toHaveURL('/reports')
    })

    test('should navigate to Discounts page', async ({ page }) => {
        await page.click('a[href="/discounts"]')
        await expect(page).toHaveURL('/discounts')
    })

    test('should navigate to Settings page', async ({ page }) => {
        await page.click('a[href="/settings"]')
        await expect(page).toHaveURL('/settings')
    })
})

// ============================================
// POS/KASIR TESTS
// ============================================
test.describe('POS/Kasir', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/pos')
    })

    test('should display POS page', async ({ page }) => {
        // Should display something - either shift warning or POS interface
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('should have cart area visible', async ({ page }) => {
        const cart = page.locator('[data-testid="cart-empty"], [data-testid="cart-items"], text=/keranjang/i')
        await expect(cart.first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// PRODUCTS TESTS
// ============================================
test.describe('Products Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/products')
    })

    test('should display products page', async ({ page }) => {
        await expect(page.locator('text=/produk/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have add button', async ({ page }) => {
        const addButton = page.locator('button').filter({ hasText: /tambah/i })
        await expect(addButton).toBeVisible()
    })

    test('should open add modal when clicking add button', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        // Modal should be visible
        await expect(page.locator('.modal, [class*="modal"]').first()).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// CATEGORIES TESTS
// ============================================
test.describe('Categories Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/categories')
    })

    test('should display categories page', async ({ page }) => {
        await expect(page.locator('text=/kategori/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have add button', async ({ page }) => {
        const addButton = page.locator('button').filter({ hasText: /tambah/i })
        await expect(addButton).toBeVisible()
    })
})

// ============================================
// CUSTOMERS TESTS
// ============================================
test.describe('Customers Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/customers')
    })

    test('should display customers page', async ({ page }) => {
        await expect(page.locator('text=/pelanggan/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have add button', async ({ page }) => {
        const addButton = page.locator('button').filter({ hasText: /tambah/i })
        await expect(addButton).toBeVisible()
    })

    test('should have search functionality', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="cari" i]')
        await expect(searchInput).toBeVisible()
    })
})

// ============================================
// SHIFTS TESTS
// ============================================
test.describe('Shift Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/shifts')
    })

    test('should display shifts page', async ({ page }) => {
        await expect(page.locator('text=/shift/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have shift action button', async ({ page }) => {
        // Either "Buka Shift" or "Tutup Shift" should be visible
        const shiftButton = page.locator('button').filter({ hasText: /buka|tutup/i }).first()
        await expect(shiftButton).toBeVisible()
    })
})

// ============================================
// TRANSACTIONS TESTS
// ============================================
test.describe('Transactions History', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/transactions')
    })

    test('should display transactions page', async ({ page }) => {
        await expect(page.locator('text=/transaksi/i').first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// REPORTS TESTS
// ============================================
test.describe('Reports & Analytics', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/reports')
    })

    test('should display reports page', async ({ page }) => {
        await expect(page.locator('text=/laporan/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have export button', async ({ page }) => {
        const exportBtn = page.locator('button').filter({ hasText: /export|unduh|excel|csv/i }).first()
        await expect(exportBtn).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// DISCOUNTS TESTS
// ============================================
test.describe('Discounts & Promotions', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/discounts')
    })

    test('should display discounts page', async ({ page }) => {
        await expect(page.locator('text=/diskon|promo/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have add discount button', async ({ page }) => {
        const addButton = page.locator('button').filter({ hasText: /tambah/i })
        await expect(addButton).toBeVisible()
    })

    test('should open discount modal', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        await expect(page.locator('[data-testid="discount-form-modal"]')).toBeVisible({ timeout: 3000 })
    })

    test('should have generate code button in modal', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        await expect(page.locator('[data-testid="generate-code-button"]')).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// STOCK OPNAME TESTS
// ============================================
test.describe('Stock Opname', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/stock-opname')
    })

    test('should display stock opname page', async ({ page }) => {
        await expect(page.locator('text=/stok|opname/i').first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// SETTINGS TESTS
// ============================================
test.describe('Settings', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/settings')
    })

    test('should display settings page', async ({ page }) => {
        await expect(page.locator('text=/pengaturan|settings/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have save button', async ({ page }) => {
        const saveBtn = page.locator('button').filter({ hasText: /simpan/i })
        await expect(saveBtn).toBeVisible()
    })
})

// ============================================
// USERS TESTS
// ============================================
test.describe('User Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/users')
    })

    test('should display users page', async ({ page }) => {
        await expect(page.locator('text=/pengguna|user/i').first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// RESPONSIVE TESTS
// ============================================
test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await login(page)
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('should work on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await login(page)
        await expect(page.locator('body')).not.toBeEmpty()
    })
})

// ============================================
// ERROR HANDLING TESTS
// ============================================
test.describe('Error Handling', () => {
    test('should handle 404 gracefully', async ({ page }) => {
        await login(page)
        await page.goto('/nonexistent-page')
        // Should redirect to home
        await expect(page).toHaveURL('/', { timeout: 5000 })
    })
})
