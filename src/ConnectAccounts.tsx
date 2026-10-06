import { useMemo, useRef, useState } from 'react'
import './ConnectAccounts.css'
import './ConnectDataHub.css'
import './StatementReview.css'
import './ConnectedAccountReview.css'
import { apiUrl } from './api'

type ConnectionKind = 'bank' | 'investment' | 'other'
type ConnectMode = 'choose' | 'accounts' | 'statement' | 'account-review'

type ConnectionProvider = {
  id: string
  name: string
  kind: ConnectionKind
  description: string
  initials: string
}

type ConnectedAccount = {
  id: string
  providerId: string
  providerName: string
  kind: ConnectionKind
  label: string
  status: 'connected'
}

type StatementPreview = {
  fileName: string
  fileType: 'csv' | 'pdf'
  fileSize: string
  rowCount: number | null
  detectedColumns: string[]
  sampleRows: string[][]
}

type ParsedTransaction = {
  transaction_id: string
  date: string
  description: string
  amount: number
  direction: 'income' | 'expense'
  category: string
  confidence: 'high' | 'medium' | 'low'
}

type StatementParseResult = {
  file_name: string
  file_type: 'csv' | 'pdf'
  transactions: ParsedTransaction[]
  summary: {
    currency: string | null
    detected_balance: number | null
    total_income: number
    total_expenses: number
    transaction_count: number
  }
  warnings: string[]
}

export type ReviewedStatementImport = {
  fileName: string
  fileType: 'csv' | 'pdf'
  totalIncome: number
  totalExpenses: number
  detectedBalance: number | null
  transactionCount: number
}


type ConnectedAccountProvenance = {
  source: 'connected_account'
  provider: string
  environment: string
  provider_account_id: number | string | null
  provider_account_name: string | null
  balance_source_field: string | null
  currency: string | null
  provider_refresh_metadata: Record<string, unknown>
  ingested_at: string
}

type NormalizedConnectedAccount = {
  provider: string
  environment: string
  provider_account_id: number | string | null
  provider_account_name: string | null
  name: string | null
  category: 'cash' | 'debt' | 'investment' | 'other'
  account_type: string | null
  container: string | null
  balance: number
  currency: string | null
  provenance: ConnectedAccountProvenance
}

type NormalizedAccountsResult = {
  source: 'connected_account'
  provider: string
  environment: string
  ingested_at: string
  accounts: NormalizedConnectedAccount[]
  summary: {
    account_count: number
    currencies: string[]
    totals_by_currency: Record<
      string,
      {
        cash: number
        debt: number
        investment: number
        other: number
      }
    >
  }
}

export type ReviewedConnectedAccountImport = {
  provider: string
  environment: string
  ingestedAt: string
  accounts: NormalizedConnectedAccount[]
  currencies: string[]
  totalsByCurrency:
    NormalizedAccountsResult['summary']['totals_by_currency']
}

type Props = {
  onBack: () => void
  onContinueManual: () => void
  onContinueStatement: (statement: ReviewedStatementImport) => void
  onContinueConnected: (data: ReviewedConnectedAccountImport) => void
}

const providers: ConnectionProvider[] = [
  {
    id: 'bank',
    name: 'Bank & cash',
    kind: 'bank',
    description: 'Checking, current, savings and cash accounts',
    initials: 'B',
  },
  {
    id: 'investment',
    name: 'Investments',
    kind: 'investment',
    description: 'Brokerage, funds and investment accounts',
    initials: 'I',
  },
  {
    id: 'other',
    name: 'Other financial account',
    kind: 'other',
    description: 'Another supported account-data source',
    initials: '+',
  },
]

function humanFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseCsvLine(line: string) {
  const cells: string[] = []
  let current = ''
  let quoted = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      continue
    }

    if (char === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  cells.push(current.trim())
  return cells
}

