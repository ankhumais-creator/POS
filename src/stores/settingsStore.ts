import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StoreSettings } from '@/types'

interface SettingsState {
    settings: StoreSettings | null
    isOnline: boolean
    isSyncing: boolean

    setSettings: (settings: StoreSettings) => void
    setOnline: (online: boolean) => void
    setSyncing: (syncing: boolean) => void
}

const defaultSettings: StoreSettings = {
    id: 'default',
    name: 'Toko Makmur Jaya',
    address: 'Jl. Raya No. 123, Jakarta',
    phone: '021-12345678',
    receipt_footer: 'Terima kasih atas kunjungan Anda!',
    updated_at: new Date().toISOString()
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: defaultSettings,
            isOnline: navigator.onLine,
            isSyncing: false,

            setSettings: (settings) => set({ settings }),
            setOnline: (isOnline) => set({ isOnline }),
            setSyncing: (isSyncing) => set({ isSyncing })
        }),
        {
            name: 'pos-settings-storage'
        }
    )
)

// Listen for online/offline events
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        useSettingsStore.getState().setOnline(true)
    })

    window.addEventListener('offline', () => {
        useSettingsStore.getState().setOnline(false)
    })
}
