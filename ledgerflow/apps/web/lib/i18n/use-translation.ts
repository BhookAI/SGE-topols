'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Locale, getTranslation } from './translations'

interface I18nStore {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: 'es',
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'ledgerflow-locale',
    }
  )
)

export function useTranslation() {
  const { locale, setLocale } = useI18nStore()

  const t = (key: string): string => {
    return getTranslation(locale, key)
  }

  return { t, locale, setLocale }
}
