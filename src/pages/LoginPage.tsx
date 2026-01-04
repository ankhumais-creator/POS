import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { db } from '@/lib/db'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const login = useAuthStore((state) => state.login)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            if (isSupabaseConfigured()) {
                // Real Supabase auth
                const { data, error: authError } = await supabase.auth.signInWithPassword({
                    email: username,
                    password
                })

                if (authError) throw authError

                if (data.user) {
                    // Get profile
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', data.user.id)
                        .single()

                    if (profileError) throw profileError

                    login(profile)
                    navigate('/')
                }
            } else {
                // Demo mode - check local profiles or create demo user
                const localProfiles = await db.profiles.toArray()

                if (localProfiles.length === 0) {
                    // Create demo admin user
                    const demoUser = {
                        id: 'demo-admin',
                        full_name: username || 'Admin Demo',
                        role: 'admin' as const,
                        created_at: new Date().toISOString()
                    }
                    await db.profiles.add(demoUser)
                    login(demoUser)
                } else {
                    // Use first local profile
                    login(localProfiles[0])
                }

                navigate('/')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('Login gagal. Periksa username dan password Anda.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500 mb-4">
                        <Store className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">POS Kasir</h1>
                    <p className="text-slate-400">Silakan login untuk melanjutkan</p>
                </div>

                {/* Login Card */}
                <div className="card">
                    <div className="card-body">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Demo Mode Notice */}
                            {!isSupabaseConfigured() && (
                                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-sm text-amber-400">
                                        ⚠️ Mode Demo - Supabase belum dikonfigurasi.
                                        Masukkan nama untuk masuk sebagai Admin.
                                    </p>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Username/Email */}
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                    {isSupabaseConfigured() ? 'Email' : 'Nama'}
                                </label>
                                <input
                                    type={isSupabaseConfigured() ? 'email' : 'text'}
                                    className="input"
                                    placeholder={isSupabaseConfigured() ? 'admin@toko.com' : 'Masukkan nama Anda'}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Password */}
                            {isSupabaseConfigured() && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="input pr-10"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="btn btn-primary w-full btn-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    'Login'
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    POS Kasir v1.0.0 • © 2026
                </p>
            </div>
        </div>
    )
}
