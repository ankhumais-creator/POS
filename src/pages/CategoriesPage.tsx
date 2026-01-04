import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, FolderOpen, Loader2, GripVertical } from 'lucide-react'
import { db, addToSyncQueue } from '@/lib/db'
import { generateId } from '@/lib/utils'
import type { Category } from '@/types'
import MainLayout from '@/components/layout/MainLayout'

const colorOptions = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
]

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        color: colorOptions[0]
    })

    useEffect(() => {
        loadCategories()
    }, [])

    const loadCategories = async () => {
        const cats = await db.categories.orderBy('sort_order').toArray()
        setCategories(cats)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const categoryData: Category = {
                id: editingCategory?.id || generateId(),
                name: formData.name,
                color: formData.color,
                sort_order: editingCategory?.sort_order || categories.length,
                created_at: editingCategory?.created_at || new Date().toISOString()
            }

            await db.categories.put(categoryData)
            await addToSyncQueue('categories', editingCategory ? 'update' : 'insert', categoryData)

            setShowModal(false)
            setEditingCategory(null)
            resetForm()
            loadCategories()
        } catch (error) {
            console.error('Error saving category:', error)
            alert('Gagal menyimpan kategori')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            color: category.color
        })
        setShowModal(true)
    }

    const handleDelete = async (category: Category) => {
        // Check if category has products
        const products = await db.products.where('category_id').equals(category.id).count()
        if (products > 0) {
            alert(`Kategori ini memiliki ${products} produk. Hapus atau pindahkan produk terlebih dahulu.`)
            return
        }

        if (!confirm(`Hapus kategori "${category.name}"?`)) return

        await db.categories.delete(category.id)
        await addToSyncQueue('categories', 'delete', { id: category.id })
        loadCategories()
    }

    const resetForm = () => {
        setFormData({
            name: '',
            color: colorOptions[0]
        })
    }

    return (
        <MainLayout title="Manajemen Kategori">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <p className="text-slate-400">{categories.length} kategori</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            resetForm()
                            setEditingCategory(null)
                            setShowModal(true)
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Tambah Kategori
                    </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.length === 0 ? (
                        <div className="col-span-full">
                            <div className="card p-12 text-center text-slate-500">
                                <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Belum ada kategori</p>
                                <p className="text-sm mt-1">Tambahkan kategori untuk mengelompokkan produk</p>
                            </div>
                        </div>
                    ) : (
                        categories.map((category, index) => (
                            <div
                                key={category.id}
                                className="card hover:border-slate-600 transition-colors"
                            >
                                <div className="p-4 flex items-center gap-4">
                                    <div className="text-slate-600 cursor-grab">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                        style={{ backgroundColor: category.color }}
                                    >
                                        {category.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{category.name}</p>
                                        <p className="text-sm text-slate-500">Urutan: {index + 1}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                                            onClick={() => handleDelete(category)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="text-lg font-semibold">
                                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
                            </h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1.5">
                                        Nama Kategori *
                                    </label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="contoh: Makanan"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">
                                        Warna
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {colorOptions.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`w-8 h-8 rounded-lg transition-all ${formData.color === color
                                                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800'
                                                        : ''
                                                    }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setFormData({ ...formData, color })}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Batal
                                </button>
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
                                        'Simpan'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    )
}
