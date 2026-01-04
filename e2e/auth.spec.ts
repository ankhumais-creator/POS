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
// AUTHENTICATION
// ============================================
test.describe('Authentication', () => {
    test('displays login page with branding', async ({ page }) => {
        await page.goto('/login')
        await expect(page.locator('h1')).toContainText('POS Kasir')
    })

    test('logs in successfully', async ({ page }) => {
        await login(page)
        await expect(page).toHaveURL('/')
    })

    test('redirects unauthenticated users', async ({ page }) => {
        await page.goto('/products')
        await expect(page).toHaveURL('/login', { timeout: 10000 })
    })

    test('persists session', async ({ page }) => {
        await login(page)
        await page.reload()
        await expect(page).toHaveURL('/')
    })
})

// ============================================
// NAVIGATION
// ============================================
test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('navigates to POS', async ({ page }) => {
        await page.click('a[href="/pos"]')
        await expect(page).toHaveURL('/pos')
    })

    test('navigates to Products', async ({ page }) => {
        await page.click('a[href="/products"]')
        await expect(page).toHaveURL('/products')
    })

    test('navigates to Categories', async ({ page }) => {
        await page.click('a[href="/categories"]')
        await expect(page).toHaveURL('/categories')
    })

    test('navigates to Customers', async ({ page }) => {
        await page.click('a[href="/customers"]')
        await expect(page).toHaveURL('/customers')
    })

    test('navigates to Shifts', async ({ page }) => {
        await page.click('a[href="/shifts"]')
        await expect(page).toHaveURL('/shifts')
    })

    test('navigates to Reports', async ({ page }) => {
        await page.click('a[href="/reports"]')
        await expect(page).toHaveURL('/reports')
    })

    test('navigates to Discounts', async ({ page }) => {
        await page.click('a[href="/discounts"]')
        await expect(page).toHaveURL('/discounts')
    })

    test('navigates to Settings', async ({ page }) => {
        await page.click('a[href="/settings"]')
        await expect(page).toHaveURL('/settings')
    })

    test('handles 404', async ({ page }) => {
        await page.goto('/nonexistent')
        await expect(page).toHaveURL('/', { timeout: 5000 })
    })
})

// ============================================
// POS PAGE
// ============================================
test.describe('POS Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/pos')
    })

    test('displays POS interface', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('shows cart area', async ({ page }) => {
        const cartEmpty = page.locator('[data-testid="cart-empty"]')
        const cartItems = page.locator('[data-testid="cart-items"]')
        await expect(cartEmpty.or(cartItems)).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// PRODUCTS PAGE
// ============================================
test.describe('Products Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/products')
    })

    test('displays products page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has add button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /tambah/i })).toBeVisible()
    })

    test('opens add modal', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('.modal-overlay')).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// CATEGORIES PAGE
// ============================================
test.describe('Categories Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/categories')
    })

    test('displays categories page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has add button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /tambah/i })).toBeVisible()
    })
})

// ============================================
// CUSTOMERS PAGE
// ============================================
test.describe('Customers Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/customers')
    })

    test('displays customers page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has add button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /tambah/i })).toBeVisible()
    })

    test('has search input', async ({ page }) => {
        await expect(page.getByPlaceholder(/cari/i)).toBeVisible()
    })
})

// ============================================
// SHIFTS PAGE
// ============================================
test.describe('Shifts Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/shifts')
    })

    test('displays shifts page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has shift button', async ({ page }) => {
        const bukaBtn = page.getByRole('button', { name: /buka/i })
        const tutupBtn = page.getByRole('button', { name: /tutup/i })
        await expect(bukaBtn.or(tutupBtn)).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// TRANSACTIONS PAGE
// ============================================
test.describe('Transactions Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/transactions')
    })

    test('displays transactions page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })
})

// ============================================
// REPORTS PAGE
// ============================================
test.describe('Reports Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/reports')
        await page.waitForLoadState('networkidle')
    })

    test('displays reports page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has controls', async ({ page }) => {
        // Export button should be visible
        await expect(page.getByText('Export')).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// DISCOUNTS PAGE
// ============================================
test.describe('Discounts Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/discounts')
    })

    test('displays discounts page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has add button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /tambah/i })).toBeVisible()
    })

    test('opens discount modal', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('[data-testid="discount-form-modal"]')).toBeVisible({ timeout: 3000 })
    })

    test('has generate code button', async ({ page }) => {
        await page.getByRole('button', { name: /tambah/i }).click()
        await expect(page.locator('[data-testid="generate-code-button"]')).toBeVisible({ timeout: 3000 })
    })
})

// ============================================
// STOCK OPNAME PAGE
// ============================================
test.describe('Stock Opname Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/stock-opname')
    })

    test('displays stock opname page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })
})

// ============================================
// SETTINGS PAGE
// ============================================
test.describe('Settings Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/settings')
    })

    test('displays settings page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })

    test('has save button', async ({ page }) => {
        await expect(page.getByRole('button', { name: /simpan/i })).toBeVisible()
    })
})

// ============================================
// USERS PAGE
// ============================================
test.describe('Users Page', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/users')
    })

    test('displays users page', async ({ page }) => {
        await expect(page.locator('body')).not.toBeEmpty()
    })
})

// ============================================
// RESPONSIVE
// ============================================
test.describe('Responsive', () => {
    test('works on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await login(page)
        await expect(page).toHaveURL('/')
    })

    test('works on tablet', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await login(page)
        await expect(page).toHaveURL('/')
    })
})
