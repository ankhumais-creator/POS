import * as XLSX from 'xlsx'
import { formatCurrency, formatDate } from './utils'
import type { Transaction, TransactionItem } from '@/types'

interface ExportData {
    transactions: Transaction[]
    items: Map<string, TransactionItem[]>
    startDate: Date
    endDate: Date
    storeName: string
}

// Export transactions to Excel
export function exportToExcel(data: ExportData): void {
    const workbook = XLSX.utils.book_new()

    // Summary sheet
    const summaryData = [
        ['LAPORAN PENJUALAN'],
        [`Toko: ${data.storeName}`],
        [`Periode: ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        [''],
        ['RINGKASAN'],
        ['Total Transaksi', data.transactions.length],
        ['Total Penjualan', data.transactions.reduce((sum, t) => sum + t.total, 0)],
        ['Total Diskon', data.transactions.reduce((sum, t) => sum + t.discount, 0)],
        ['Rata-rata Transaksi', data.transactions.length > 0
            ? Math.round(data.transactions.reduce((sum, t) => sum + t.total, 0) / data.transactions.length)
            : 0
        ],
    ]

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan')

    // Transactions sheet
    const transactionRows = [
        ['No. Transaksi', 'Tanggal', 'Kasir', 'Subtotal', 'Diskon', 'Total', 'Metode', 'Bayar', 'Kembali', 'Status']
    ]

    for (const tx of data.transactions) {
        transactionRows.push([
            tx.transaction_number,
            formatDate(tx.created_at),
            tx.cashier_id,
            tx.subtotal,
            tx.discount,
            tx.total,
            tx.payment_method,
            tx.payment_amount,
            tx.change_amount,
            tx.status
        ])
    }

    const txSheet = XLSX.utils.aoa_to_sheet(transactionRows)
    XLSX.utils.book_append_sheet(workbook, txSheet, 'Transaksi')

    // Items detail sheet
    const itemRows = [
        ['No. Transaksi', 'Tanggal', 'Produk', 'Harga', 'Qty', 'Diskon', 'Subtotal']
    ]

    for (const tx of data.transactions) {
        const txItems = data.items.get(tx.id) || []
        for (const item of txItems) {
            itemRows.push([
                tx.transaction_number,
                formatDate(tx.created_at),
                item.product_name,
                item.price,
                item.quantity,
                item.discount,
                item.subtotal
            ])
        }
    }

    const itemsSheet = XLSX.utils.aoa_to_sheet(itemRows)
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Detail Item')

    // Product summary sheet
    const productMap = new Map<string, { name: string, qty: number, sales: number }>()
    for (const [, items] of data.items) {
        for (const item of items) {
            const existing = productMap.get(item.product_id) || { name: item.product_name, qty: 0, sales: 0 }
            existing.qty += item.quantity
            existing.sales += item.subtotal
            productMap.set(item.product_id, existing)
        }
    }

    const productRows = [
        ['Produk', 'Qty Terjual', 'Total Penjualan']
    ]

    const sortedProducts = Array.from(productMap.values()).sort((a, b) => b.sales - a.sales)
    for (const prod of sortedProducts) {
        productRows.push([prod.name, prod.qty, prod.sales])
    }

    const productSheet = XLSX.utils.aoa_to_sheet(productRows)
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Per Produk')

    // Download
    const filename = `Laporan_${data.startDate.toISOString().split('T')[0]}_${data.endDate.toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, filename)
}

// Export to CSV (simpler, more compatible)
export function exportToCSV(data: ExportData): void {
    const rows = [
        ['No. Transaksi', 'Tanggal', 'Produk', 'Qty', 'Harga', 'Subtotal', 'Total Transaksi', 'Metode Bayar'].join(',')
    ]

    for (const tx of data.transactions) {
        const txItems = data.items.get(tx.id) || []
        for (const item of txItems) {
            rows.push([
                tx.transaction_number,
                formatDate(tx.created_at),
                `"${item.product_name}"`,
                item.quantity,
                item.price,
                item.subtotal,
                tx.total,
                tx.payment_method
            ].join(','))
        }
    }

    const csvContent = rows.join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `Laporan_${data.startDate.toISOString().split('T')[0]}.csv`
    link.click()

    URL.revokeObjectURL(url)
}

// Generate PDF receipt (using browser print)
export function exportReceiptPDF(receiptHTML: string): void {
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    if (!printWindow) {
        alert('Popup blocked!')
        return
    }

    printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Struk</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', monospace;
          font-size: 10px;
          width: 72mm;
          margin: 4mm;
          padding: 0;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .double { font-size: 14px; }
        .line { border-top: 1px dashed #000; margin: 3px 0; }
        .row { display: flex; justify-content: space-between; }
        @media print {
          body { -webkit-print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      ${receiptHTML}
    </body>
    </html>
  `)

    printWindow.document.close()
    printWindow.focus()

    setTimeout(() => {
        printWindow.print()
    }, 250)
}
