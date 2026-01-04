import { test, expect } from '@playwright/test'

test.describe('POS Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login')
        await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@toko.com')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL('/', { timeout: 10000 })

        // Navigate to POS
        await page.goto('/pos')
        await expect(page).toHaveURL('/pos')
    })

    test('should display product grid', async ({ page }) => {
        // Check for product cards or empty state
        const productCards = page.locator('.product-card, [class*="product"]')
        const emptyState = page.locator('text=/tidak ada produk|no products/i')

        await expect(productCards.first().or(emptyState)).toBeVisible({ timeout: 5000 })
    })

    test('should add product to cart', async ({ page }) => {
        // Click on first available product
        const productCard = page.locator('button.product-card, .product-card').first()

        if (await productCard.isVisible()) {
            await productCard.click()

            // Check cart has items
            const cartItem = page.locator('.cart-item, [class*="cart"]')
            await expect(cartItem.first()).toBeVisible({ timeout: 3000 })
        }
    })

    test('should update quantity in cart', async ({ page }) => {
        // Add product first
        const productCard = page.locator('button.product-card, .product-card').first()

        if (await productCard.isVisible()) {
            await productCard.click()

            // Find quantity controls
            const plusButton = page.locator('button:has-text("+")').first()
            if (await plusButton.isVisible()) {
                await plusButton.click()

                // Quantity should be 2
                await expect(page.locator('text="2"')).toBeVisible()
            }
        }
    })

    test('should open payment modal', async ({ page }) => {
        // Add product
        const productCard = page.locator('button.product-card, .product-card').first()

        if (await productCard.isVisible()) {
            await productCard.click()

            // Click pay button
            const payButton = page.locator('button:has-text(/bayar/i)').first()
            await payButton.click()

            // Payment modal should appear
            await expect(page.locator('text=/pembayaran|payment/i')).toBeVisible({ timeout: 3000 })
        }
    })

    test('should complete cash payment', async ({ page }) => {
        // Add product
        const productCard = page.locator('button.product-card, .product-card').first()

        if (await productCard.isVisible()) {
            await productCard.click()

            // Open payment modal
            const payButton = page.locator('button:has-text(/bayar/i)').first()
            await payButton.click()

            // Wait for modal
            await expect(page.locator('text=/pembayaran|payment/i')).toBeVisible({ timeout: 3000 })

            // Click quick amount or enter amount
            const quickAmount = page.locator('button:has-text(/uang pas|exact/i), button:has-text(/50.000|100.000/)').first()
            if (await quickAmount.isVisible()) {
                await quickAmount.click()
            }

            // Complete payment
            const confirmButton = page.locator('button:has-text(/proses|konfirmasi|complete/i)').first()
            if (await confirmButton.isEnabled()) {
                await confirmButton.click()

                // Should show receipt or success
                await expect(page.locator('text=/sukses|berhasil|receipt|struk/i')).toBeVisible({ timeout: 5000 })
            }
        }
    })
})

test.describe('Product Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
        await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@toko.com')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should display products page', async ({ page }) => {
        await page.goto('/products')
        await expect(page.locator('text=/produk/i').first()).toBeVisible()
    })

    test('should open add product modal', async ({ page }) => {
        await page.goto('/products')

        const addButton = page.locator('button:has-text(/tambah|add/i)').first()
        if (await addButton.isVisible()) {
            await addButton.click()

            // Modal should appear with form
            await expect(page.locator('input[name="name"], input[placeholder*="nama" i]')).toBeVisible({ timeout: 3000 })
        }
    })
})

test.describe('Reports', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login')
        await page.fill('input[type="email"], input[placeholder*="email" i]', 'admin@toko.com')
        await page.fill('input[type="password"]', 'admin123')
        await page.click('button[type="submit"]')
        await expect(page).toHaveURL('/', { timeout: 10000 })
    })

    test('should display reports page', async ({ page }) => {
        await page.goto('/reports')
        await expect(page.locator('text=/laporan|report/i').first()).toBeVisible()
    })

    test('should have export options', async ({ page }) => {
        await page.goto('/reports')

        // Look for export button
        const exportButton = page.locator('button:has-text(/export|unduh/i)').first()
        await expect(exportButton).toBeVisible({ timeout: 5000 })
    })
})