export default function ConnectAccounts({
  onBack,
  onContinueManual,
  onContinueStatement,
  onContinueConnected,
}: Props) {
  const [mode, setMode] = useState<ConnectMode>('choose')
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] =
    useState<ConnectionProvider | null>(null)
  const [connectedAccounts, setConnectedAccounts] =
    useState<ConnectedAccount[]>([])
  const [statement, setStatement] = useState<StatementPreview | null>(null)
  const [statementError, setStatementError] = useState('')
  const [statementFile, setStatementFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<StatementParseResult | null>(null)
  const [parseLoading, setParseLoading] = useState(false)
  const [accountImport, setAccountImport] = useState<NormalizedAccountsResult | null>(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [accountError, setAccountError] = useState('')
  const fileInput = useRef<HTMLInputElement | null>(null)

  const filteredProviders = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return providers

    return providers.filter((provider) =>
      `${provider.name} ${provider.description}`
        .toLowerCase()
        .includes(query),
    )
  }, [search])

  const connectSandboxAccount = async () => {
    if (!selectedProvider) return

    setAccountLoading(true)
    setAccountError('')

    try {
       const response = await fetch(
        apiUrl('/providers/yodlee/normalized-accounts'),
       )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Portelyx could not retrieve the sandbox accounts.',
        )
      }

      const normalized = data as NormalizedAccountsResult
      setAccountImport(normalized)

      const kinds = new Set<ConnectionKind>()
      normalized.accounts.forEach((account) => {
        if (account.category === 'cash' || account.category === 'debt') {
          kinds.add('bank')
        } else if (account.category === 'investment') {
          kinds.add('investment')
        } else {
          kinds.add('other')
        }
      })

      setConnectedAccounts(
        Array.from(kinds).map((kind) => ({
          id: crypto.randomUUID(),
          providerId: `yodlee-${kind}`,
          providerName: 'Envestnet Yodlee',
          kind,
          label: 'Sandbox connection',
          status: 'connected' as const,
        })),
      )

      setSelectedProvider(null)
      setMode('account-review')
    } catch (error) {
      setAccountError(
        error instanceof Error
          ? error.message
          : 'Portelyx could not retrieve the sandbox accounts.',
      )
    } finally {
      setAccountLoading(false)
    }
  }

  const handleStatement = async (file?: File) => {
    if (!file) return

    setStatementError('')
    setParseResult(null)
    setStatementFile(file)
    const lower = file.name.toLowerCase()

    if (!lower.endsWith('.csv') && !lower.endsWith('.pdf')) {
      setStatement(null)
      setStatementFile(null)
      setStatementError('Choose a PDF or CSV statement.')
      return
    }

    if (lower.endsWith('.pdf')) {
      setStatement({
        fileName: file.name,
        fileType: 'pdf',
        fileSize: humanFileSize(file.size),
        rowCount: null,
        detectedColumns: [],
        sampleRows: [],
      })
      return
    }

    try {
      const text = await file.text()
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)

      if (!lines.length) {
        throw new Error('This CSV is empty.')
      }

      const rows = lines.map(parseCsvLine)
      const columns = rows[0] ?? []
      const dataRows = rows.slice(1)

      setStatement({
        fileName: file.name,
        fileType: 'csv',
        fileSize: humanFileSize(file.size),
        rowCount: dataRows.length,
        detectedColumns: columns,
        sampleRows: dataRows.slice(0, 4),
      })
    } catch (error) {
      setStatement(null)
      setStatementError(
        error instanceof Error ? error.message : 'Could not read this statement.',
      )
    }
  }

  const extractStatement = async () => {
    if (!statementFile) return

    setParseLoading(true)
    setStatementError('')

    try {
      const formData = new FormData()
      formData.append('file', statementFile)

      const response = await fetch(apiUrl('/statements/parse'), {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === 'string'
            ? data.detail
            : 'Portelyx could not parse this statement.',
        )
      }

      setParseResult(data as StatementParseResult)
    } catch (error) {
      setParseResult(null)
      setStatementError(
        error instanceof Error
          ? error.message
          : 'Portelyx could not parse this statement.',
      )
    } finally {
      setParseLoading(false)
    }
  }

  const updateTransaction = (
    transactionId: string,
    patch: Partial<ParsedTransaction>,
  ) => {
    setParseResult((current) => {
      if (!current) return current

      const transactions = current.transactions.map((transaction) =>
        transaction.transaction_id === transactionId
          ? { ...transaction, ...patch }
          : transaction,
      )

      return {
        ...current,
        transactions,
        summary: {
          ...current.summary,
          total_income: transactions
            .filter((transaction) => transaction.direction === 'income')
            .reduce((sum, transaction) => sum + transaction.amount, 0),
          total_expenses: transactions
            .filter((transaction) => transaction.direction === 'expense')
            .reduce((sum, transaction) => sum + transaction.amount, 0),
          transaction_count: transactions.length,
        },
      }
    })
  }

  if (mode === 'choose') {
    return (
      <main className="connect-page">
        <nav className="connect-nav">
          <div className="logo">PORTELYX</div>
          <button className="nav-button" type="button" onClick={onBack}>
            ← Back
          </button>
        </nav>

        <section className="connect-hub-shell">
          <header className="connect-hub-heading">
            <p className="connect-eyebrow">BUILD YOUR FINANCIAL TWIN</p>
            <h1>Bring your financial world into one twin.</h1>
            <p>
              Connect supported accounts, upload a statement, or enter your
              finances manually. Portelyx normalizes each route into the same
              Financial Twin.
            </p>
          </header>

          <section className="connect-method-grid">
            <button type="button" onClick={() => setMode('accounts')}>
              <span className="connect-method-icon">⌁</span>
              <div>
                <small>ACCOUNT DATA</small>
                <h2>Connect accounts</h2>
                <p>
                  Connect supported banks, brokerages and financial accounts
                  through a provider-ready authorization flow.
                </p>
              </div>
              <b>Connect →</b>
            </button>

            <button type="button" onClick={() => setMode('statement')}>
              <span className="connect-method-icon">↑</span>
              <div>
                <small>DOCUMENT IMPORT</small>
                <h2>Upload statement</h2>
                <p>
                  Import PDF or CSV statements and review extracted information
                  before anything enters your Financial Twin.
                </p>
              </div>
              <b>Upload →</b>
            </button>

            <button type="button" onClick={onContinueManual}>
              <span className="connect-method-icon">＋</span>
              <div>
                <small>MANUAL CONTROL</small>
                <h2>Enter manually</h2>
                <p>
                  Build the twin yourself when you prefer not to connect or
                  upload financial data.
                </p>
              </div>
              <b>Start →</b>
            </button>
          </section>

          <div className="connect-global-note">
            <span>GLOBAL BY DESIGN</span>
            <p>
              Portelyx is not tied to one country, bank or provider. Financial
              sources are normalized into a currency-aware Financial Twin.
            </p>
          </div>
        </section>
      </main>
    )
  }

  if (mode === 'account-review' && accountImport) {
    const formatAmount = (amount: number, currency: string | null) => {
      if (!currency) return amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
      try {
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency,
          maximumFractionDigits: 2,
        }).format(amount)
      } catch {
        return `${currency} ${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      }
    }

    return (
      <main className="connect-page">
        <nav className="connect-nav">
          <div className="logo">PORTELYX</div>
          <button className="nav-button" type="button" onClick={() => setMode('accounts')}>
            ← Back
          </button>
        </nav>

        <section className="connect-hub-shell">
          <header className="connect-hub-heading compact">
            <p className="connect-eyebrow">CONNECTED ACCOUNT REVIEW</p>
            <h1>Review what Portelyx received.</h1>
            <p>
              These sandbox accounts were retrieved through the connected account
              provider and normalized before entering your Financial Twin.
            </p>
          </header>

          <section className="account-import-review">
            <div className="account-import-summary">
              <span className="statement-status live">CONNECTED</span>
              <h2>{accountImport.summary.account_count} accounts detected</h2>
              <p>
                Provider: {accountImport.provider} · Currencies:{' '}
                {accountImport.summary.currencies.join(', ') || 'Not detected'}
              </p>
            </div>

            <div className="account-import-list">
              {accountImport.accounts.map((account) => (
                <article className="account-import-row" key={String(account.provider_account_id)}>
                  <div>
                    <strong>{account.name || 'Financial account'}</strong>
                    <span>{account.account_type || 'Unknown type'} · {account.category}</span>
                  </div>
                  <strong>{formatAmount(account.balance, account.currency)}</strong>
                </article>
              ))}
            </div>

            <div className="account-import-totals">
              {Object.entries(accountImport.summary.totals_by_currency).map(([currency, totals]) => (
                <article key={currency}>
                  <strong>{currency}</strong>
                  <span>Cash {formatAmount(totals.cash, currency)}</span>
                  <span>Debt {formatAmount(totals.debt, currency)}</span>
                  <span>Investments {formatAmount(totals.investment, currency)}</span>
                </article>
              ))}
            </div>

            <div className="statement-next">
              <div>
                <strong>Review before building.</strong>
                <span>
                  Connected data stays separated by currency. Portelyx will not
                  silently add different currencies together.
                </span>
              </div>
              
                <button
  type="button"
  onClick={() =>
    onContinueConnected({
  provider: accountImport.provider,
  environment: accountImport.environment,
  ingestedAt: accountImport.ingested_at,
  accounts: accountImport.accounts,
  currencies: accountImport.summary.currencies,
  totalsByCurrency: accountImport.summary.totals_by_currency,
})
  }
>
  Continue with connected data <span>→</span>
</button>
            </div>
          </section>
        </section>
      </main>
    )
  }

  if (mode === 'statement') {
    return (
      <main className="connect-page">
        <nav className="connect-nav">
          <div className="logo">PORTELYX</div>
          <button
            className="nav-button"
            type="button"
            onClick={() => {
              setMode('choose')
              setStatement(null)
              setStatementFile(null)
              setParseResult(null)
              setStatementError('')
            }}
          >
            ← Back
          </button>
        </nav>

        <section className="connect-hub-shell">
          <header className="connect-hub-heading compact">
            <p className="connect-eyebrow">STATEMENT IMPORT</p>
            <h1>Upload. Review. Then build.</h1>
            <p>
              Portelyx never silently treats extracted statement data as truth.
              You review the import before it becomes part of the Financial Twin.
            </p>
          </header>

          <section className="statement-layout">
            <div className="statement-upload-panel">
              <input
                ref={fileInput}
                className="statement-file-input"
                type="file"
                accept=".pdf,.csv,application/pdf,text/csv"
                onChange={(event) => handleStatement(event.target.files?.[0])}
              />

              {!statement ? (
                <button
                  type="button"
                  className="statement-dropzone"
                  onClick={() => fileInput.current?.click()}
                >
                  <span>↑</span>
                  <strong>Choose a bank or financial statement</strong>
                  <small>PDF or CSV · your file stays under your control</small>
                </button>
              ) : (
                <div className="statement-file-card">
                  <span className="statement-file-mark">
                    {statement.fileType.toUpperCase()}
                  </span>
                  <div>
                    <strong>{statement.fileName}</strong>
                    <small>{statement.fileSize}</small>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setStatement(null)
                      setStatementFile(null)
                      setParseResult(null)
                      setStatementError('')
                      if (fileInput.current) fileInput.current.value = ''
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {statementError && (
                <p className="statement-error">{statementError}</p>
              )}

              <div className="statement-privacy">
                <span>✓</span>
                <p>
                  <strong>Review before import</strong>
                  <small>
                    Extracted balances and transactions must be confirmed before
                    Portelyx updates a Financial Twin.
                  </small>
                </p>
              </div>
            </div>

            <aside className="statement-review">
              <p className="connect-eyebrow">IMPORT REVIEW</p>

              {!statement && (
                <div className="statement-empty">
                  <strong>No statement selected.</strong>
                  <span>Your extracted information will appear here for review.</span>
                </div>
              )}

              {statement && !parseResult && (
                <div className="statement-pdf-ready">
                  <span className="statement-status">FILE READY</span>
                  <h2>
                    {statement.fileType.toUpperCase()} selected successfully.
                  </h2>
                  <p>
                    Send this file to Portelyx's local statement parser. Nothing
                    enters the Financial Twin until you review the detected rows.
                  </p>
                  <button
                    type="button"
                    onClick={extractStatement}
                    disabled={parseLoading}
                  >
                    {parseLoading ? 'Extracting...' : 'Extract statement'}
                    <span>{parseLoading ? '···' : '→'}</span>
                  </button>
                  <small>
                    CSV and text-based PDF statements are supported. Scanned
                    image-only PDFs are deliberately rejected until an OCR adapter
                    is added.
                  </small>
                </div>
              )}

              {parseResult && (
                <div className="statement-mapping-review">
                  <div className="statement-review-top">
                    <div>
                      <span className="statement-status live">
                        READY FOR REVIEW
                      </span>
                      <h2>
                        {parseResult.summary.transaction_count} transactions detected
                      </h2>
                    </div>
                    <span>{parseResult.file_type.toUpperCase()}</span>
                  </div>

                  <div className="statement-summary-grid">
                    <div>
                      <span>Detected income</span>
                      <strong>
                        {parseResult.summary.total_income.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                    <div>
                      <span>Detected expenses</span>
                      <strong>
                        {parseResult.summary.total_expenses.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                    </div>
                    <div>
                      <span>Detected balance</span>
                      <strong>
                        {parseResult.summary.detected_balance === null
                          ? 'Not detected'
                          : parseResult.summary.detected_balance.toLocaleString(
                              undefined,
                              { maximumFractionDigits: 2 },
                            )}
                      </strong>
                    </div>
                  </div>

                  {parseResult.warnings.length > 0 && (
                    <div className="statement-parser-warnings">
                      <strong>Review notes</strong>
                      {parseResult.warnings.map((warning) => (
                        <span key={warning}>• {warning}</span>
                      ))}
                    </div>
                  )}

                  <div className="statement-transaction-list">
                    {parseResult.transactions.map((transaction) => (
                      <article
                        className="statement-transaction-row"
                        key={transaction.transaction_id}
                      >
                        <div className="statement-transaction-copy">
                          <strong>{transaction.description}</strong>
                          <span>
                            {transaction.date} · {transaction.confidence} confidence
                          </span>
                        </div>

                        <div className="statement-transaction-controls">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={transaction.amount}
                            aria-label={`Amount for ${transaction.description}`}
                            onChange={(event) =>
                              updateTransaction(transaction.transaction_id, {
                                amount: Math.max(0, Number(event.target.value)),
                              })
                            }
                          />

                          <select
                            value={transaction.direction}
                            aria-label={`Direction for ${transaction.description}`}
                            onChange={(event) =>
                              updateTransaction(transaction.transaction_id, {
                                direction: event.target.value as
                                  | 'income'
                                  | 'expense',
                              })
                            }
                          >
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                          </select>

                          <input
                            type="text"
                            value={transaction.category}
                            aria-label={`Category for ${transaction.description}`}
                            onChange={(event) =>
                              updateTransaction(transaction.transaction_id, {
                                category: event.target.value,
                              })
                            }
                          />
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="statement-next">
                    <div>
                      <strong>Review is mandatory.</strong>
                      <span>
                        Correct any amount, direction or category that Portelyx
                        interpreted incorrectly before building the Financial Twin.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onContinueStatement({
                          fileName: parseResult.file_name,
                          fileType: parseResult.file_type,
                          totalIncome: parseResult.summary.total_income,
                          totalExpenses: parseResult.summary.total_expenses,
                          detectedBalance: parseResult.summary.detected_balance,
                          transactionCount: parseResult.summary.transaction_count,
                        })
                      }
                    >
                      Continue with reviewed data
                      <span>→</span>
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </section>
        </section>
      </main>
    )
  }

  return (
    <main className="connect-page">
      <nav className="connect-nav">
        <div className="logo">PORTELYX</div>
        <button className="nav-button" type="button" onClick={() => setMode('choose')}>
          ← Back
        </button>
      </nav>

      <section className="connect-shell">
        <header className="connect-heading">
          <div>
            <p className="connect-eyebrow">ACCOUNT CONNECTION</p>
            <h1>Connect supported financial accounts.</h1>
            <p>
              Choose the type of financial source you want to bring into
              Portelyx. The interface stays provider-neutral and global.
            </p>
          </div>

          <div className="connect-security">
            <span className="connect-security-dot" />
            Provider-ready architecture
          </div>
        </header>

        <div className="connect-layout">
          <section className="connect-panel">
            <div className="connect-panel-heading">
              <div>
                <span>ACCOUNT SOURCES</span>
                <h2>What would you like to connect?</h2>
              </div>
              <span className="connect-count">
                {connectedAccounts.length} connected
              </span>
            </div>

            <label className="connect-search">
              <span>⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search account types"
                aria-label="Search account types"
              />
            </label>

            <div className="provider-list">
              {filteredProviders.map((provider) => {
                const connected = connectedAccounts.some(
                  (account) => account.providerId === provider.id,
                )

                return (
                  <button
                    className="provider-row"
                    type="button"
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                  >
                    <span className="provider-icon">{provider.initials}</span>
                    <span className="provider-copy">
                      <strong>{provider.name}</strong>
                      <small>{provider.description}</small>
                    </span>
                    <span
                      className={
                        connected
                          ? 'provider-status connected'
                          : 'provider-status'
                      }
                    >
                      {connected ? 'Connected' : 'Connect'}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="connect-provider-note">
              <span>i</span>
              <p>
                Portelyx never asks for a banking password directly. Production
                connections will be delegated to authorized account-data
                providers. This hackathon build currently demonstrates the
                authorization boundary with a sandbox connection.
              </p>
            </div>
          </section>

          <aside className="twin-builder">
            <p className="connect-eyebrow">FINANCIAL TWIN</p>
            <h2>Your picture builds as you connect.</h2>

            <div className="twin-builder-list">
              <TwinItem
                label="Bank & cash"
                connected={connectedAccounts.some(
                  (account) => account.kind === 'bank',
                )}
              />
              <TwinItem
                label="Investments"
                connected={connectedAccounts.some(
                  (account) => account.kind === 'investment',
                )}
              />
              <TwinItem label="Income" connected={false} />
              <TwinItem label="Expenses" connected={false} />
              <TwinItem label="Debts" connected={false} />
              <TwinItem label="Goals" connected={false} />
            </div>

            <div className="twin-builder-footer">
              <p>
                Connect what is available, upload statements for unsupported
                institutions, or add the rest manually.
              </p>
              <button
                className="connect-primary"
                type="button"
                onClick={onContinueManual}
              >
                Continue building
                <span>→</span>
              </button>
            </div>
          </aside>
        </div>
      </section>

      {selectedProvider && (
        <div
          className="connect-modal-backdrop"
          role="presentation"
          onMouseDown={() => setSelectedProvider(null)}
        >
          <section
            className="connect-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="connect-modal-top">
              <span className="provider-icon large">
                {selectedProvider.initials}
              </span>
              <button
                type="button"
                className="connect-modal-close"
                onClick={() => setSelectedProvider(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="connect-eyebrow">SANDBOX CONNECTION</p>
            <h2 id="connect-modal-title">
              Connect {selectedProvider.name}
            </h2>
            <p>
              This demonstrates the authorization boundary without collecting
              real financial credentials. A production aggregation provider can
              replace the adapter without changing the Financial Twin model.
            </p>

            <div className="connect-permissions">
              <div>
                <span>✓</span>
                <p>
                  <strong>Read financial data</strong>
                  <small>
                    Balances and account information needed for your Financial
                    Twin.
                  </small>
                </p>
              </div>
              <div>
                <span>✓</span>
                <p>
                  <strong>No trading permission</strong>
                  <small>
                    Portelyx simulates decisions. It does not move money or
                    execute trades.
                  </small>
                </p>
              </div>
            </div>

            {accountError && <p className="statement-error">{accountError}</p>}

            <button
              className="connect-primary full"
              type="button"
              onClick={connectSandboxAccount}
              disabled={accountLoading}
            >
              {accountLoading ? 'Connecting to sandbox...' : 'Authorize sandbox connection'}
              <span>{accountLoading ? '···' : '→'}</span>
            </button>
          </section>
        </div>
      )}
    </main>
  )
}

function TwinItem({
  label,
  connected,
}: {
  label: string
  connected: boolean
}) {
  return (
    <div
      className={
        connected
          ? 'twin-builder-item complete'
          : 'twin-builder-item'
      }
    >
      <span className="twin-builder-state">
        {connected ? '✓' : ''}
      </span>
      <strong>{label}</strong>
      <small>{connected ? 'Connected' : 'Add later'}</small>
    </div>
  )
}
