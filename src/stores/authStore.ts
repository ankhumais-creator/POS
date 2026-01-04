import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'

interface AuthState {
    user: Profile | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (user: Profile) => void
    logout: () => void
    setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            isLoading: true,

            login: (user) => set({
                user,
                isAuthenticated: true,
                isLoading: false
            }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                isLoading: false
            }),

            setLoading: (isLoading) => set({ isLoading })
        }),
        {
            name: 'pos-auth-storage'
        }
    )
)
