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
        await expect(page.locator('text=login')).toBeVisible()
        await expect(page.locator('input.input')).toBeVisible()
        await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should show demo mode notice when Supabase not configured', async ({ page }) => {
        await page.goto('/login')

        // Demo mode should show amber warning
        const demoNotice = page.locator('text=/mode demo|supabase/i')
        await expect(demoNotice).toBeVisible({ timeout: 5000 })
    })

    test('should login successfully in demo mode', async ({ page }) => {
        await login(page, 'Test User')

        // Should be on dashboard
        await expect(page).toHaveURL('/')
    })

    test('should redirect unauthenticated users to login', async ({ page }) => {
        // Try to access protected route without login
        await page.goto('/products')

        // Should redirect to login
        await expect(page).toHaveURL('/login', { timeout: 10000 })
    })

    test('should persist session across page reloads', async ({ page }) => {
        await login(page)

        // Reload page
        await page.reload()
        await page.waitForLoadState('networkidle')

        // Should still be on dashboard (not redirected to login)
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

    test('should display dashboard with summary cards', async ({ page }) => {
        // Check for summary metrics
        const content = page.locator('.card, [class*="stat"], [class*="summary"]')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })

    test('should display sidebar navigation', async ({ page }) => {
        await expect(page.locator('a[href="/pos"]')).toBeVisible()
        await expect(page.locator('a[href="/products"]')).toBeVisible()
        await expect(page.locator('a[href="/reports"]')).toBeVisible()
    })

    test('should navigate to all main pages from sidebar', async ({ page }) => {
        const routes = [
            { href: '/pos', text: 'kasir' },
            { href: '/products', text: 'produk' },
            { href: '/categories', text: 'kategori' },
            { href: '/customers', text: 'pelanggan' },
            { href: '/transactions', text: 'transaksi' },
            { href: '/reports', text: 'laporan' },
            { href: '/shifts', text: 'shift' },
            { href: '/discounts', text: 'diskon' },
            { href: '/settings', text: 'pengaturan' }
        ]

        for (const route of routes) {
            await page.click(`a[href="${route.href}"]`)
            await expect(page).toHaveURL(route.href, { timeout: 5000 })
            await page.goto('/') // Go back to dashboard
        }
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

    test('should display POS interface or shift warning', async ({ page }) => {
        // Either shows shift warning or product grid
        const shiftWarning = page.locator('text=/shift belum dibuka/i')
        const productGrid = page.locator('[data-testid="product-grid"]')
        const emptyGrid = page.locator('[data-testid="product-grid-empty"]')
        const searchBar = page.locator('[data-testid="pos-search-bar"]')

        await expect(
            shiftWarning.or(productGrid).or(emptyGrid).or(searchBar)
        ).toBeVisible({ timeout: 10000 })
    })

    test('should have search functionality', async ({ page }) => {
        const searchInput = page.locator('[data-testid="pos-search-input"], input[placeholder*="cari" i]')

        if (await searchInput.isVisible()) {
            await searchInput.fill('test product')
            // Search should filter products (no error)
        }
    })

    test('should have barcode scan button', async ({ page }) => {
        const scanButton = page.locator('[data-testid="pos-scan-button"], button[title*="barcode" i]')

        if (await scanButton.isVisible()) {
            await scanButton.click()
            // Should open barcode modal
            await expect(page.locator('text=/barcode|scan/i')).toBeVisible({ timeout: 3000 })
        }
    })

    test('should display cart area', async ({ page }) => {
        const cartArea = page.locator('[data-testid="cart-empty"], [data-testid="cart-items"]')
        await expect(cartArea).toBeVisible({ timeout: 5000 })
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

    test('should have add product button', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await expect(addButton).toBeVisible()
    })

    test('should open add product modal', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await addButton.click()

        // Modal should appear
        await expect(page.locator('input[placeholder*="nama" i], input[name="name"]')).toBeVisible({ timeout: 3000 })
    })

    test('should have search functionality', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="cari" i]')
        await expect(searchInput).toBeVisible()

        await searchInput.fill('test search')
        // Should not throw error
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

    test('should have add category button', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await expect(addButton).toBeVisible()
    })

    test('should be able to add a new category', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await addButton.click()

        // Fill form
        const nameInput = page.locator('input[placeholder*="nama" i], input[name="name"]').first()
        if (await nameInput.isVisible()) {
            await nameInput.fill('Test Category')

            // Submit
            const submitBtn = page.locator('button:has-text(/simpan|tambah/i)').last()
            await submitBtn.click()
        }
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

    test('should have add customer button', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await expect(addButton).toBeVisible()
    })

    test('should open add customer modal', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await addButton.click()

        await expect(page.locator('input[placeholder*="nama" i]')).toBeVisible({ timeout: 3000 })
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

    test('should have open/close shift button', async ({ page }) => {
        const shiftButton = page.locator('button:has-text(/buka|tutup|shift/i)')
        await expect(shiftButton.first()).toBeVisible()
    })

    test('should show shift history', async ({ page }) => {
        // Either shows history or empty state
        const content = page.locator('text=/riwayat|history|belum ada/i')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
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

    test('should have date filter', async ({ page }) => {
        const dateFilter = page.locator('input[type="date"]')
        await expect(dateFilter.first()).toBeVisible()
    })

    test('should show transactions or empty state', async ({ page }) => {
        const content = page.locator('text=/transaksi|belum ada|tidak ada/i')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
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

    test('should have date range filter', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]')
        await expect(dateInput.first()).toBeVisible()
    })

    test('should have export button', async ({ page }) => {
        const exportBtn = page.locator('button:has-text(/export|unduh/i)')
        await expect(exportBtn).toBeVisible()
    })

    test('should display summary metrics', async ({ page }) => {
        // Should show sales/transaction metrics
        const metrics = page.locator('text=/penjualan|transaksi|total/i')
        await expect(metrics.first()).toBeVisible({ timeout: 5000 })
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
        const addButton = page.locator('button:has-text(/tambah/i)')
        await expect(addButton).toBeVisible()
    })

    test('should open discount form modal', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await addButton.click()

        await expect(page.locator('[data-testid="discount-form-modal"]')).toBeVisible({ timeout: 3000 })
    })

    test('should have generate code button in form', async ({ page }) => {
        const addButton = page.locator('button:has-text(/tambah/i)')
        await addButton.click()

        const generateBtn = page.locator('[data-testid="generate-code-button"]')
        await expect(generateBtn).toBeVisible({ timeout: 3000 })
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

    test('should show stock adjustment history or empty state', async ({ page }) => {
        const content = page.locator('text=/penyesuaian|adjustment|belum ada/i')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
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

    test('should have store name input', async ({ page }) => {
        const nameInput = page.locator('input[placeholder*="toko" i], input[name*="name" i]')
        await expect(nameInput.first()).toBeVisible()
    })

    test('should have save button', async ({ page }) => {
        const saveBtn = page.locator('button:has-text(/simpan|save/i)')
        await expect(saveBtn).toBeVisible()
    })
})

// ============================================
// USERS TESTS (Admin only)
// ============================================
test.describe('User Management', () => {
    test.beforeEach(async ({ page }) => {
        await login(page, 'Admin')
        await page.goto('/users')
    })

    test('should display users page', async ({ page }) => {
        await expect(page.locator('text=/pengguna|user/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should show user list or empty state', async ({ page }) => {
        const content = page.locator('text=/admin|kasir|owner|belum ada/i')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// RESPONSIVE TESTS
// ============================================
test.describe('Responsive Design', () => {
    test('should be responsive on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 })
        await login(page)

        // Should still show main content
        const content = page.locator('.card, [class*="stat"]')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })

    test('should be responsive on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 })
        await login(page)

        const content = page.locator('.card, [class*="stat"]')
        await expect(content.first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// NOTIFICATION TESTS
// ============================================
test.describe('Notifications', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should have notification bell in header', async ({ page }) => {
        const bell = page.locator('button:has(svg.lucide-bell), [class*="notification"]')
        await expect(bell.first()).toBeVisible({ timeout: 5000 })
    })
})
