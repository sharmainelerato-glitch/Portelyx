import { useEffect, useState } from 'react'
import { useAuth } from 'react-oidc-context'
import { usePortelyxLanguage } from './i18n'
import './SettingsPage.css'

type SettingsPageProps = {
  onBack: () => void
  onOpenProfile: () => void
  onSignOut: () => void
}

type PortelyxSettings = {
  theme: 'dark' | 'system'
  aiExplanations: boolean
  conciseMode: boolean
  decisionWarnings: boolean
  rememberDecisions: boolean
  analyticsConsent: boolean
}

const DEFAULT_SETTINGS: PortelyxSettings = {
  theme: 'dark',
  aiExplanations: true,
  conciseMode: false,
  decisionWarnings: true,
  rememberDecisions: true,
  analyticsConsent: false,
}

function SettingsPage({
  onBack,
  onOpenProfile,
  onSignOut,
}: SettingsPageProps) {
  const auth = useAuth()
  const { t } = usePortelyxLanguage()
  const userId = auth.user?.profile.sub ?? ''
  const email = auth.user?.profile.email ?? ''

  const [settings, setSettings] =
    useState<PortelyxSettings>(DEFAULT_SETTINGS)

  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) return

    const stored = localStorage.getItem(
      `portelyx-settings-${userId}`,
    )

    if (!stored) return

    try {
      setSettings({
        ...DEFAULT_SETTINGS,
        ...JSON.parse(stored),
      })
    } catch {
      console.error('Could not load PORTELYX settings.')
    }
  }, [userId])

  const updateSetting = <K extends keyof PortelyxSettings>(
    key: K,
    value: PortelyxSettings[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const saveSettings = () => {
    if (!userId) return

    localStorage.setItem(
      `portelyx-settings-${userId}`,
      JSON.stringify(settings),
    )

    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  return (
    <main className="settings-page">
      <nav className="settings-nav">
        <button
          className="settings-nav-button"
          type="button"
          onClick={onBack}
        >
          ← {t('settings.back')}
        </button>

        <img
          className="settings-logo"
          src="/portelyx-logo.png"
          alt="PORTELYX"
        />

        <button
          className="settings-nav-button"
          type="button"
          onClick={onOpenProfile}
        >
          Profile
        </button>
      </nav>

      <section className="settings-container">
        <header className="settings-header">
          <p className="settings-eyebrow">
            {t('settings.eyebrow')}
          </p>

          <h1>{t('settings.title')}</h1>

          <p>
            {t('settings.description')}
          </p>
        </header>

        {saved && (
          <div className="settings-success" role="status">
            {t('settings.saved')}
          </div>
        )}

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>01</span>
              <h2>{t('settings.experience')}</h2>
            </div>

            <p>
              {t('settings.experienceDescription')}
            </p>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div>
                <strong>{t('settings.appearance')}</strong>
                <p>
                  {t('settings.appearanceDescription')}
                </p>
              </div>

              <select
                value={settings.theme}
                onChange={(event) =>
                  updateSetting(
                    'theme',
                    event.target.value as 'dark' | 'system',
                  )
                }
              >
                <option value="dark">{t('settings.dark')}</option>
                <option value="system">{t('settings.useDeviceSetting')}</option>
              </select>
            </div>

            <ToggleRow
              title={t('settings.aiExplanations')}
              description={t('settings.aiExplanationsDescription')}
              checked={settings.aiExplanations}
              onChange={(value) =>
                updateSetting('aiExplanations', value)
              }
            />

            <ToggleRow
              title={t('settings.conciseExplanations')}
              description={t('settings.conciseExplanationsDescription')}
              checked={settings.conciseMode}
              onChange={(value) =>
                updateSetting('conciseMode', value)
              }
            />

            <ToggleRow
              title={t('settings.decisionWarnings')}
              description={t('settings.decisionWarningsDescription')}
              checked={settings.decisionWarnings}
              onChange={(value) =>
                updateSetting('decisionWarnings', value)
              }
            />
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>02</span>
              <h2>{t('settings.privacyData')}</h2>
            </div>

            <p>
              {t('settings.privacyDataDescription')}
            </p>
          </div>

          <div className="settings-card">
            <ToggleRow
              title={t('settings.rememberDecisions')}
              description={t('settings.rememberDecisionsDescription')}
              checked={settings.rememberDecisions}
              onChange={(value) =>
                updateSetting('rememberDecisions', value)
              }
            />

            <ToggleRow
              title={t('settings.optionalAnalytics')}
              description={t('settings.optionalAnalyticsDescription')}
              checked={settings.analyticsConsent}
              onChange={(value) =>
                updateSetting('analyticsConsent', value)
              }
            />

            <div className="settings-info-row">
              <div>
                <strong>{t('settings.financialData')}</strong>
                <p>
                  {t('settings.financialDataDescription')}
                </p>
              </div>

              <span className="settings-badge">
                {t('settings.private')}
              </span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>03</span>
              <h2>{t('settings.connections')}</h2>
            </div>

            <p>
              {t('settings.connectionsDescription')}
            </p>
          </div>

          <div className="settings-card">
            <div className="settings-info-row">
              <div>
                <strong>{t('settings.financialAccounts')}</strong>
                <p>
                  {t('settings.financialAccountsDescription')}
                </p>
              </div>

              <span className="settings-badge">
                {t('settings.manageInSetup')}
              </span>
            </div>

            <div className="settings-info-row">
              <div>
                <strong>Alexa+</strong>
                <p>
                  {t('settings.alexaDescription')}
                </p>
              </div>

              <span className="settings-badge settings-badge-muted">
                {t('settings.pendingAccess')}
              </span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>04</span>
              <h2>{t('settings.security')}</h2>
            </div>

            <p>
              {t('settings.securityDescription')}
            </p>
          </div>

          <div className="settings-card">
            <div className="settings-info-row">
              <div>
                <strong>{t('settings.signedInAccount')}</strong>
                <p>{email}</p>
              </div>

              <span className="settings-badge settings-badge-active">
                {t('settings.active')}
              </span>
            </div>

            <button
              className="settings-action-button"
              type="button"
              onClick={onSignOut}
            >
              {t('settings.signOut')}
            </button>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>05</span>
              <h2>{t('settings.legalSupport')}</h2>
            </div>

            <p>
              {t('settings.legalSupportDescription')}
            </p>
          </div>

          <div className="settings-card settings-links">
            <a href="/privacy.html">
              <span>
                <strong>{t('settings.privacyPolicy')}</strong>
                <small>
                  {t('settings.privacyPolicyDescription')}
                </small>
              </span>

              <b>→</b>
            </a>

            <a href="/terms.html">
              <span>
                <strong>{t('settings.termsOfUse')}</strong>
                <small>
                  {t('settings.termsOfUseDescription')}
                </small>
              </span>

              <b>→</b>
            </a>

            <a href="/financial-disclaimer.html">
              <span>
                <strong>{t('settings.financialDisclaimer')}</strong>
                <small>
                  {t('settings.financialDisclaimerDescription')}
                </small>
              </span>

              <b>→</b>
            </a>

            <a href="/contact.html">
              <span>
                <strong>{t('settings.contactSupport')}</strong>
                <small>
                  {t('settings.contactSupportDescription')}
                </small>
              </span>

              <b>→</b>
            </a>
          </div>
        </section>

        <section className="settings-section">
          <div className="settings-section-heading">
            <div>
              <span>06</span>
              <h2>{t('settings.accountManagement')}</h2>
            </div>

            <p>
              {t('settings.accountManagementDescription')}
            </p>
          </div>

          <div className="settings-card danger-zone">
            <div>
              <strong>{t('settings.deleteAccountTitle')}</strong>

              <p>
                {t('settings.deleteAccountDescription')}
              </p>
            </div>

            <button
              className="danger-button"
              type="button"
              disabled
            >
              {t('settings.deleteAccount')}
            </button>
          </div>
        </section>

        <div className="settings-save-area">
          <button
            className="primary-button settings-save"
            type="button"
            onClick={saveSettings}
          >
            {t('settings.saveSettings')}
          </button>
        </div>
      </section>
    </main>
  )
}

type ToggleRowProps = {
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: ToggleRowProps) {
  return (
    <div className="settings-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <label className="settings-toggle">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) =>
            onChange(event.target.checked)
          }
        />

        <span className="settings-toggle-track">
          <span />
        </span>
      </label>
    </div>
  )
}

export default SettingsPage