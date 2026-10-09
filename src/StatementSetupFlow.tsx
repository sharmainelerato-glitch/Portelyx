import { useMemo, useState } from 'react'
import { usePortelyxLanguage } from './i18n'
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
  const { t } = usePortelyxLanguage()
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
          ← {t('statementSetup.back')}
        </button>
      </nav>

      <section className="statement-setup-shell">
        <header className="statement-setup-heading">
          <p>{t('statementSetup.eyebrow')}</p>
          <h1>{t('statementSetup.title')}</h1>
          <span>{t('statementSetup.description')}</span>
        </header>

        <div className="statement-setup-grid">
          <section className="statement-setup-card">
            <div className="statement-source">
              <span>{statement.fileType.toUpperCase()}</span>
              <div>
                <strong>{statement.fileName}</strong>
                <small>{t('statementSetup.reviewedTransactions', { count: statement.transactionCount })}</small>
              </div>
            </div>

            <label>
              <span>{t('statementSetup.baseCurrency')}</span>
              <div className="statement-currency-search">
                <input
                  type="text"
                  value={
                    selectedCurrency
                      ? `${selectedCurrency.code} — ${selectedCurrency.name}`
                      : currencySearch
                  }
                  placeholder={t('statementSetup.currencyPlaceholder')}
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
              <span>{t('statementSetup.statementPeriod')}</span>
              <div className="statement-period-control">
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={statementMonths}
                  onChange={(event) => setStatementMonths(event.target.value)}
                />
                <small>{t('statementSetup.monthsRepresented')}</small>
              </div>
            </label>

            <div className="statement-period-note">
              {t('statementSetup.periodNote')}
            </div>
          </section>

          <aside className="statement-normalized-preview">
            <p>{t('statementSetup.previewEyebrow')}</p>
            <h2>{t('statementSetup.previewTitle')}</h2>

            <div className="statement-normalized-values">
              <div>
                <span>{t('statementSetup.monthlyIncome')}</span>
                <strong>
                  {validMonths ? formatNumber(monthlyIncome) : '—'}
                </strong>
              </div>

              <div>
                <span>{t('statementSetup.monthlyExpenses')}</span>
                <strong>
                  {validMonths ? formatNumber(monthlyExpenses) : '—'}
                </strong>
              </div>

              <div>
                <span>{t('statementSetup.availableCash')}</span>
                <strong>
                  {statement.detectedBalance === null
                    ? t('statementSetup.notDetected')
                    : formatNumber(statement.detectedBalance)}
                </strong>
              </div>
            </div>

            <div className="statement-normalized-note">
              <strong>{t('statementSetup.nothingFinal')}</strong>
              <span>{t('statementSetup.prefillNote')}</span>
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
              {t('statementSetup.continueToTwin')}
              <span>→</span>
            </button>
          </aside>
        </div>
      </section>
    </main>
  )
}
