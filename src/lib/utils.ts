/**
 * Utility Functions - Consolidated
 */

// Generate unique ID
export function generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() :
        `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Format currency (IDR) - Always shows "Rp" prefix
export function formatCurrency(amount: number): string {
    const formattedNumber = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
    return `Rp${formattedNumber}`
}

// Format date
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', options || {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

// Format date only (YYYY-MM-DD)
export function formatDateOnly(date: Date): string {
    return date.toISOString().split('T')[0]
}

// Format time
export function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Format datetime
export function formatDateTime(dateStr: string): string {
    return `${formatDate(dateStr)} ${formatTime(dateStr)}`
}

// Get relative time (e.g., "5 menit lalu")
export function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes} menit lalu`
    if (hours < 24) return `${hours} jam lalu`
    if (days < 7) return `${days} hari lalu`
    return formatDate(dateStr)
}

// Generate transaction number
export function generateTransactionNumber(): string {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `TRX-${dateStr}-${timeStr.slice(0, 4)}-${random}`
}

// Generate discount code
export function generateDiscountCode(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return code
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn(...args), delay)
    }
}

// Throttle function
export function throttle<T extends (...args: unknown[]) => unknown>(
    fn: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            fn(...args)
            inThrottle = true
            setTimeout(() => (inThrottle = false), limit)
        }
    }
}

// Class name utility (clsx replacement)
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
}

// Parse number from formatted string
export function parseNumber(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0
}

// Validate email
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Validate phone number (Indonesian format)
export function isValidPhone(phone: string): boolean {
    return /^(\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone.replace(/[\s-]/g, ''))
}

// Truncate text
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text
    return text.slice(0, length) + '...'
}

// Sleep/delay function
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

// Check if running on mobile
export function isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
}

// Check if online
export function isOnline(): boolean {
    return navigator.onLine
}

// Deep clone object
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
        const value = String(item[key])
        groups[value] = groups[value] || []
        groups[value].push(item)
        return groups
    }, {} as Record<string, T[]>)
}

// Sum array of numbers
export function sum(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0)
}

// Average of array of numbers
export function average(numbers: number[]): number {
    if (numbers.length === 0) return 0
    return sum(numbers) / numbers.length
}
