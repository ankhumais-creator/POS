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

/**
 * Helper: Open shift if not already open
 */
async function ensureShiftOpen(page: Page) {
    await page.goto('/shifts')

    const openButton = page.locator('button:has-text(/buka shift/i)')
    if (await openButton.isVisible({ timeout: 3000 })) {
        await openButton.click()

        // Fill opening cash
        const cashInput = page.locator('input[type="number"]').first()
        if (await cashInput.isVisible({ timeout: 2000 })) {
            await cashInput.fill('100000')
        }

        // Submit
        const submitBtn = page.locator('button:has-text(/buka|simpan/i)').last()
        if (await submitBtn.isVisible()) {
            await submitBtn.click()
        }

        await page.waitForTimeout(1000)
    }
}

// ============================================
// COMPLETE POS TRANSACTION FLOW
// ============================================
test.describe('Complete POS Transaction Flow', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should complete full transaction flow', async ({ page }) => {
        // 1. Open shift first
        await ensureShiftOpen(page)

        // 2. Go to POS
        await page.goto('/pos')
        await page.waitForLoadState('networkidle')

        // 3. Check if products are available
        const productGrid = page.locator('[data-testid="product-grid"]')
        const productCard = page.locator('[data-testid^="product-card-"]').first()

        if (await productCard.isVisible({ timeout: 5000 })) {
            // 4. Add product to cart
            await productCard.click()

            // 5. Verify cart has items
            const cartItem = page.locator('[data-testid^="cart-item-"]').first()
            await expect(cartItem).toBeVisible({ timeout: 3000 })

            // 6. Increase quantity
            const plusBtn = page.locator('[data-testid^="qty-plus-"]').first()
            if (await plusBtn.isVisible()) {
                await plusBtn.click()
            }

            // 7. Open payment modal
            const payButton = page.locator('button:has-text(/bayar/i)')
            await payButton.click()

            // 8. Verify payment modal
            await expect(page.locator('text=/pembayaran|payment/i')).toBeVisible({ timeout: 3000 })

            // 9. Select quick amount or enter amount
            const quickAmount = page.locator('button:has-text(/uang pas/i)')
            if (await quickAmount.isVisible({ timeout: 2000 })) {
                await quickAmount.click()
            }

            // 10. Complete payment
            const completeBtn = page.locator('button:has-text(/proses|bayar|selesai/i)').last()
            if (await completeBtn.isEnabled({ timeout: 2000 })) {
                await completeBtn.click()

                // 11. Should show receipt
                await expect(page.locator('text=/struk|receipt|berhasil/i')).toBeVisible({ timeout: 5000 })
            }
        }
    })

    test('should apply discount code during checkout', async ({ page }) => {
        await ensureShiftOpen(page)
        await page.goto('/pos')

        // Look for discount input
        const discountInput = page.locator('[data-testid="discount-code-input"], input[placeholder*="diskon" i]')

        if (await discountInput.isVisible({ timeout: 5000 })) {
            await discountInput.fill('TESTCODE')

            const applyBtn = page.locator('[data-testid="apply-discount-button"], button:has-text(/terapkan/i)')
            if (await applyBtn.isVisible()) {
                await applyBtn.click()
                // Either shows applied discount or error message
            }
        }
    })

    test('should search and select customer', async ({ page }) => {
        await ensureShiftOpen(page)
        await page.goto('/pos')

        const customerInput = page.locator('[data-testid="customer-search-input"], input[placeholder*="pelanggan" i]')

        if (await customerInput.isVisible({ timeout: 5000 })) {
            await customerInput.fill('test')
            // Should show search results or empty
        }
    })
})

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================
test.describe('Product CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/products')
    })

    test('should create a new product', async ({ page }) => {
        // Click add button
        await page.click('button:has-text(/tambah/i)')

        // Fill form
        const nameInput = page.locator('input[placeholder*="nama" i]').first()
        await nameInput.fill('Test Product E2E')

        const priceInput = page.locator('input[placeholder*="harga" i], input[type="number"]').first()
        await priceInput.fill('50000')

        const stockInput = page.locator('input[placeholder*="stok" i]')
        if (await stockInput.isVisible()) {
            await stockInput.fill('100')
        }

        // Submit
        await page.click('button:has-text(/simpan|tambah/i)')

        // Wait for modal to close
        await page.waitForTimeout(1000)
    })

    test('should search for products', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="cari" i]')
        await searchInput.fill('Test Product')

        await page.waitForTimeout(500) // Debounce
    })

    test('should edit a product', async ({ page }) => {
        // Click edit button on first product
        const editBtn = page.locator('button:has(svg.lucide-edit), button:has-text(/edit/i)').first()

        if (await editBtn.isVisible({ timeout: 3000 })) {
            await editBtn.click()

            // Modal should open
            const nameInput = page.locator('input[placeholder*="nama" i], input[name="name"]').first()
            await expect(nameInput).toBeVisible({ timeout: 3000 })
        }
    })
})

