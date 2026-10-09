import { useEffect, useMemo, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import './ProfilePage.css'

import { PORTELYX_LANGUAGES } from './languages'
import { usePortelyxLanguage } from './i18n'

type ProfilePageProps = {
  onBack: () => void
  onOpenSettings: () => void
}

type CountryOption = {
  code: string
  name: string
  currency: string
}

const COUNTRIES: CountryOption[] = [
  { code: 'ZA', name: 'South Africa', currency: 'ZAR' },
  { code: 'NG', name: 'Nigeria', currency: 'NGN' },
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'NZ', name: 'New Zealand', currency: 'NZD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'KR', name: 'South Korea', currency: 'KRW' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF' },
  { code: 'IE', name: 'Ireland', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'PT', name: 'Portugal', currency: 'EUR' },
  { code: 'BE', name: 'Belgium', currency: 'EUR' },
  { code: 'AT', name: 'Austria', currency: 'EUR' },
  { code: 'FI', name: 'Finland', currency: 'EUR' },
]

const CURRENCIES = [
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'EUR', name: 'Euro' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'KRW', name: 'South Korean Won' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'NZD', name: 'New Zealand Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'INR', name: 'Indian Rupee' },
]

function ProfilePage({
  onBack,
  onOpenSettings,
}: ProfilePageProps) {
  const auth = useAuth()
  const { setLanguage, t } = usePortelyxLanguage()

  const email = auth.user?.profile.email ?? ''
  const cognitoUsername = auth.user?.profile.sub ?? ''

  const [displayName, setDisplayName] = useState('')
  const [country, setCountry] = useState('')
  const [preferredCurrency, setPreferredCurrency] = useState('')
  const [preferredLanguage, setPreferredLanguage] = useState('')
  const [languageSearch, setLanguageSearch] = useState('')
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!cognitoUsername) return

    const storedProfile = localStorage.getItem(
      `portelyx-profile-${cognitoUsername}`,
    )

    if (!storedProfile) return

    try {
      const profile = JSON.parse(storedProfile)

      setDisplayName(profile.displayName ?? '')
      setCountry(profile.country ?? '')
      setPreferredCurrency(profile.preferredCurrency ?? '')
      setPreferredLanguage(profile.preferredLanguage ?? '')
    } catch {
      console.error('Could not load saved PORTELYX profile.')
    }
  }, [cognitoUsername])

  const filteredLanguages = useMemo(() => {
    const search = languageSearch.toLowerCase().trim()

    if (!search) return PORTELYX_LANGUAGES

    return PORTELYX_LANGUAGES.filter((language) => {
      return (
        language.name.toLowerCase().includes(search) ||
        language.nativeName.toLowerCase().includes(search) ||
        language.region.toLowerCase().includes(search) ||
        language.code.toLowerCase().includes(search)
      )
    })
  }, [languageSearch])

  const selectedLanguage = PORTELYX_LANGUAGES.find(
    (language) => language.code === preferredLanguage,
  )

  const selectedCountry = COUNTRIES.find(
    (item) => item.code === country,
  )

  const selectedCurrency = CURRENCIES.find(
    (item) => item.code === preferredCurrency,
  )

  const handleCountryChange = (countryCode: string) => {
    setCountry(countryCode)

    const countryOption = COUNTRIES.find(
      (item) => item.code === countryCode,
    )

    if (countryOption) {
      setPreferredCurrency(countryOption.currency)
    }
  }

  const saveProfile = () => {
    if (!cognitoUsername) return

    localStorage.setItem(
      `portelyx-profile-${cognitoUsername}`,
      JSON.stringify({
        displayName: displayName.trim(),
        country,
        preferredCurrency,
        preferredLanguage,
      }),
    )

    setLanguage(preferredLanguage)

    setEditing(false)
    setLanguageSearch('')
    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  const cancelEditing = () => {
    if (cognitoUsername) {
      const storedProfile = localStorage.getItem(
        `portelyx-profile-${cognitoUsername}`,
      )

      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile)

          setDisplayName(profile.displayName ?? '')
          setCountry(profile.country ?? '')
          setPreferredCurrency(profile.preferredCurrency ?? '')
          setPreferredLanguage(profile.preferredLanguage ?? '')
        } catch {
          console.error('Could not restore PORTELYX profile.')
        }
      } else {
        setDisplayName('')
        setCountry('')
        setPreferredCurrency('')
        setPreferredLanguage('')
      }
    }

    setLanguageSearch('')
    setEditing(false)
  }

  const hasCompletedProfile =
    Boolean(country) &&
    Boolean(preferredCurrency) &&
    Boolean(preferredLanguage)

  return (
    <main className="profile-page">
      <nav className="profile-nav">
        <button
          className="profile-back"
          type="button"
          onClick={onBack}
        >
          ← {t('common.back')}
        </button>

        <img
          className="profile-logo"
          src="/portelyx-logo.png"
          alt="PORTELYX"
        />

        <button
          className="profile-settings-button"
          type="button"
          onClick={onOpenSettings}
        >
          {t('common.settings')}
        </button>
      </nav>

      <section className="profile-container">
        <header className="profile-header">
          <div>
            <p className="profile-eyebrow">
              {t('profile.eyebrow')}
            </p>

            <h1>{t('profile.title')}</h1>

            <p>{t('profile.description')}</p>
          </div>

          {!editing && (
            <button
              className="profile-edit-button"
              type="button"
              onClick={() => setEditing(true)}
            >
              {t('profile.edit')}
            </button>
          )}
        </header>

        {saved && (
          <div
            className="profile-success"
            role="status"
          >
            ✓ {t('profile.saved')}
          </div>
        )}

        {!hasCompletedProfile && !editing && (
          <div className="profile-completion-notice">
            <div>
              <strong>
                {t('profile.finishTitle')}
              </strong>

              <p>
                {t('profile.finishDescription')}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setEditing(true)}
            >
              {t('profile.complete')} →
            </button>
          </div>
        )}

        <div className="profile-card">
          <div className="profile-section-heading">
            <span>01</span>

            <div>
              <h2>{t('profile.identity')}</h2>

              <p>
                {t('profile.identityDescription')}
              </p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="profile-name">
                {t('profile.displayName')}
              </label>

              <input
                id="profile-name"
                type="text"
                value={displayName}
                disabled={!editing}
                placeholder={
                  editing
                    ? t('profile.displayNamePlaceholder')
                    : t('common.notSelected')
                }
                onChange={(event) =>
                  setDisplayName(event.target.value)
                }
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email">
                {t('profile.email')}
              </label>

              <input
                id="profile-email"
                type="email"
                value={email}
                disabled
              />

              <small>
                {t('profile.emailManaged')}
              </small>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-section-heading">
            <span>02</span>

            <div>
              <h2>
                {t('profile.regionCurrency')}
              </h2>

              <p>
                {t(
                  'profile.regionCurrencyDescription',
                )}
              </p>
            </div>
          </div>

          <div className="profile-grid">
            <div className="profile-field">
              <label htmlFor="profile-country">
                {t('profile.countryRegion')}
              </label>

              {editing ? (
                <select
                  id="profile-country"
                  value={country}
                  onChange={(event) =>
                    handleCountryChange(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    {t('profile.selectCountry')}
                  </option>

                  {COUNTRIES.map(
                    (countryOption) => (
                      <option
                        key={countryOption.code}
                        value={countryOption.code}
                      >
                        {countryOption.name}
                      </option>
                    ),
                  )}
                </select>
              ) : (
                <div className="profile-value">
                  {selectedCountry?.name ??
                    t('common.notSelected')}
                </div>
              )}

              <small>
                {t('profile.countryHelp')}
              </small>
            </div>

            <div className="profile-field">
              <label htmlFor="profile-currency">
                {t('profile.preferredCurrency')}
              </label>

              {editing ? (
                <select
                  id="profile-currency"
                  value={preferredCurrency}
                  onChange={(event) =>
                    setPreferredCurrency(
                      event.target.value,
                    )
                  }
                >
                  <option value="">
                    {t('profile.selectCurrency')}
                  </option>

                  {CURRENCIES.map((currency) => (
                    <option
                      key={currency.code}
                      value={currency.code}
                    >
                      {currency.code} —{' '}
                      {currency.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="profile-value">
                  {selectedCurrency
                    ? `${selectedCurrency.code} — ${selectedCurrency.name}`
                    : t('common.notSelected')}
                </div>
              )}

              <small>
                {t('profile.currencyHelp')}
              </small>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-section-heading">
            <span>03</span>

            <div>
              <h2>
                {t('profile.languageSection')}
              </h2>

              <p>
                {t(
                  'profile.languageDescription',
                )}
              </p>
            </div>
          </div>

          <div className="profile-field profile-language-field">
            <label htmlFor="profile-language">
              {t('profile.portelyxLanguage')}
            </label>

            {!editing && (
              <div className="profile-language-current">
                {selectedLanguage ? (
                  <>
                    <strong>
                      {selectedLanguage.nativeName}
                    </strong>

                    {selectedLanguage.nativeName !==
                      selectedLanguage.name && (
                      <span>
                        {selectedLanguage.name}
                      </span>
                    )}
                  </>
                ) : (
                  <strong className="profile-not-selected">
                    {t('common.notSelected')}
                  </strong>
                )}
              </div>
            )}

            {editing && (
              <>
                <input
                  id="profile-language-search"
                  type="search"
                  value={languageSearch}
                  placeholder={t(
                    'profile.searchLanguage',
                  )}
                  onChange={(event) =>
                    setLanguageSearch(
                      event.target.value,
                    )
                  }
                />

                <select
                  id="profile-language"
                  value={preferredLanguage}
                  onChange={(event) =>
                    setPreferredLanguage(
                      event.target.value,
                    )
                  }
                  size={Math.min(
                    Math.max(
                      filteredLanguages.length,
                      2,
                    ),
                    8,
                  )}
                >
                  <option
                    value=""
                    disabled
                  >
                    {t('profile.selectLanguage')}
                  </option>

                  {filteredLanguages.map(
                    (language) => (
                      <option
                        key={language.code}
                        value={language.code}
                      >
                        {language.nativeName}
                        {language.nativeName !==
                        language.name
                          ? ` — ${language.name}`
                          : ''}
                        {' · '}
                        {language.region}
                      </option>
                    ),
                  )}
                </select>

                {filteredLanguages.length === 0 && (
                  <p className="profile-language-empty">
                    {t('profile.noLanguage')}
                  </p>
                )}
              </>
            )}

            <small>
              {t('profile.languageHelp')}
            </small>
          </div>

          {editing && (
            <div className="profile-actions">
              <button
                className="profile-cancel-button"
                type="button"
                onClick={cancelEditing}
              >
                {t('common.cancel')}
              </button>

              <button
                className="primary-button"
                type="button"
                onClick={saveProfile}
                disabled={
                  !country ||
                  !preferredCurrency ||
                  !preferredLanguage
                }
              >
                {t('profile.saveChanges')}
              </button>
            </div>
          )}
        </div>

        <section className="profile-account-card">
          <div className="profile-account-details">
            <span className="profile-status-dot" />

            <div>
              <strong>
                {t('profile.account')}
              </strong>

              <p>
                {t('profile.signedInAs')} {email}
              </p>
            </div>
          </div>

          <span className="profile-status">
            {t('common.active')}
          </span>
        </section>

        <p className="profile-language-note">
          {t('profile.languageNote')}
        </p>
      </section>
    </main>
  )
}

export default ProfilePage