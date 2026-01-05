import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enTranslations from './locales/en.json'
import idTranslations from './locales/id.json'

// Initialize i18next
i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            id: { translation: idTranslations }
        },
        lng: localStorage.getItem('language') || 'id', // Default to Indonesian
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false // React already escapes values
        }
    })

export default i18n
