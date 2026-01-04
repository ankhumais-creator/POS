import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Users, Phone, Mail, Award } from 'lucide-react'
import { db, addToSyncQueue } from '@/lib/db'
import { formatCurrency, generateId } from '@/lib/utils'
import type { Customer } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: ''
    })

    useEffect(() => {
        loadCustomers()
    }, [])

    const loadCustomers = async () => {
        const data = await db.customers.orderBy('name').toArray()
        setCustomers(data)
    }

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone?.includes(searchQuery)
    )

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const customerData: Customer = {
                id: editingCustomer?.id || generateId(),
                name: formData.name,
                phone: formData.phone || undefined,
                email: formData.email || undefined,
                address: formData.address || undefined,
                points: editingCustomer?.points || 0,
                total_spent: editingCustomer?.total_spent || 0,
                visit_count: editingCustomer?.visit_count || 0,
                created_at: editingCustomer?.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString()
            }

            await db.customers.put(customerData)
            await addToSyncQueue('customers', editingCustomer ? 'update' : 'insert', customerData)

            setShowModal(false)
            setEditingCustomer(null)
            resetForm()
            loadCustomers()
        } catch (error) {
            console.error('Error saving customer:', error)
            alert('Gagal menyimpan pelanggan')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer)
        setFormData({
            name: customer.name,
            phone: customer.phone || '',
            email: customer.email || '',
            address: customer.address || ''
        })
        setShowModal(true)
    }

    const handleDelete = async (customer: Customer) => {
        if (!confirm(`Hapus pelanggan "${customer.name}"?`)) return

        await db.customers.delete(customer.id)
        await addToSyncQueue('customers', 'delete', { id: customer.id })
        loadCustomers()
    }

    const resetForm = () => {
        setFormData({ name: '', phone: '', email: '', address: '' })
    }

    return (
        <MainLayout title="Data Pelanggan">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            className="input pl-10"
                            placeholder="Cari pelanggan..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => { resetForm(); setEditingCustomer(null); setShowModal(true) }}>
                        <Plus className="w-4 h-4" />
                        Tambah Pelanggan
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCustomers.length === 0 ? (
                        <div className="col-span-full card p-12 text-center text-slate-500">
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada pelanggan</p>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => (
                            <div key={customer.id} className="card">
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-semibold">{customer.name}</h3>
                                            {customer.phone && (
                                                <p className="text-sm text-slate-400 flex items-center gap-1">
                                                    <Phone className="w-3 h-3" /> {customer.phone}
                                                </p>
                                            )}
                                            {customer.email && (
                                                <p className="text-sm text-slate-400 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {customer.email}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(customer)} className="p-1.5 rounded hover:bg-slate-700 text-slate-400">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(customer)} className="p-1.5 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-700 pt-3">
                                        <div>
                                            <p className="text-xs text-slate-500">Kunjungan</p>
                                            <p className="font-semibold">{customer.visit_count}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Total Belanja</p>
                                            <p className="font-semibold text-blue-400">{formatCurrency(customer.total_spent)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500">Poin</p>
                                            <p className="font-semibold text-amber-400 flex items-center justify-center gap-1">
                                                <Award className="w-3 h-3" /> {customer.points}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold">{editingCustomer ? 'Edit' : 'Tambah'} Pelanggan</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400">×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Nama *</label>
                                    <input type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">No. HP</label>
                                    <input type="tel" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Email</label>
                                    <input type="email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">Alamat</label>
                                    <textarea className="input" rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary" disabled={isLoading}>{isLoading ? 'Menyimpan...' : 'Simpan'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
