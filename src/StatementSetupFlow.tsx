import { useMemo, useState } from 'react'
import './StatementSetupFlow.css'

type Currency = {
  code: string
  name: string
}

export type PendingStatementImport = {
  fileName: string
  fileType: 'csv' | 'pdf'
  totalIncome: number
  totalExpenses: number
  detectedBalance: number | null
  transactionCount: number
}

type Props = {
  statement: PendingStatementImport
  currencies: Currency[]
  onBack: () => void
  onConfirm: (data: {
    currency: Currency
    statementMonths: number
    monthlyIncome: number
    monthlyExpenses: number
    availableCash: number | null
  }) => void
}

export default function StatementSetupFlow({
  statement,
  currencies,
  onBack,
  onConfirm,
}: Props) {
  const [currencySearch, setCurrencySearch] = useState('')
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [statementMonths, setStatementMonths] = useState('1')

  const filteredCurrencies = useMemo(() => {
    const query = currencySearch.trim().toLowerCase()
    if (!query) return []

    return currencies
      .filter(
        (currency) =>
          currency.code.toLowerCase().includes(query) ||
          currency.name.toLowerCase().includes(query),
      )
      .slice(0, 8)
  }, [currencies, currencySearch])

  const months = Number(statementMonths)
  const validMonths = Number.isFinite(months) && months > 0
  const monthlyIncome = validMonths ? statement.totalIncome / months : 0
  const monthlyExpenses = validMonths ? statement.totalExpenses / months : 0

  const formatNumber = (value: number) =>
    new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
    }).format(value)

  return (
    <main className="statement-setup-page">
      <nav className="statement-setup-nav">
        <div className="logo">PORTELYX</div>
        <button className="nav-button" type="button" onClick={onBack}>
          ← Back
        </button>
      </nav>

      <section className="statement-setup-shell">
        <header className="statement-setup-heading">
          <p>STATEMENT SETUP</p>
          <h1>Confirm what this statement represents.</h1>
          <span>
            Portelyx will not treat statement totals as monthly values until you
            confirm the period and base currency.
          </span>
        </header>

        <div className="statement-setup-grid">
          <section className="statement-setup-card">
            <div className="statement-source">
              <span>{statement.fileType.toUpperCase()}</span>
              <div>
                <strong>{statement.fileName}</strong>
                <small>{statement.transactionCount} reviewed transactions</small>
              </div>
            </div>

            <label>
              <span>Base currency</span>
              <div className="statement-currency-search">
                <input
                  type="text"
                  value={
                    selectedCurrency
                      ? `${selectedCurrency.code} — ${selectedCurrency.name}`
                      : currencySearch
                  }
                  placeholder="Search currency, e.g. USD or Dollar"
                  onChange={(event) => {
                    setSelectedCurrency(null)
                    setCurrencySearch(event.target.value)
                  }}
                />

                {!selectedCurrency && filteredCurrencies.length > 0 && (
                  <div className="statement-currency-results">
                    {filteredCurrencies.map((currency) => (
                      <button
                        key={currency.code}
                        type="button"
                        onClick={() => {
                          setSelectedCurrency(currency)
                          setCurrencySearch('')
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

            <label>
              <span>Statement period</span>
              <div className="statement-period-control">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={statementMonths}
                  onChange={(event) => setStatementMonths(event.target.value)}
                />
                <small>months represented by this file</small>
              </div>
            </label>

            <div className="statement-period-note">
              Use 1 for one month, 3 for a quarterly statement, 6 for six months,
              and so on. Portelyx divides reviewed totals by this period only after
              you confirm it.
            </div>
          </section>

          <aside className="statement-normalized-preview">
            <p>NORMALIZED PREVIEW</p>
            <h2>What will enter setup.</h2>

            <div className="statement-normalized-values">
              <div>
                <span>Monthly income</span>
                <strong>
                  {validMonths ? formatNumber(monthlyIncome) : '—'}
                </strong>
              </div>

              <div>
                <span>Monthly expenses</span>
                <strong>
                  {validMonths ? formatNumber(monthlyExpenses) : '—'}
                </strong>
              </div>

              <div>
                <span>Available cash</span>
                <strong>
                  {statement.detectedBalance === null
                    ? 'Not detected'
                    : formatNumber(statement.detectedBalance)}
                </strong>
              </div>
            </div>

            <div className="statement-normalized-note">
              <strong>Nothing is final yet.</strong>
              <span>
                After confirmation, these values prefill Financial Twin setup.
                You can still add or correct assets, debts, investments and goals
                before building the Twin.
              </span>
            </div>

            <button
              className="statement-confirm-button"
              type="button"
              disabled={!selectedCurrency || !validMonths}
              onClick={() => {
                if (!selectedCurrency || !validMonths) return

                onConfirm({
                  currency: selectedCurrency,
                  statementMonths: months,
                  monthlyIncome,
                  monthlyExpenses,
                  availableCash: statement.detectedBalance,
                })
              }}
            >
              Continue to Financial Twin setup
              <span>→</span>
            </button>
          </aside>
        </div>
      </section>
    </main>
  )
}
