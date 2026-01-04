import { useState, useEffect } from 'react'
import { Clock, PlayCircle, StopCircle, AlertCircle } from 'lucide-react'
import { db, addToSyncQueue, getCurrentShift } from '@/lib/db'
import { formatCurrency, formatDate, generateId } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import type { Shift } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function ShiftsPage() {
    const [shifts, setShifts] = useState<Shift[]>([])
    const [currentShift, setCurrentShift] = useState<Shift | null>(null)
    const [showOpenModal, setShowOpenModal] = useState(false)
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [openingCash, setOpeningCash] = useState('')
    const [closingCash, setClosingCash] = useState('')
    const [closingNotes, setClosingNotes] = useState('')

    const user = useAuthStore((state) => state.user)

    useEffect(() => {
        loadData()
    }, [user])

    const loadData = async () => {
        if (!user) return

        const allShifts = await db.shifts.orderBy('opened_at').reverse().limit(20).toArray()
        setShifts(allShifts)

        const active = await getCurrentShift(user.id)
        setCurrentShift(active || null)
    }

    const handleOpenShift = async () => {
        if (!user || !openingCash) return

        const shift: Shift = {
            id: generateId(),
            cashier_id: user.id,
            cashier_name: user.full_name,
            opening_cash: Number.parseFloat(openingCash),
            total_sales: 0,
            total_transactions: 0,
            status: 'open',
            opened_at: new Date().toISOString()
        }

        await db.shifts.add(shift)
        await addToSyncQueue('shifts', 'insert', shift as unknown as Record<string, unknown>)

        setShowOpenModal(false)
        setOpeningCash('')
        loadData()
    }

    const handleCloseShift = async () => {
        if (!currentShift || !closingCash) return

        // Calculate expected cash and difference
        const expectedCash = currentShift.opening_cash + currentShift.total_sales
        const actualCash = Number.parseFloat(closingCash)
        const difference = actualCash - expectedCash

        const updatedShift: Shift = {
            ...currentShift,
            closing_cash: actualCash,
            expected_cash: expectedCash,
            difference,
            status: 'closed',
            closed_at: new Date().toISOString(),
            notes: closingNotes || undefined
        }

        await db.shifts.put(updatedShift)
        await addToSyncQueue('shifts', 'update', updatedShift as unknown as Record<string, unknown>)

        setShowCloseModal(false)
        setClosingCash('')
        setClosingNotes('')
        loadData()
    }

    return (
        <MainLayout title="Manajemen Shift">
            <div className="space-y-6">
                {/* Current Shift Status */}
                <div className={`card p-6 ${currentShift ? 'border-emerald-500/50' : 'border-amber-500/50'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${currentShift ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                <Clock className={`w-6 h-6 ${currentShift ? 'text-emerald-400' : 'text-amber-400'}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">
                                    {currentShift ? 'Shift Aktif' : 'Tidak Ada Shift Aktif'}
                                </h3>
                                {currentShift ? (
                                    <p className="text-sm text-slate-400">
                                        Dibuka: {formatDate(currentShift.opened_at)} • Kas Awal: {formatCurrency(currentShift.opening_cash)}
                                    </p>
                                ) : (
                                    <p className="text-sm text-slate-400">Buka shift untuk mulai bertransaksi</p>
                                )}
                            </div>
                        </div>

                        {currentShift ? (
                            <button className="btn btn-danger" onClick={() => setShowCloseModal(true)}>
                                <StopCircle className="w-4 h-4" />
                                Tutup Shift
                            </button>
                        ) : (
                            <button className="btn btn-success" onClick={() => setShowOpenModal(true)}>
                                <PlayCircle className="w-4 h-4" />
                                Buka Shift
                            </button>
                        )}
                    </div>

                    {currentShift && (
                        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700">
                            <div className="text-center">
                                <p className="text-sm text-slate-400">Transaksi</p>
                                <p className="text-2xl font-bold">{currentShift.total_transactions}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-slate-400">Total Penjualan</p>
                                <p className="text-2xl font-bold text-blue-400">{formatCurrency(currentShift.total_sales)}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm text-slate-400">Kas Diharapkan</p>
                                <p className="text-2xl font-bold text-emerald-400">
                                    {formatCurrency(currentShift.opening_cash + currentShift.total_sales)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Shift History */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold">Riwayat Shift</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700 bg-slate-800/50">
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Kasir</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Waktu Buka</th>
                                    <th className="text-left p-4 text-sm font-medium text-slate-400">Waktu Tutup</th>
                                    <th className="text-right p-4 text-sm font-medium text-slate-400">Kas Awal</th>
                                    <th className="text-right p-4 text-sm font-medium text-slate-400">Penjualan</th>
                                    <th className="text-right p-4 text-sm font-medium text-slate-400">Selisih</th>
                                    <th className="text-center p-4 text-sm font-medium text-slate-400">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {shifts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">Belum ada riwayat shift</td>
                                    </tr>
                                ) : (
                                    shifts.map(shift => (
                                        <tr key={shift.id} className="border-b border-slate-700/50 hover:bg-slate-800/50">
                                            <td className="p-4 font-medium">{shift.cashier_name}</td>
                                            <td className="p-4 text-sm text-slate-400">{formatDate(shift.opened_at)}</td>
                                            <td className="p-4 text-sm text-slate-400">{shift.closed_at ? formatDate(shift.closed_at) : '-'}</td>
                                            <td className="p-4 text-right">{formatCurrency(shift.opening_cash)}</td>
                                            <td className="p-4 text-right text-blue-400">{formatCurrency(shift.total_sales)}</td>
                                            <td className="p-4 text-right">
                                                {shift.difference !== undefined ? (
                                                    <span className={shift.difference >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                                        {shift.difference >= 0 ? '+' : ''}{formatCurrency(shift.difference)}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`badge ${shift.status === 'open' ? 'badge-success' : 'badge-primary'}`}>
                                                    {shift.status === 'open' ? 'Aktif' : 'Selesai'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Open Shift Modal */}
            {showOpenModal && (
                <div className="modal-overlay" onClick={() => setShowOpenModal(false)}>
                    <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <PlayCircle className="w-5 h-5 text-emerald-400" />
                                Buka Shift
                            </h3>
                            <button onClick={() => setShowOpenModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">×</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Kas Awal *</label>
                                <div className="relative">
                                    {!openingCash && (
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">Rp</span>
                                    )}
                                    <input
                                        type="number"
                                        className="input"
                                        style={{ paddingLeft: openingCash ? '0.875rem' : '2.5rem' }}
                                        placeholder="0"
                                        value={openingCash}
                                        onChange={(e) => setOpeningCash(e.target.value)}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">Masukkan jumlah uang di laci kas</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowOpenModal(false)}>Batal</button>
                            <button className="btn btn-success" onClick={handleOpenShift} disabled={!openingCash}>Buka Shift</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Shift Modal */}
            {showCloseModal && currentShift && (
                <div className="modal-overlay" onClick={() => setShowCloseModal(false)}>
                    <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <StopCircle className="w-5 h-5 text-red-400" />
                                Tutup Shift
                            </h3>
                            <button onClick={() => setShowCloseModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">×</button>
                        </div>
                        <div className="modal-body space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Kas Awal</span>
                                    <span>{formatCurrency(currentShift.opening_cash)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Penjualan</span>
                                    <span className="text-blue-400">+{formatCurrency(currentShift.total_sales)}</span>
                                </div>
                                <div className="flex justify-between font-semibold pt-2 border-t border-slate-700">
                                    <span>Kas Diharapkan</span>
                                    <span className="text-emerald-400">{formatCurrency(currentShift.opening_cash + currentShift.total_sales)}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Kas Aktual *</label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="0"
                                    value={closingCash}
                                    onChange={(e) => setClosingCash(e.target.value)}
                                />
                            </div>

                            {closingCash && (
                                <div className={`p-3 rounded-lg flex items-center gap-2 ${Number.parseFloat(closingCash) - (currentShift.opening_cash + currentShift.total_sales) >= 0
                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                    : 'bg-red-500/10 border border-red-500/30'
                                    }`}>
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">
                                        Selisih: {formatCurrency(Number.parseFloat(closingCash) - (currentShift.opening_cash + currentShift.total_sales))}
                                    </span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Catatan</label>
                                <textarea
                                    className="input"
                                    rows={2}
                                    placeholder="Catatan shift (opsional)"
                                    value={closingNotes}
                                    onChange={(e) => setClosingNotes(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowCloseModal(false)}>Batal</button>
                            <button className="btn btn-danger" onClick={handleCloseShift} disabled={!closingCash}>Tutup Shift</button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