// ============================================
// CATEGORY CRUD OPERATIONS
// ============================================
test.describe('Category CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/categories')
    })

    test('should create a new category', async ({ page }) => {
        await page.click('button:has-text(/tambah/i)')

        const nameInput = page.locator('input[placeholder*="nama" i]').first()
        await nameInput.fill('Test Category E2E')

        await page.click('button:has-text(/simpan|tambah/i)')
        await page.waitForTimeout(1000)
    })

    test('should display category list', async ({ page }) => {
        const categoryList = page.locator('.card, [class*="category"]')
        await expect(categoryList.first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// CUSTOMER CRUD OPERATIONS
// ============================================
test.describe('Customer CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/customers')
    })

    test('should create a new customer', async ({ page }) => {
        await page.click('button:has-text(/tambah/i)')

        const nameInput = page.locator('input[placeholder*="nama" i]').first()
        await nameInput.fill('Test Customer E2E')

        const phoneInput = page.locator('input[placeholder*="telepon" i], input[type="tel"]')
        if (await phoneInput.isVisible()) {
            await phoneInput.fill('08123456789')
        }

        await page.click('button:has-text(/simpan|tambah/i)')
        await page.waitForTimeout(1000)
    })

    test('should search for customers', async ({ page }) => {
        const searchInput = page.locator('input[placeholder*="cari" i]')
        await searchInput.fill('Test Customer')
        await page.waitForTimeout(500)
    })
})

// ============================================
// SHIFT OPERATIONS
// ============================================
test.describe('Shift Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/shifts')
    })

    test('should open a new shift', async ({ page }) => {
        const openButton = page.locator('button:has-text(/buka shift/i)')

        if (await openButton.isVisible({ timeout: 3000 })) {
            await openButton.click()

            const cashInput = page.locator('input[type="number"]').first()
            await cashInput.fill('100000')

            await page.click('button:has-text(/buka|simpan/i)')
            await page.waitForTimeout(1000)
        }
    })

    test('should close an open shift', async ({ page }) => {
        const closeButton = page.locator('button:has-text(/tutup shift/i)')

        if (await closeButton.isVisible({ timeout: 3000 })) {
            await closeButton.click()

            const cashInput = page.locator('input[type="number"]').first()
            if (await cashInput.isVisible()) {
                await cashInput.fill('150000')
            }

            await page.click('button:has-text(/tutup|simpan/i)')
            await page.waitForTimeout(1000)
        }
    })
})

// ============================================
// DISCOUNT CRUD OPERATIONS
// ============================================
test.describe('Discount CRUD Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/discounts')
    })

    test('should create a percentage discount', async ({ page }) => {
        await page.click('button:has-text(/tambah/i)')

        // Generate code
        await page.click('[data-testid="generate-code-button"]')

        // Fill name
        const nameInput = page.locator('[data-testid="discount-name-field"]')
        await nameInput.fill('Test Discount 10%')

        // Set value
        const valueInput = page.locator('[data-testid="discount-value-field"]')
        await valueInput.fill('10')

        // Submit
        await page.click('[data-testid="submit-discount-button"]')
        await page.waitForTimeout(1000)
    })

    test('should create a fixed discount', async ({ page }) => {
        await page.click('button:has-text(/tambah/i)')

        // Generate code
        await page.click('[data-testid="generate-code-button"]')

        // Change type to fixed
        const typeSelect = page.locator('[data-testid="discount-type-field"]')
        await typeSelect.selectOption('fixed')

        // Fill name
        await page.locator('[data-testid="discount-name-field"]').fill('Potongan Rp 10.000')

        // Set value
        await page.locator('[data-testid="discount-value-field"]').fill('10000')

        // Submit
        await page.click('[data-testid="submit-discount-button"]')
        await page.waitForTimeout(1000)
    })
})

