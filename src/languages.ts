export type PortelyxLanguage = {
  code: string
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  region: string
}

export const PORTELYX_LANGUAGES: PortelyxLanguage[] = [
  // South Africa
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', direction: 'ltr', region: 'South Africa' },
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', region: 'Global' },
  { code: 'nso', name: 'Northern Sotho', nativeName: 'Sepedi', direction: 'ltr', region: 'South Africa' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', direction: 'ltr', region: 'South Africa' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', direction: 'ltr', region: 'South Africa' },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', direction: 'ltr', region: 'South Africa' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenda', direction: 'ltr', region: 'South Africa' },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', direction: 'ltr', region: 'South Africa' },
  { code: 'nr', name: 'Southern Ndebele', nativeName: 'isiNdebele', direction: 'ltr', region: 'South Africa' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', direction: 'ltr', region: 'South Africa' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', direction: 'ltr', region: 'South Africa' },
  { code: 'sfs', name: 'South African Sign Language', nativeName: 'SASL', direction: 'ltr', region: 'South Africa' },

  // Nigeria and West Africa
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', direction: 'ltr', region: 'West Africa' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', direction: 'ltr', region: 'West Africa' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', direction: 'ltr', region: 'West Africa' },
  { code: 'ff', name: 'Fula', nativeName: 'Fulfulde', direction: 'ltr', region: 'West Africa' },
  { code: 'pcm', name: 'Nigerian Pidgin', nativeName: 'Naijá', direction: 'ltr', region: 'Nigeria' },
  { code: 'ak', name: 'Akan', nativeName: 'Akan', direction: 'ltr', region: 'West Africa' },
  { code: 'tw', name: 'Twi', nativeName: 'Twi', direction: 'ltr', region: 'West Africa' },
  { code: 'wo', name: 'Wolof', nativeName: 'Wolof', direction: 'ltr', region: 'West Africa' },

  // East, Central and Southern Africa
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', region: 'Africa' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', direction: 'ltr', region: 'Africa' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Ikirundi', direction: 'ltr', region: 'Africa' },
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', direction: 'ltr', region: 'Africa' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', direction: 'ltr', region: 'Africa' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', direction: 'ltr', region: 'Africa' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', direction: 'ltr', region: 'Africa' },

  // New Zealand and Pacific
  { code: 'mi', name: 'Māori', nativeName: 'Te reo Māori', direction: 'ltr', region: 'New Zealand' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Sāmoa', direction: 'ltr', region: 'Pacific' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea faka-Tonga', direction: 'ltr', region: 'Pacific' },
  { code: 'fj', name: 'Fijian', nativeName: 'Vosa Vakaviti', direction: 'ltr', region: 'Pacific' },

  // East Asia
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', region: 'China' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr', region: 'Taiwan' },
  { code: 'zh-HK', name: 'Chinese (Hong Kong)', nativeName: '繁體中文（香港）', direction: 'ltr', region: 'Hong Kong' },
  { code: 'yue', name: 'Cantonese', nativeName: '粵語', direction: 'ltr', region: 'East Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', direction: 'ltr', region: 'Japan' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', direction: 'ltr', region: 'Korea' },

  // South and Southeast Asia
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', region: 'South Asia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', region: 'South Asia' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', region: 'South Asia' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', region: 'South Asia' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', region: 'South Asia' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', region: 'Southeast Asia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', region: 'Southeast Asia' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', direction: 'ltr', region: 'Southeast Asia' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', region: 'Southeast Asia' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', direction: 'ltr', region: 'Southeast Asia' },

  // Middle East
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', region: 'Middle East / North Africa' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', region: 'Middle East' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', direction: 'rtl', region: 'Middle East' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', region: 'Europe / Asia' },

  // Europe
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', region: 'Global' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', region: 'Global' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', direction: 'ltr', region: 'Global' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr', region: 'Europe' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr', region: 'Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', region: 'Europe' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', direction: 'ltr', region: 'Europe' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', region: 'Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', direction: 'ltr', region: 'Europe / Asia' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', region: 'Europe' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', region: 'Europe' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', region: 'Europe' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', direction: 'ltr', region: 'Europe' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', region: 'Europe' },

  // Americas
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl ayisyen', direction: 'ltr', region: 'Caribbean' },
  { code: 'qu', name: 'Quechua', nativeName: 'Runasimi', direction: 'ltr', region: 'South America' },
  { code: 'gn', name: 'Guaraní', nativeName: "Avañe'ẽ", direction: 'ltr', region: 'South America' },
]

export const DEFAULT_PORTELYX_LANGUAGE = 'en'

export const getPortelyxLanguage = (code: string) =>
  PORTELYX_LANGUAGES.find((language) => language.code === code)