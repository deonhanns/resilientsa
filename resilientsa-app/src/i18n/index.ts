import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import af from './locales/af.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, af: { translation: af } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'af', 'zu'],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'] },
  })

export default i18n