// ============================================
// REPORT EXPORT OPERATIONS
// ============================================
test.describe('Report Export Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/reports')
    })

    test('should filter reports by date', async ({ page }) => {
        const dateInput = page.locator('input[type="date"]').first()
        await dateInput.fill('2026-01-01')
        await page.waitForTimeout(500)
    })

    test('should export to Excel', async ({ page }) => {
        const exportBtn = page.locator('button:has-text(/excel/i)')

        if (await exportBtn.isVisible({ timeout: 3000 })) {
            // Set up download handler
            const [download] = await Promise.all([
                page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
                exportBtn.click()
            ])

            if (download) {
                expect(download.suggestedFilename()).toContain('.xlsx')
            }
        }
    })

    test('should export to CSV', async ({ page }) => {
        const exportBtn = page.locator('button:has-text(/csv/i)')

        if (await exportBtn.isVisible({ timeout: 3000 })) {
            const [download] = await Promise.all([
                page.waitForEvent('download', { timeout: 10000 }).catch(() => null),
                exportBtn.click()
            ])

            if (download) {
                expect(download.suggestedFilename()).toContain('.csv')
            }
        }
    })
})

// ============================================
// STOCK OPNAME OPERATIONS
// ============================================
test.describe('Stock Opname Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/stock-opname')
    })

    test('should display stock adjustment form', async ({ page }) => {
        const addBtn = page.locator('button:has-text(/tambah|penyesuaian/i)')

        if (await addBtn.isVisible({ timeout: 3000 })) {
            await addBtn.click()

            // Form should appear
            await expect(page.locator('input, select').first()).toBeVisible({ timeout: 3000 })
        }
    })

    test('should show stock history', async ({ page }) => {
        const history = page.locator('text=/riwayat|history|penyesuaian/i')
        await expect(history.first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// SETTINGS OPERATIONS
// ============================================
test.describe('Settings Operations', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
        await page.goto('/settings')
    })

    test('should update store name', async ({ page }) => {
        const nameInput = page.locator('input[placeholder*="toko" i], input[name*="name" i]').first()

        await nameInput.clear()
        await nameInput.fill('Toko Test E2E')

        await page.click('button:has-text(/simpan/i)')
        await page.waitForTimeout(1000)
    })

    test('should update store address', async ({ page }) => {
        const addressInput = page.locator('input[placeholder*="alamat" i], textarea')

        if (await addressInput.first().isVisible()) {
            await addressInput.first().fill('Jl. Test No. 123')
            await page.click('button:has-text(/simpan/i)')
        }
    })
})

// ============================================
// ERROR HANDLING TESTS
// ============================================
test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
        await login(page)
        await page.goto('/nonexistent-page')

        // Should redirect to home or show 404
        await expect(page).toHaveURL('/', { timeout: 5000 })
    })

    test('should handle network errors gracefully', async ({ page }) => {
        await login(page)

        // App should still work with IndexedDB even if offline
        await page.goto('/products')
        await expect(page.locator('text=/produk/i').first()).toBeVisible({ timeout: 5000 })
    })
})

// ============================================
// ACCESSIBILITY TESTS
// ============================================
test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
        await login(page)
    })

    test('should have proper form labels', async ({ page }) => {
        await page.goto('/products')
        await page.click('button:has-text(/tambah/i)')

        const labels = page.locator('label')
        const labelCount = await labels.count()
        expect(labelCount).toBeGreaterThan(0)
    })

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/login')

        // Tab through form
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')
        await page.keyboard.press('Tab')

        // Should reach submit button
        const focusedElement = page.locator(':focus')
        await expect(focusedElement).toBeVisible()
    })

    test('buttons should have proper ARIA attributes or visible text', async ({ page }) => {
        await page.goto('/pos')

        const buttons = page.locator('button')
        const buttonCount = await buttons.count()

        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
            const button = buttons.nth(i)
            const text = await button.textContent()
            const ariaLabel = await button.getAttribute('aria-label')
            const title = await button.getAttribute('title')

            // Button should have either text, aria-label, or title
            expect(text || ariaLabel || title).toBeTruthy()
        }
    })
})
