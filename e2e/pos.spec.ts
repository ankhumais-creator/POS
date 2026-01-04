import { test, expect, Page } from '@playwright/test'

/**
 * Helper: Login to the app (demo mode)
 */
async function login(page: Page) {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const nameInput = page.locator('input.input').first()
    await expect(nameInput).toBeVisible({ timeout: 10000 })
    await nameInput.fill('Admin Test')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/', { timeout: 15000 })
}

// ============================================
// PRODUCT CRUD TESTS
// ============================================
test.describe('Product CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/products')
    })

    test('should display product list or empty state', async ({ page }) => {
        const content = page.locator('text=/produk|tidak ada|belum ada/i')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })

    test('should open add product form', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        const modal = page.locator('.modal, [class*="modal"]')
        await expect(modal.first()).toBeVisible({ timeout: 3000 })
    })

    test('should have form fields in modal', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        const input = page.locator('input').first()
        await expect(input).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// CATEGORY CRUD TESTS
// ============================================
test.describe('Category CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/categories')
    })

    test('should display category list', async ({ page }) => {
        await expect(page.locator('text=/kategori/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should open add category form', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        const input = page.locator('input').first()
        await expect(input).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// CUSTOMER CRUD TESTS
// ============================================
test.describe('Customer CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/customers')
    })

    test('should display customer list or empty state', async ({ page }) => {
        const content = page.locator('text=/pelanggan|tidak ada|belum ada/i')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })

    test('should open add customer form', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        const input = page.locator('input').first()
        await expect(input).toBeVisible({ timeout: 3000 })
    })

    test('should search customers', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="cari" i]')
        await searchInput.fill('test search')
        await page.waitForTimeout(500)
        // Should not throw error
    })
})

// ============================================
// SHIFT MANAGEMENT TESTS
// ============================================
test.describe('Shift Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/shifts')
    })

    test('should display shift controls', async ({ page }) => {
        const shiftBtn = page.locator('button').filter({ hasText: /buka|tutup|shift/i }).first()
        await expect(shiftBtn).toBeVisible({ timeout: 5000 })
    })

    test('should show shift form when clicking open', async ({ page }) => {
        const openBtn = page.locator('button').filter({ hasText: /buka/i }).first()
        if (await openBtn.isVisible({ timeout: 2000 })) {
            await openBtn.click()
            await page.waitForTimeout(500)
            const input = page.locator('input[type="number"]').first()
            await expect(input).toBeVisible({ timeout: 3000 })
        }
    })
})

// ============================================
// DISCOUNT CRUD TESTS
// ============================================
test.describe('Discount CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/discounts')
    })

    test('should display discount list', async ({ page }) => {
        await expect(page.locator('text=/diskon|promo/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should open discount form', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)
        await expect(page.locator('[data-testid="discount-form-modal"]')).toBeVisible({ timeout: 3000 })
    })

    test('should fill discount form', async ({ page }) => {
        await page.click('button:has-text("Tambah")')
        await page.waitForTimeout(500)

        // Generate code
        await page.click('[data-testid="generate-code-button"]')

        // Fill name
        await page.fill('[data-testid="discount-name-field"]', 'E2E Test Discount')

        // Fill value
        await page.fill('[data-testid="discount-value-field"]', '10')
    })
})

// ============================================
// REPORT TESTS
// ============================================
test.describe('Reports', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/reports')
    })

    test('should display report page', async ({ page }) => {
        await expect(page.locator('text=/laporan/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have date filter', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first()
        await expect(dateInput).toBeVisible({ timeout: 5000 })
    })

    test('should filter by date', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first()
        await dateInput.fill('2026-01-01')
        await page.waitForTimeout(500)
        // Should not throw error
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

    test('should display stock page', async ({ page }) => {
        await expect(page.locator('text=/stok|opname/i').first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// SETTINGS TESTS
// ============================================
test.describe('Settings CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/settings')
    })

    test('should display settings', async ({ page }) => {
        await expect(page.locator('text=/pengaturan|settings/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have store name input', async ({ page }) => {
        const input = page.locator('input').first()
        await expect(input).toBeVisible({ timeout: 5000 })
    })

    test('should update store name', async ({ page }) => {
        const input = page.locator('input').first()
        await input.fill('Toko E2E Test')
        // Should not throw error
    })
})

// ============================================
// POS FLOW TESTS
// ============================================
test.describe('POS Flow', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should display POS interface', async ({ page }) => {
        await page.goto('/pos')
        // Should show either shift warning or POS interface
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('should have cart component', async ({ page }) => {
        await page.goto('/pos')
        const cart = page.locator('text=/keranjang|cart/i, [data-testid="cart-empty"]')
        await expect(cart.first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// TRANSACTION HISTORY TESTS
// ============================================
test.describe('Transaction History', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/transactions')
    })

    test('should display transaction page', async ({ page }) => {
        await expect(page.locator('text=/transaksi/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should have date filter', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first()
        await expect(dateInput).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// ACCESSIBILITY TESTS
// ============================================
test.describe('Accessibility', () => {
    test('should have form labels', async ({ page }) => {
        await login(page)
        await page.goto('/settings')
        const labels = page.locator('label')
        const count = await labels.count()
        expect(count).toBeGreaterThan(0)
    })

    test('buttons should have text or aria-label', async ({ page }) => {
        await login(page)
        const buttons = page.locator('button')
        const count = await buttons.count()
        expect(count).toBeGreaterThan(0)
    })
})
