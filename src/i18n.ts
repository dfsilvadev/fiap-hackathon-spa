import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  pt: {
    translation: {
      welcome: 'Bem-vindo ao FIAP Hackathon SPA',
      description: 'React + TypeScript + Vite + Tailwind + i18next',
    },
  },
  en: {
    translation: {
      welcome: 'Welcome to FIAP Hackathon SPA',
      description: 'React + TypeScript + Vite + Tailwind + i18next',
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
})
