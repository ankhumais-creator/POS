import { useState, useEffect } from 'react'
import { Store, Save, Loader2 } from 'lucide-react'
import { db } from '@/lib/db'
import { useSettingsStore } from '@/stores/settingsStore'
import type { StoreSettings } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function SettingsPage() {
    const { settings, setSettings } = useSettingsStore()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        receipt_footer: ''
    })

    useEffect(() => {
        if (settings) {
            setFormData({
                name: settings.name || '',
                address: settings.address || '',
                phone: settings.phone || '',
                receipt_footer: settings.receipt_footer || ''
            })
        }
    }, [settings])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const updatedSettings: StoreSettings = {
                ...settings!,
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                receipt_footer: formData.receipt_footer,
                updated_at: new Date().toISOString()
            }

            await db.storeSettings.put(updatedSettings)
            setSettings(updatedSettings)

            alert('Pengaturan berhasil disimpan!')
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Gagal menyimpan pengaturan')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <MainLayout title="Pengaturan">
            <div className="max-w-2xl space-y-6">
                {/* Store Info */}
                <div className="card">
                    <div className="card-header flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-400" />
                        <span>Informasi Toko</span>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="card-body space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Nama Toko *
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="contoh: Toko Makmur Jaya"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Alamat
                                </label>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="contoh: Jl. Raya No. 123, Jakarta"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Telepon
                                </label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="contoh: 021-12345678"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                    Footer Struk
                                </label>
                                <textarea
                                    className="input"
                                    rows={2}
                                    value={formData.receipt_footer}
                                    onChange={(e) => setFormData({ ...formData, receipt_footer: e.target.value })}
                                    placeholder="contoh: Terima kasih atas kunjungan Anda!"
                                />
                                <p className="text-xs text-slate-500 mt-1">Teks ini akan muncul di bagian bawah struk</p>
                            </div>
                        </div>

                        <div className="px-4 py-3 border-t border-slate-700 flex justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Simpan Pengaturan
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* App Info */}
                <div className="card p-4">
                    <h3 className="font-medium mb-3">Tentang Aplikasi</h3>
                    <div className="text-sm text-slate-400 space-y-1">
                        <p><strong>POS Kasir PWA</strong> v1.0.0</p>
                        <p>Aplikasi Point of Sale dengan fitur offline-first</p>
                        <p className="pt-2">© 2026 - All rights reserved</p>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
