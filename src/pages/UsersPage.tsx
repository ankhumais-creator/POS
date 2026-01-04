import { Users } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'

export default function UsersPage() {
    return (
        <MainLayout title="Manajemen Pengguna">
            <div className="flex items-center justify-center h-64">
                <div className="text-center text-slate-500">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Manajemen Pengguna</h3>
                    <p className="text-sm">Fitur ini memerlukan Supabase Auth yang dikonfigurasi.</p>
                    <p className="text-sm mt-1">Atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY</p>
                </div>
            </div>
        </MainLayout>
    )
}
