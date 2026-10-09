import { useState } from 'react'
import GoalBuilder, { type GoalInput } from './GoalBuilder'
import { usePortelyxLanguage } from './i18n'
import './ManualSetupFlow.css'

type Currency = { code: string; name: string }

type HoldingInput = {
  id: string
  name: string
  symbol: string
  assetType: string
  quantity: string
  currentPrice: string
  currency: string
}

type SetupStep = 'essentials' | 'investments' | 'goals' | 'review'

type Props = {
  currencies: Currency[]
  currencySearch: string
  selectedCurrency: Currency | null
  monthlyIncome: string
  monthlyExpenses: string
  availableCash: string
  totalAssets: string
  totalDebts: string
  holdings: HoldingInput[]
  goals: GoalInput[]
  profileLoading: boolean
  onBack: () => void
  setCurrencySearch: (value: string) => void
  setSelectedCurrency: (value: Currency | null) => void
  setMonthlyIncome: (value: string) => void
  setMonthlyExpenses: (value: string) => void
  setAvailableCash: (value: string) => void
  setTotalAssets: (value: string) => void
  setTotalDebts: (value: string) => void
  setHoldings: React.Dispatch<React.SetStateAction<HoldingInput[]>>
  setGoals: React.Dispatch<React.SetStateAction<GoalInput[]>>
  addHolding: () => void
  removeHolding: (id: string) => void
  buildFinancialTwin: () => void
}

const stepIds: SetupStep[] = [
  'essentials',
  'investments',
  'goals',
  'review',
]

