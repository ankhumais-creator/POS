// ESC/POS Thermal Printer Commands
// This module provides utilities for thermal receipt printing

// ESC/POS Command constants
const ESC = '\x1B'
const GS = '\x1D'
const LF = '\x0A'

// Text alignment
export const ALIGN_LEFT = `${ESC}a\x00`
export const ALIGN_CENTER = `${ESC}a\x01`
export const ALIGN_RIGHT = `${ESC}a\x02`

// Text style
export const BOLD_ON = `${ESC}E\x01`
export const BOLD_OFF = `${ESC}E\x00`
export const DOUBLE_HEIGHT = `${GS}!\x10`
export const DOUBLE_WIDTH = `${GS}!\x20`
export const DOUBLE_SIZE = `${GS}!\x30`
export const NORMAL_SIZE = `${GS}!\x00`

// Other commands
export const CUT_PAPER = `${GS}V\x00`
export const OPEN_DRAWER = `${ESC}p\x00\x19\xFA`
export const INIT_PRINTER = `${ESC}@`

interface ReceiptLine {
    text: string
    align?: 'left' | 'center' | 'right'
    bold?: boolean
    doubleSize?: boolean
}

interface PrintReceiptOptions {
    storeName: string
    storeAddress?: string
    storePhone?: string
    transactionNumber: string
    date: string
    cashier: string
    items: {
        name: string
        qty: number
        price: number
        subtotal: number
    }[]
    subtotal: number
    discount: number
    total: number
    paymentMethod: string
    paymentAmount: number
    changeAmount: number
    footer?: string
}

// Generate ESC/POS receipt data
export function generateReceiptData(options: PrintReceiptOptions): string {
    const lines: string[] = []
    const lineWidth = 32 // Standard 58mm thermal printer

    // Helper functions
    const addLine = (text: string) => lines.push(text + LF)
    const addEmptyLine = () => lines.push(LF)
    const padRight = (str: string, len: number) => str.padEnd(len).slice(0, len)
    const padLeft = (str: string, len: number) => str.padStart(len).slice(0, len)
    const formatCurrency = (num: number) => `Rp${num.toLocaleString('id-ID')}`
    const dashedLine = '-'.repeat(lineWidth)

    // Initialize printer
    lines.push(INIT_PRINTER)

    // Header - Store info
    lines.push(ALIGN_CENTER)
    lines.push(BOLD_ON)
    lines.push(DOUBLE_SIZE)
    addLine(options.storeName)
    lines.push(NORMAL_SIZE)
    lines.push(BOLD_OFF)

    if (options.storeAddress) {
        addLine(options.storeAddress)
    }
    if (options.storePhone) {
        addLine(options.storePhone)
    }

    addEmptyLine()
    lines.push(ALIGN_LEFT)
    addLine(dashedLine)

    // Transaction info
    addLine(`No: ${options.transactionNumber}`)
    addLine(`Tgl: ${options.date}`)
    addLine(`Kasir: ${options.cashier}`)
    addLine(dashedLine)

    // Items
    for (const item of options.items) {
        addLine(item.name)
        const qtyPrice = `${item.qty} x ${formatCurrency(item.price)}`
        const subtotal = formatCurrency(item.subtotal)
        addLine(`  ${padRight(qtyPrice, lineWidth - subtotal.length - 2)}${subtotal}`)
    }

    addLine(dashedLine)

    // Totals
    const labelWidth = 12
    addLine(`${padRight('Subtotal', labelWidth)}${padLeft(formatCurrency(options.subtotal), lineWidth - labelWidth)}`)

    if (options.discount > 0) {
        addLine(`${padRight('Diskon', labelWidth)}${padLeft(`-${formatCurrency(options.discount)}`, lineWidth - labelWidth)}`)
    }

    lines.push(BOLD_ON)
    addLine(`${padRight('TOTAL', labelWidth)}${padLeft(formatCurrency(options.total), lineWidth - labelWidth)}`)
    lines.push(BOLD_OFF)

    addLine(`${padRight(options.paymentMethod, labelWidth)}${padLeft(formatCurrency(options.paymentAmount), lineWidth - labelWidth)}`)
    addLine(`${padRight('Kembali', labelWidth)}${padLeft(formatCurrency(options.changeAmount), lineWidth - labelWidth)}`)

    addLine(dashedLine)

    // Footer
    lines.push(ALIGN_CENTER)
    addEmptyLine()
    lines.push(BOLD_ON)
    addLine('*** TERIMA KASIH ***')
    lines.push(BOLD_OFF)

    if (options.footer) {
        addLine(options.footer)
    }

    addEmptyLine()
    addEmptyLine()
    addEmptyLine()

    // Cut paper
    lines.push(CUT_PAPER)

    return lines.join('')
}

