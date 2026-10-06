import { useState } from 'react'
import GoalBuilder, { type GoalInput } from './GoalBuilder'
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

const steps: { id: SetupStep; label: string }[] = [
  { id: 'essentials', label: 'Basics' },
  { id: 'investments', label: 'Investments' },
  { id: 'goals', label: 'Goals' },
  { id: 'review', label: 'Review' },
]

export default function ManualSetupFlow(props: Props) {
  const [step, setStep] = useState<SetupStep>('essentials')
  const [showMore, setShowMore] = useState(false)
  const index = steps.findIndex((item) => item.id === step)

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
          Exit setup
        </button>
      </nav>

      <section className="twin-setup-shell">
        <header className="twin-setup-top">
          <div>
            <p className="twin-kicker">BUILD YOUR FINANCIAL TWIN</p>
            <h1>One clear picture of your money.</h1>
          </div>

          <span className="twin-step-count">
            {String(index + 1).padStart(2, '0')} / 04
          </span>
        </header>

        <div className="twin-stepper" aria-label="Setup progress">
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
                <p>YOUR FOUNDATION</p>
                <h2>Start with your money.</h2>
                <span>
                  Just enough to establish the foundation. You can refine
                  your Financial Twin later.
                </span>
              </div>

              <div className="twin-form-card">
                <label className="twin-field twin-currency-field">
                  <span>Base currency</span>
                  <div className="currency-search">
                    <input
                      type="text"
                      value={
                        props.selectedCurrency
                          ? `${props.selectedCurrency.code} — ${props.selectedCurrency.name}`
                          : props.currencySearch
                      }
                      placeholder="Search currency"
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
                    <span>Monthly income</span>
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
                    <span>Monthly spending</span>
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
                  <span>More about your finances</span>
                  <strong>{showMore ? '−' : '+'}</strong>
                </button>

                {showMore && (
                  <div className="twin-more-grid">
                    <label className="twin-field">
                      <span>Available cash</span>
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
                      <span>Total assets</span>
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
                      <span>Total debts</span>
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
                <p>INVESTMENTS</p>
                <h2>Where is your money invested?</h2>
                <span>
                  Add only what you want Portelyx to model. This step is
                  optional.
                </span>
              </div>

              {props.holdings.length === 0 ? (
                <button
                  className="twin-empty-action"
                  type="button"
                  onClick={props.addHolding}
                >
                  <span className="twin-empty-icon">＋</span>
                  <span>
                    <strong>Add an investment</strong>
                    <small>Stocks, ETFs, funds, crypto and more</small>
                  </span>
                  <b>→</b>
                </button>
              ) : (
                <div className="twin-holdings">
                  {props.holdings.map((holding, holdingIndex) => (
                    <article className="twin-holding-card" key={holding.id}>
                      <header>
                        <div>
                          <small>INVESTMENT {holdingIndex + 1}</small>
                          <strong>{holding.name || 'New investment'}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => props.removeHolding(holding.id)}
                        >
                          Remove
                        </button>
                      </header>

                      <div className="twin-holding-grid">
                        {[
                          ['Asset name', 'name', 'e.g. Company or fund'],
                          ['Symbol', 'symbol', 'Optional'],
                          ['Asset type', 'assetType', 'e.g. Stock or ETF'],
                          ['Quantity', 'quantity', '0'],
                          ['Current price', 'currentPrice', '0'],
                          ['Currency', 'currency', props.selectedCurrency?.code || 'USD'],
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
                    + Add another investment
                  </button>
                </div>
              )}
            </section>
          )}

          {step === 'goals' && (
            <section className="twin-focus twin-goals-stage">
              <div className="twin-focus-heading">
                <p>GOALS</p>
                <h2>What are you building toward?</h2>
                <span>
                  Give Portelyx something meaningful to protect, test and
                  plan around.
                </span>
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
                <p>YOUR FINANCIAL TWIN</p>
                <h2>Ready to come to life.</h2>
                <span>
                  Review the foundation Portelyx will use for simulations.
                </span>
              </div>

              <div className="twin-reveal-grid">
                <article className="twin-reveal-hero">
                  <span>MONTHLY SURPLUS</span>
                  <strong>{formatEnteredMoney(monthlySurplus)}</strong>
                  <small>Income minus monthly spending</small>
                </article>

                <article>
                  <span>Base currency</span>
                  <strong>{props.selectedCurrency?.code || '—'}</strong>
                </article>

                <article>
                  <span>Available cash</span>
                  <strong>{formatEnteredMoney(props.availableCash)}</strong>
                </article>

                <article>
                  <span>Investments</span>
                  <strong>{props.holdings.length}</strong>
                </article>

                <article>
                  <span>Goals</span>
                  <strong>{props.goals.length}</strong>
                </article>
              </div>

              <div className="twin-review-list">
                <div>
                  <span>Financial foundation</span>
                  <strong>
                    {props.selectedCurrency ? 'Ready' : 'Needs currency'}
                  </strong>
                </div>
                <div>
                  <span>Investments</span>
                  <strong>
                    {props.holdings.length
                      ? `${props.holdings.length} added`
                      : 'Skipped'}
                  </strong>
                </div>
                <div>
                  <span>Goals</span>
                  <strong>
                    {props.goals.length
                      ? `${props.goals.length} added`
                      : 'Skipped'}
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
            ← {index === 0 ? 'Setup options' : 'Back'}
          </button>

          {step !== 'review' ? (
            <button
              type="button"
              className="twin-continue-button"
              onClick={next}
              disabled={step === 'essentials' && !props.selectedCurrency}
            >
              {step === 'investments' && props.holdings.length === 0
                ? 'Skip for now'
                : step === 'goals' && props.goals.length === 0
                  ? 'Skip for now'
                  : 'Continue'}
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
                ? 'Building Financial Twin...'
                : 'Build my Financial Twin'}
              <span>{props.profileLoading ? '···' : '→'}</span>
            </button>
          )}
        </footer>
      </section>
    </main>
  )
}