export default function ManualSetupFlow(props: Props) {
  const { t } = usePortelyxLanguage()
  const [step, setStep] = useState<SetupStep>('essentials')
  const [showMore, setShowMore] = useState(false)

  const steps = [
    { id: 'essentials' as const, label: t('manualSetup.basics') },
    { id: 'investments' as const, label: t('manualSetup.investments') },
    { id: 'goals' as const, label: t('manualSetup.goals') },
    { id: 'review' as const, label: t('manualSetup.review') },
  ]

  const index = stepIds.indexOf(step)

  const filteredCurrencies = props.currencies
    .filter((currency) => {
      const search = props.currencySearch.toLowerCase().trim()
      if (!search) return false
      return (
        currency.code.toLowerCase().includes(search) ||
        currency.name.toLowerCase().includes(search)
      )
    })
    .slice(0, 8)

  const next = () => {
    if (index < steps.length - 1) setStep(steps[index + 1].id)
  }

  const previous = () => {
    if (index > 0) setStep(steps[index - 1].id)
  }

  const formatEnteredMoney = (value: string) => {
    const number = Number(value || 0)
    if (!props.selectedCurrency) return number.toLocaleString()
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: props.selectedCurrency.code,
        maximumFractionDigits: 0,
      }).format(number)
    } catch {
      return `${props.selectedCurrency.code} ${number.toLocaleString()}`
    }
  }

  const monthlySurplus =
    Number(props.monthlyIncome || 0) - Number(props.monthlyExpenses || 0)

  return (
    <main className="twin-setup-page">
      <nav className="twin-setup-nav">
        <div className="logo">PORTELYX</div>
        <button className="twin-exit" type="button" onClick={props.onBack}>
          {t('manualSetup.exitSetup')}
        </button>
      </nav>

      <section className="twin-setup-shell">
        <header className="twin-setup-top">
          <div>
            <p className="twin-kicker">{t('manualSetup.buildYourTwin')}</p>
            <h1>{t('manualSetup.mainTitle')}</h1>
          </div>

          <span className="twin-step-count">
            {String(index + 1).padStart(2, '0')} / 04
          </span>
        </header>

        <div className="twin-stepper" aria-label={t('manualSetup.setupProgress')}>
          {steps.map((item, itemIndex) => (
            <div
              key={item.id}
              className={`twin-step ${
                itemIndex === index ? 'active' : ''
              } ${itemIndex < index ? 'complete' : ''}`}
            >
              <span className="twin-step-line" />
              <div>
                <small>{String(itemIndex + 1).padStart(2, '0')}</small>
                <strong>{item.label}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="twin-stage">
          {step === 'essentials' && (
            <section className="twin-focus">
              <div className="twin-focus-heading">
                <p>{t('manualSetup.foundationEyebrow')}</p>
                <h2>{t('manualSetup.foundationTitle')}</h2>
                <span>{t('manualSetup.foundationDescription')}</span>
              </div>

              <div className="twin-form-card">
                <label className="twin-field twin-currency-field">
                  <span>{t('manualSetup.baseCurrency')}</span>
                  <div className="currency-search">
                    <input
                      type="text"
                      value={
                        props.selectedCurrency
                          ? `${props.selectedCurrency.code} — ${props.selectedCurrency.name}`
                          : props.currencySearch
                      }
                      placeholder={t('manualSetup.searchCurrency')}
                      autoComplete="off"
                      onChange={(event) => {
                        props.setSelectedCurrency(null)
                        props.setCurrencySearch(event.target.value)
                      }}
                    />
                    {!props.selectedCurrency &&
                      props.currencySearch.trim() &&
                      filteredCurrencies.length > 0 && (
                        <div className="currency-results">
                          {filteredCurrencies.map((currency) => (
                            <button
                              key={currency.code}
                              type="button"
                              className="currency-result"
                              onClick={() => {
                                props.setSelectedCurrency(currency)
                                props.setCurrencySearch('')
                              }}
                            >
                              <strong>{currency.code}</strong>
                              <span>{currency.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                  </div>
                </label>

                <div className="twin-core-grid">
                  <label className="twin-field">
                    <span>{t('manualSetup.monthlyIncome')}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={props.monthlyIncome}
                      placeholder="0"
                      onChange={(e) => props.setMonthlyIncome(e.target.value)}
                    />
                  </label>

                  <label className="twin-field">
                    <span>{t('manualSetup.monthlySpending')}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={props.monthlyExpenses}
                      placeholder="0"
                      onChange={(e) => props.setMonthlyExpenses(e.target.value)}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  className="twin-disclosure"
                  onClick={() => setShowMore((current) => !current)}
                >
                  <span>{t('manualSetup.moreAboutFinances')}</span>
                  <strong>{showMore ? '−' : '+'}</strong>
                </button>

                {showMore && (
                  <div className="twin-more-grid">
                    <label className="twin-field">
                      <span>{t('manualSetup.availableCash')}</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={props.availableCash}
                        placeholder="0"
                        onChange={(e) => props.setAvailableCash(e.target.value)}
                      />
                    </label>

                    <label className="twin-field">
                      <span>{t('manualSetup.totalAssets')}</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={props.totalAssets}
                        placeholder="0"
                        onChange={(e) => props.setTotalAssets(e.target.value)}
                      />
                    </label>

                    <label className="twin-field">
                      <span>{t('manualSetup.totalDebts')}</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={props.totalDebts}
                        placeholder="0"
                        onChange={(e) => props.setTotalDebts(e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </section>
          )}

          {step === 'investments' && (
            <section className="twin-focus">
              <div className="twin-focus-heading">
                <p>{t('manualSetup.investmentsEyebrow')}</p>
                <h2>{t('manualSetup.investmentsTitle')}</h2>
                <span>{t('manualSetup.investmentsDescription')}</span>
              </div>

              {props.holdings.length === 0 ? (
                <button
                  className="twin-empty-action"
                  type="button"
                  onClick={props.addHolding}
                >
                  <span className="twin-empty-icon">＋</span>
                  <span>
                    <strong>{t('manualSetup.addInvestment')}</strong>
                    <small>{t('manualSetup.investmentTypes')}</small>
                  </span>
                  <b>→</b>
                </button>
              ) : (
                <div className="twin-holdings">
                  {props.holdings.map((holding, holdingIndex) => (
                    <article className="twin-holding-card" key={holding.id}>
                      <header>
                        <div>
                          <small>
                            {t('manualSetup.investmentNumber', {
                              number: holdingIndex + 1,
                            })}
                          </small>
                          <strong>
                            {holding.name || t('manualSetup.newInvestment')}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => props.removeHolding(holding.id)}
                        >
                          {t('manualSetup.remove')}
                        </button>
                      </header>

                      <div className="twin-holding-grid">
                        {[
                          [
                            t('manualSetup.assetName'),
                            'name',
                            t('manualSetup.assetNamePlaceholder'),
                          ],
                          [
                            t('manualSetup.symbol'),
                            'symbol',
                            t('manualSetup.optional'),
                          ],
                          [
                            t('manualSetup.assetType'),
                            'assetType',
                            t('manualSetup.assetTypePlaceholder'),
                          ],
                          [t('manualSetup.quantity'), 'quantity', '0'],
                          [t('manualSetup.currentPrice'), 'currentPrice', '0'],
                          [
                            t('manualSetup.currency'),
                            'currency',
                            props.selectedCurrency?.code || 'USD',
                          ],
                        ].map(([label, field, placeholder]) => (
                          <label className="twin-field" key={field}>
                            <span>{label}</span>
                            <input
                              type={
                                field === 'quantity' || field === 'currentPrice'
                                  ? 'number'
                                  : 'text'
                              }
                              min={
                                field === 'quantity' || field === 'currentPrice'
                                  ? '0'
                                  : undefined
                              }
                              step={
                                field === 'quantity' || field === 'currentPrice'
                                  ? 'any'
                                  : undefined
                              }
                              maxLength={field === 'currency' ? 3 : undefined}
                              value={holding[field as keyof HoldingInput]}
                              placeholder={placeholder}
                              onChange={(event) =>
                                props.setHoldings((current) =>
                                  current.map((item) =>
                                    item.id === holding.id
                                      ? {
                                          ...item,
                                          [field]:
                                            field === 'currency'
                                              ? event.target.value.toUpperCase()
                                              : event.target.value,
                                        }
                                      : item,
                                  ),
                                )
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </article>
                  ))}

                  <button
                    type="button"
                    className="twin-add-another"
                    onClick={props.addHolding}
                  >
                    + {t('manualSetup.addAnotherInvestment')}
                  </button>
                </div>
              )}
            </section>
          )}

          {step === 'goals' && (
            <section className="twin-focus twin-goals-stage">
              <div className="twin-focus-heading">
                <p>{t('manualSetup.goalsEyebrow')}</p>
                <h2>{t('manualSetup.goalsTitle')}</h2>
                <span>{t('manualSetup.goalsDescription')}</span>
              </div>

              <GoalBuilder
                goals={props.goals}
                defaultCurrency={props.selectedCurrency?.code ?? ''}
                onChange={props.setGoals}
              />
            </section>
          )}

          {step === 'review' && (
            <section className="twin-reveal">
              <div className="twin-reveal-heading">
                <span className="twin-live-dot" />
                <p>{t('manualSetup.reviewEyebrow')}</p>
                <h2>{t('manualSetup.reviewTitle')}</h2>
                <span>{t('manualSetup.reviewDescription')}</span>
              </div>

              <div className="twin-reveal-grid">
                <article className="twin-reveal-hero">
                  <span>{t('manualSetup.monthlySurplus')}</span>
                  <strong>{formatEnteredMoney(String(monthlySurplus))}</strong>
                  <small>{t('manualSetup.incomeMinusSpending')}</small>
                </article>

                <article>
                  <span>{t('manualSetup.baseCurrency')}</span>
                  <strong>{props.selectedCurrency?.code || '—'}</strong>
                </article>

                <article>
                  <span>{t('manualSetup.availableCash')}</span>
                  <strong>{formatEnteredMoney(props.availableCash)}</strong>
                </article>

                <article>
                  <span>{t('manualSetup.investments')}</span>
                  <strong>{props.holdings.length}</strong>
                </article>

                <article>
                  <span>{t('manualSetup.goals')}</span>
                  <strong>{props.goals.length}</strong>
                </article>
              </div>

              <div className="twin-review-list">
                <div>
                  <span>{t('manualSetup.financialFoundation')}</span>
                  <strong>
                    {props.selectedCurrency
                      ? t('manualSetup.ready')
                      : t('manualSetup.needsCurrency')}
                  </strong>
                </div>
                <div>
                  <span>{t('manualSetup.investments')}</span>
                  <strong>
                    {props.holdings.length
                      ? t('manualSetup.added', {
                          count: props.holdings.length,
                        })
                      : t('manualSetup.skipped')}
                  </strong>
                </div>
                <div>
                  <span>{t('manualSetup.goals')}</span>
                  <strong>
                    {props.goals.length
                      ? t('manualSetup.added', {
                          count: props.goals.length,
                        })
                      : t('manualSetup.skipped')}
                  </strong>
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="twin-setup-actions">
          <button
            type="button"
            className="twin-back-button"
            onClick={index === 0 ? props.onBack : previous}
          >
            ← {index === 0 ? t('manualSetup.setupOptions') : t('common.back')}
          </button>

          {step !== 'review' ? (
            <button
              type="button"
              className="twin-continue-button"
              onClick={next}
              disabled={step === 'essentials' && !props.selectedCurrency}
            >
              {step === 'investments' && props.holdings.length === 0
                ? t('manualSetup.skipForNow')
                : step === 'goals' && props.goals.length === 0
                  ? t('manualSetup.skipForNow')
                  : t('common.continue')}
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              className="twin-continue-button twin-build-button"
              disabled={props.profileLoading || !props.selectedCurrency}
              onClick={props.buildFinancialTwin}
            >
              {props.profileLoading
                ? t('manualSetup.buildingFinancialTwin')
                : t('manualSetup.buildMyFinancialTwin')}
              <span>{props.profileLoading ? '···' : '→'}</span>
            </button>
          )}
        </footer>
      </section>
    </main>
  )
}
