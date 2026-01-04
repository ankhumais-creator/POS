import { test, expect, Page } from '@playwright/test'

/**
 * Login helper
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
// PRODUCT CRUD
// ============================================
test.describe('Product CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/products')
    })

    test('shows product page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('opens add form', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 3000 })
    })

    test('form has inputs', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await page.waitForTimeout(300)
        await expect(page.locator('.modal-overlay input').first()).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// CATEGORY CRUD
// ============================================
test.describe('Category CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/categories')
    })

    test('shows category page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('opens add form', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// CUSTOMER CRUD
// ============================================
test.describe('Customer CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/customers')
    })

    test('shows customer page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('opens add form', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 3000 })
    })

    test('can search', async ({ page }) => {
        await page.getByPlaceholder(/cari/i).fill('test')
    })
})

// ============================================
// SHIFT CRUD
// ============================================
test.describe('Shift CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/shifts')
    })

    test('shows shift page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has shift controls', async ({ page }) => {
        const bukaBtn = page.getByRole('button', { name: /buka/i })
        const tutupBtn = page.getByRole('button', { name: /tutup/i })
        await expect(bukaBtn.or(tutupBtn)).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// DISCOUNT CRUD
// ============================================
test.describe('Discount CRUD', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/discounts')
    })

    test('shows discount page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('opens add form', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('[data-testid="discount-form-modal"]')).toBeVisible({ timeout: 3000 })
    })

    test('can generate code', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await page.waitForTimeout(300)
        await page.locator('[data-testid="generate-code-button"]').click()
        // Verify code was generated
        const codeField = page.locator('[data-testid="discount-code-field"]')
        await expect(codeField).not.toHaveValue('')
    })

    test('can fill form', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await page.waitForTimeout(300)
        await page.locator('[data-testid="discount-name-field"]').fill('Test')
        await page.locator('[data-testid="discount-value-field"]').fill('10')
    })
})

// ============================================
// REPORT FEATURES
// ============================================
test.describe('Report Features', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/reports')
        await page.waitForLoadState('networkidle')
    })

    test('shows report page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has export button', async ({ page }) => {
        // Export button exists
        await expect(page.getByText('Export')).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// SETTINGS FEATURES
// ============================================
test.describe('Settings Features', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/settings')
        await page.waitForLoadState('networkidle')
    })

    test('shows settings page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has form', async ({ page }) => {
        await expect(page.locator('.card').first()).toBeVisible({ timeout: 5000 })
    })

    test('has save button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /simpan/i })).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// STOCK OPNAME
// ============================================
test.describe('Stock Opname', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/stock-opname')
    })

    test('shows stock page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })
})

// ============================================
// TRANSACTIONS
// ============================================
test.describe('Transactions', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/transactions')
    })

    test('shows transactions page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has date filter', async ({ page }) => {
        // TransactionsPage uses select dropdown, not date input
        await expect(page.locator('select').first()).toBeVisible()
    })
})

// ============================================
// POS FEATURES
// ============================================
test.describe('POS Features', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/pos')
    })

    test('shows POS page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has cart', async ({ page }) => {
        const cartEmpty = page.locator('[data-testid="cart-empty"]')
        const cartItems = page.locator('[data-testid="cart-items"]')
        await expect(cartEmpty.or(cartItems)).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// ACCESSIBILITY
// ============================================
test.describe('Accessibility', () => {
    test('pages are interactive', async ({ page }) => {
        await login(page)
        await page.goto('/settings')
        await page.waitForLoadState('networkidle')
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('sidebar has navigation links', async ({ page }) => {
        await login(page)
        await expect(page.locator('a[href="/pos"]')).toBeVisible()
        await expect(page.locator('a[href="/products"]')).toBeVisible()
    })
})