// Print via Web USB (for USB thermal printers)
export async function printViaUSB(data: string): Promise<boolean> {
    try {
        if (!('usb' in navigator)) {
            throw new Error('Web USB not supported')
        }

        // Request USB device
        const device = await (navigator as any).usb.requestDevice({
            filters: [
                { vendorId: 0x0483 }, // Common thermal printer vendor IDs
                { vendorId: 0x0416 },
                { vendorId: 0x04b8 }, // Epson
                { vendorId: 0x0519 }, // Star
            ]
        })

        await device.open()
        await device.selectConfiguration(1)
        await device.claimInterface(0)

        // Find bulk OUT endpoint
        const endpoint = device.configuration?.interfaces[0]?.alternate?.endpoints?.find(
            (e: any) => e.direction === 'out' && e.type === 'bulk'
        )

        if (!endpoint) {
            throw new Error('No bulk OUT endpoint found')
        }

        // Send data
        const encoder = new TextEncoder()
        await device.transferOut(endpoint.endpointNumber, encoder.encode(data))

        await device.close()
        return true
    } catch (error) {
        console.error('USB print error:', error)
        return false
    }
}

// Print via Web Bluetooth (for Bluetooth thermal printers)
export async function printViaBluetooth(data: string): Promise<boolean> {
    try {
        if (!('bluetooth' in navigator)) {
            throw new Error('Web Bluetooth not supported')
        }

        // Request Bluetooth device
        const device = await (navigator as any).bluetooth.requestDevice({
            filters: [
                { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Common thermal printer service
            ],
            optionalServices: ['battery_service']
        })

        const server = await device.gatt?.connect()
        if (!server) throw new Error('Failed to connect to GATT server')

        const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb')
        const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb')

        // Send data in chunks (BLE has MTU limits)
        const encoder = new TextEncoder()
        const bytes = encoder.encode(data)
        const chunkSize = 20

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.slice(i, i + chunkSize)
            await characteristic.writeValue(chunk)
        }

        await server.disconnect()
        return true
    } catch (error) {
        console.error('Bluetooth print error:', error)
        return false
    }
}

// Print via browser (uses browser print dialog - fallback)
export function printViaBrowser(htmlContent: string): void {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
        alert('Popup blocked! Izinkan popup untuk mencetak.')
        return
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Cetak Struk</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 58mm;
          margin: 0 auto;
          padding: 5mm;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .double { font-size: 16px; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      ${htmlContent}
      <script>
        window.onload = function() {
          window.print();
          window.onafterprint = function() { window.close(); };
        };
      </script>
    </body>
    </html>
  `)

    printWindow.document.close()
}

// Generate HTML receipt for browser printing
export function generateReceiptHTML(options: PrintReceiptOptions): string {
    const formatCurrency = (num: number) => `Rp ${num.toLocaleString('id-ID')}`

    return `
    <div class="center bold double">${options.storeName}</div>
    ${options.storeAddress ? `<div class="center">${options.storeAddress}</div>` : ''}
    ${options.storePhone ? `<div class="center">${options.storePhone}</div>` : ''}
    <div class="line"></div>
    <div>No: ${options.transactionNumber}</div>
    <div>Tgl: ${options.date}</div>
    <div>Kasir: ${options.cashier}</div>
    <div class="line"></div>
    ${options.items.map(item => `
      <div>${item.name}</div>
      <div class="row">
        <span>${item.qty} x ${formatCurrency(item.price)}</span>
        <span>${formatCurrency(item.subtotal)}</span>
      </div>
    `).join('')}
    <div class="line"></div>
    <div class="row"><span>Subtotal</span><span>${formatCurrency(options.subtotal)}</span></div>
    ${options.discount > 0 ? `<div class="row"><span>Diskon</span><span>-${formatCurrency(options.discount)}</span></div>` : ''}
    <div class="row bold"><span>TOTAL</span><span>${formatCurrency(options.total)}</span></div>
    <div class="row"><span>${options.paymentMethod}</span><span>${formatCurrency(options.paymentAmount)}</span></div>
    <div class="row"><span>Kembali</span><span>${formatCurrency(options.changeAmount)}</span></div>
    <div class="line"></div>
    <div class="center bold">*** TERIMA KASIH ***</div>
    ${options.footer ? `<div class="center">${options.footer}</div>` : ''}
  `
}
