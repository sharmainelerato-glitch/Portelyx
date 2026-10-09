import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  DEFAULT_PORTELYX_LANGUAGE,
  PORTELYX_LANGUAGES,
  getPortelyxLanguage,
} from './languages'

import en from './translations/en'
import southernAfrica from './translations/southernAfrica'
import africa from './translations/africa'
import asia from './translations/asia'
import middleEast from './translations/middleEast'
import europe from './translations/europe'
import pacific from './translations/pacific'
import americas from './translations/americas'

type TranslationValue =
  | string
  | {
      [key: string]: TranslationValue
    }

export type TranslationDictionary = {
  [key: string]: TranslationValue
}

const TRANSLATIONS: Record<string, TranslationDictionary> = {
  en,
  ...southernAfrica,
  ...africa,
  ...asia,
  ...middleEast,
  ...europe,
  ...pacific,
  ...americas,
}

export const PORTELYX_LOCALE_ALIASES: Record<string, string> = {
  nso: 'nso',
  nr: 'nr',
  sfs: 'sfs',
  pcm: 'pcm',
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-HK',
  yue: 'yue',
}

type I18nContextValue = {
  languageCode: string
  languageName: string
  nativeLanguageName: string
  direction: 'ltr' | 'rtl'

  setLanguage: (code: string) => void

  t: (
    key: string,
    variables?: Record<string, string | number>,
  ) => string

  isEnglish: boolean
  hasNativeTranslations: boolean
}

const I18nContext =
  createContext<I18nContextValue | null>(null)

const STORAGE_KEY = 'portelyx-language'

const isSupportedLanguage = (code: string) =>
  PORTELYX_LANGUAGES.some(
    (language) => language.code === code,
  )

function getNestedTranslation(
  dictionary: TranslationDictionary | undefined,
  key: string,
): string | undefined {
  if (!dictionary) return undefined

  const parts = key.split('.')

  let current: TranslationValue | undefined =
    dictionary

  for (const part of parts) {
    if (
      !current ||
      typeof current === 'string'
    ) {
      return undefined
    }

    current = current[part]
  }

  return typeof current === 'string'
    ? current
    : undefined
}

function replaceVariables(
  text: string,
  variables?: Record<string, string | number>,
) {
  if (!variables) return text

  return Object.entries(variables).reduce(
    (result, [key, value]) =>
      result.replaceAll(
        `{{${key}}}`,
        String(value),
      ),
    text,
  )
}

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return DEFAULT_PORTELYX_LANGUAGE
  }

  const savedLanguage =
    window.localStorage.getItem(STORAGE_KEY)

  if (
    savedLanguage &&
    isSupportedLanguage(savedLanguage)
  ) {
    return savedLanguage
  }

  const browserLanguages = [
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean)

  for (const browserLanguage of browserLanguages) {
    const exactMatch =
      PORTELYX_LANGUAGES.find(
        (language) =>
          language.code.toLowerCase() ===
          browserLanguage.toLowerCase(),
      )

    if (exactMatch) {
      return exactMatch.code
    }

    const browserBase =
      browserLanguage
        .split('-')[0]
        .toLowerCase()

    const baseMatch =
      PORTELYX_LANGUAGES.find(
        (language) =>
          language.code
            .split('-')[0]
            .toLowerCase() === browserBase,
      )

    if (baseMatch) {
      return baseMatch.code
    }
  }

  return DEFAULT_PORTELYX_LANGUAGE
}

type I18nProviderProps = {
  children: ReactNode
}

export function I18nProvider({
  children,
}: I18nProviderProps) {
  const [languageCode, setLanguageCode] =
    useState(getInitialLanguage)

  const language =
    getPortelyxLanguage(languageCode) ??
    getPortelyxLanguage(
      DEFAULT_PORTELYX_LANGUAGE,
    )!

  const setLanguage = useCallback(
    (code: string) => {
      if (!isSupportedLanguage(code)) {
        console.warn(
          `PORTELYX language "${code}" is not supported.`,
        )
        return
      }

      setLanguageCode(code)

      window.localStorage.setItem(
        STORAGE_KEY,
        code,
      )
    },
    [],
  )

  useEffect(() => {
    document.documentElement.lang =
      language.code

    document.documentElement.dir =
      language.direction

    document.body.dataset.portelyxLanguage =
      language.code
  }, [
    language.code,
    language.direction,
  ])

  const t = useCallback(
    (
      key: string,
      variables?: Record<
        string,
        string | number
      >,
    ) => {
      const selectedDictionary =
        TRANSLATIONS[languageCode]

      const englishDictionary =
        TRANSLATIONS[
          DEFAULT_PORTELYX_LANGUAGE
        ]

      const selectedText =
        getNestedTranslation(
          selectedDictionary,
          key,
        )

      const englishText =
        getNestedTranslation(
          englishDictionary,
          key,
        )

      const text =
        selectedText ??
        englishText ??
        key

      return replaceVariables(
        text,
        variables,
      )
    },
    [languageCode],
  )

  const value =
    useMemo<I18nContextValue>(
      () => ({
        languageCode,
        languageName: language.name,
        nativeLanguageName:
          language.nativeName,
        direction: language.direction,

        setLanguage,
        t,

        isEnglish:
          languageCode ===
          DEFAULT_PORTELYX_LANGUAGE,

        hasNativeTranslations:
          Boolean(
            TRANSLATIONS[languageCode],
          ),
      }),
      [
        languageCode,
        language.name,
        language.nativeName,
        language.direction,
        setLanguage,
        t,
      ],
    )

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function usePortelyxLanguage() {
  const context = useContext(I18nContext)

  if (!context) {
    throw new Error(
      'usePortelyxLanguage must be used inside I18nProvider.',
    )
  }

  return context
}

export function getLanguageInstruction(
  languageCode: string,
) {
  const language =
    getPortelyxLanguage(languageCode) ??
    getPortelyxLanguage(
      DEFAULT_PORTELYX_LANGUAGE,
    )!

  if (language.code === 'sfs') {
    return [
      'The user selected South African Sign Language (SASL).',
      'Do not claim that written text is SASL.',
      'Use clear and concise written English as an accessibility fallback.',
      'Where signed content is unavailable, say so clearly.',
    ].join(' ')
  }

  return [
    `Respond in ${language.name}.`,
    `The user's preferred language is ${language.nativeName}.`,
    'Preserve all numbers, currencies, percentages, dates, account values, Decision Resilience Scores, Breakpoint values, and deterministic PORTELYX financial results exactly as supplied.',
    'Translate explanations and conversational content, not financial calculations.',
    'Do not alter numerical results while translating.',
  ].join(' ')
}