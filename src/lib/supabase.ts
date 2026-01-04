import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Running in offline-only mode.')
}

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

export const isSupabaseConfigured = () => {
    return Boolean(supabaseUrl && supabaseAnonKey)
}

// Auth helpers
export const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    return await supabase.auth.signInWithPassword({ email, password })
}

export const signUp = async (email: string, password: string, full_name: string, role: 'admin' | 'kasir' | 'owner') => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name, role }
        }
    })

    if (error) throw error

    // Create profile
    if (data.user) {
        await supabase.from('profiles').insert({
            id: data.user.id,
            full_name,
            role
        })
    }

    return data
}

export const signOut = async () => {
    if (!isSupabaseConfigured()) throw new Error('Supabase not configured')
    return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase.auth.getUser()
    return data.user
}

export const getSession = async () => {
    if (!isSupabaseConfigured()) return null
    const { data } = await supabase.auth.getSession()
    return data.session
}
