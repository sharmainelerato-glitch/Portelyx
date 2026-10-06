import { useEffect, useState } from 'react'

import './App.css'
import { apiUrl } from './api'

import ConnectAccounts, {
  type ReviewedConnectedAccountImport,

  type ReviewedStatementImport,

} from './ConnectAccounts'

import {
  type GoalInput,
} from './GoalBuilder'

import ManualSetupFlow from './ManualSetupFlow'

import WorkspaceShell from './WorkspaceShell'

import StatementSetupFlow, {

  type PendingStatementImport,

} from './StatementSetupFlow'

type View =

  | 'landing'

  | 'setup'

  | 'connect-accounts'

  | 'statement-setup'

  | 'manual-setup'

  | 'workspace'



type JobLossScenario = {

  months_without_income: number

  lost_income: number

  expenses_during_period: number

  starting_cash: number

  cash_after_period: number

  months_cash_can_cover: number

  funding_gap: number

}

type FinancialProfile = {

  profile_id: string

  profile_type: string

  base_currency: string

  cash: {

    available: number

  }

  income: {

    monthly: number

  }

  expenses: {

    monthly: number

  }

  assets: {

    total: number

  }

  debts: {

    total: number

  }

  holdings: {

  holding_id: string

  name: string

  symbol: string | null

  asset_type: string

  quantity: number

  current_price: number

  currency: string

}[]

 goals: {

  goal_id: string

  name: string

  category: string

  target_amount: number

  target_date: string

  currency: string

  current_saved: number

  monthly_contribution: number

  priority: string | null

  notes: string | null

}[]

data_sources?: {
  source: string
  provider: string | null
  environment: string | null
  ingested_at: string | null
  accounts: ReviewedConnectedAccountImport['accounts']
}[]

}

type Currency = {

  code: string

  name: string

}

type HoldingInput = {

  id: string

  name: string

  symbol: string

  assetType: string

  quantity: string

  currentPrice: string

  currency: string

}

function App() {

  const [view, setView] = useState<View>('landing')

  const [runwayMonths, setRunwayMonths] = useState<number | null>(null)

  const [financialProfile, setFinancialProfile] =

  useState<FinancialProfile | null>(null)
 const [isDemoProfile, setIsDemoProfile] = useState(false)

  const [currencies, setCurrencies] = useState<Currency[]>([])

  const [currencySearch, setCurrencySearch] = useState('')

  const [selectedCurrency, setSelectedCurrency] =

    useState<Currency | null>(null)

  const [monthlyIncome, setMonthlyIncome] = useState('')

  const [monthlyExpenses, setMonthlyExpenses] = useState('')

  const [availableCash, setAvailableCash] = useState('')

  const [totalAssets, setTotalAssets] = useState('')

  const [totalDebts, setTotalDebts] = useState('')

  const [holdings, setHoldings] = useState<HoldingInput[]>([])

  const [goals, setGoals] = useState<GoalInput[]>([])

  const [profileLoading, setProfileLoading] = useState(false)

  const [profileSource, setProfileSource] =
  useState<'manual' | 'statement' | 'connected_account'>('manual')

const [pendingStatement, setPendingStatement] =

  useState<PendingStatementImport | null>(null)

const [connectedSource, setConnectedSource] =
  useState<ReviewedConnectedAccountImport | null>(null)

  

  const [question, setQuestion] = useState('')

  const [scenarioLoading, setScenarioLoading] = useState(false)

  

  const [jobLossScenario, setJobLossScenario] =

  useState<JobLossScenario | null>(null)

  const [jobLossMonths, setJobLossMonths] = useState('')

  useEffect(() => {

  const loadCurrencies = async () => {

    try {

      const response = await fetch(

        apiUrl('/currencies')

      )

      if (!response.ok) {

        throw new Error('Failed to load currencies')

      }

      const data: Currency[] = await response.json()

      setCurrencies(data)

    } catch (error) {

      console.error(

        'Failed to load Portelyx currencies:',

        error

      )

    }

  }

  loadCurrencies()

}, [])

  const goHome = () => {

    setView('landing')

  }

  const openSetup = () => {

    setView('setup')


    setQuestion('')

  }

  const openDemoWorkspace = async () => {

    try {

      const [profileResponse, runwayResponse] =

        await Promise.all([

          fetch(apiUrl('/demo/profile')),
          fetch(apiUrl('/demo/emergency-runway')),

        ])

      if (!profileResponse.ok || !runwayResponse.ok) {

        throw new Error('Failed to load demo financial twin')

      }

      const profileData: FinancialProfile =

        await profileResponse.json()

      const runwayData = await runwayResponse.json()

      setFinancialProfile(profileData)
      setIsDemoProfile(true)

      setRunwayMonths(runwayData.runway_months)


      setQuestion('')

      setView('workspace')

    } catch (error) {

      console.error(

        'Failed to open demo financial twin:',

        error

      )

    }

  }

 

const runJobLossScenario = async () => {

  if (!financialProfile) {

    return

  }

  const months = Number(jobLossMonths)

  if (!Number.isInteger(months) || months < 1) {

    return

  }

  setScenarioLoading(true)

  try {

    const response = await fetch(

      apiUrl('/scenarios/execute'),

      {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          tool_name: 'job_loss',

          parameters: {

            available_cash:

              financialProfile.cash.available,

            monthly_income:

              financialProfile.income.monthly,

            monthly_expenses:

              financialProfile.expenses.monthly,

            months_without_income: months,

          },

        }),

      }

    )

    if (!response.ok) {

      throw new Error('Job loss scenario request failed')

    }

    const data: JobLossScenario = await response.json()

    setJobLossScenario(data)


  } catch (error) {

    console.error(

      'Failed to run job loss scenario:',

      error

    )

  } finally {

    setScenarioLoading(false)

  }

}



const addHolding = () => {

  setHoldings((currentHoldings) => [

    ...currentHoldings,

    {

      id: crypto.randomUUID(),

      name: '',

      symbol: '',

      assetType: '',

      quantity: '',

      currentPrice: '',

      currency: selectedCurrency?.code ?? '',

    },

  ])

}

const removeHolding = (holdingId: string) => {

  setHoldings((currentHoldings) =>

    currentHoldings.filter(

      (holding) => holding.id !== holdingId

    )

  )

}



const continueFromReviewedStatement = (
  statement: ReviewedStatementImport,
) => {
  setConnectedSource(null)
  setPendingStatement(statement)
  setView('statement-setup')
}

const confirmStatementSetup = (data: {

  currency: Currency

  statementMonths: number

  monthlyIncome: number

  monthlyExpenses: number

  availableCash: number | null

}) => {

  setSelectedCurrency(data.currency)

  setCurrencySearch('')

  setMonthlyIncome(

    String(Number(data.monthlyIncome.toFixed(2))),

  )

  setMonthlyExpenses(

    String(Number(data.monthlyExpenses.toFixed(2))),

  )

  setAvailableCash(

    data.availableCash === null

      ? ''

      : String(Number(data.availableCash.toFixed(2))),

  )

  setProfileSource('statement')

  setView('manual-setup')

}

const continueFromConnectedAccounts = (
  data: ReviewedConnectedAccountImport,
) => {
  if (data.currencies.length !== 1) {
    console.error(
      'Connected accounts use multiple currencies. Choose a base currency and apply explicit FX conversion before building the Financial Twin.',
    )
    return
  }

  const baseCurrencyCode = data.currencies[0]
  const currency =
    currencies.find((item) => item.code === baseCurrencyCode) ?? {
      code: baseCurrencyCode,
      name: baseCurrencyCode,
    }

  const totals = data.totalsByCurrency[baseCurrencyCode]

  if (!totals) {
    console.error('Connected account totals are missing for the detected currency.')
    return
  }
  setConnectedSource(data)

  setSelectedCurrency(currency)
  setCurrencySearch('')
  setAvailableCash(String(Number(totals.cash.toFixed(2))))
  setTotalDebts(String(Number(totals.debt.toFixed(2))))

  // Connected investment-account balances are not converted into holdings here.
  // Holdings require instrument-level data such as quantity and price.
  setTotalAssets(String(Number((totals.cash + totals.investment).toFixed(2))))

  // Account balances do not prove recurring income or expenses.
  // Leave those fields for the user to confirm manually.
  setMonthlyIncome('')
  setMonthlyExpenses('')

  setProfileSource('connected_account')
  setPendingStatement(null)
  setView('manual-setup')
}

const buildFinancialTwin = async () => {

  if (!selectedCurrency) {

    return

  }

  const invalidHolding = holdings.some(

  (holding) =>

    !holding.name.trim() ||

    !holding.assetType.trim() ||

    !holding.currency.trim() ||

    Number(holding.quantity) <= 0 ||

    Number(holding.currentPrice) < 0

)

if (invalidHolding) {

  console.error(

    'Please complete all required holding fields before building your financial twin.'

  )

  return

}

  setProfileLoading(true)

  try {

    const profilePayload: FinancialProfile = {

      profile_id: `${profileSource}-${Date.now()}`,

      profile_type: profileSource,

      base_currency: selectedCurrency.code,

      cash: {

        available: Number(availableCash),

      },

      income: {

        monthly: Number(monthlyIncome),

      },

      expenses: {

        monthly: Number(monthlyExpenses),

      },

      assets: {

        total: Number(totalAssets),

      },

      debts: {

        total: Number(totalDebts),

      },

      holdings: holdings.map((holding) => ({

  holding_id: holding.id,

  name: holding.name.trim(),

  symbol: holding.symbol.trim() || null,

  asset_type: holding.assetType.trim(),

  quantity: Number(holding.quantity),

  current_price: Number(holding.currentPrice),

  currency: holding.currency.toUpperCase(),

})),

   goals: goals.map((goal) => ({

  goal_id: goal.id,

  name: goal.name.trim(),

  category: goal.category.trim() || 'custom',

  target_amount: Number(goal.targetAmount),

  target_date: goal.targetDate,

  currency:

    goal.currency.trim().toUpperCase() ||

    selectedCurrency.code,

  current_saved: Number(goal.currentSaved || 0),

  monthly_contribution: Number(

    goal.monthlyContribution || 0

  ),

  priority: goal.priority.trim() || null,

  notes: goal.notes.trim() || null,

})),

data_sources:
  profileSource === 'connected_account' && connectedSource
    ? [
        {
          source: 'connected_account',
          provider: connectedSource.provider,
          environment: connectedSource.environment,
          ingested_at: connectedSource.ingestedAt,
          accounts: connectedSource.accounts,
        },
      ]
    : [],

    }

    const profileResponse = await fetch(

      apiUrl('/financial-profile'),

      {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify(profilePayload),

      }

    )

    if (!profileResponse.ok) {

      throw new Error('Failed to create financial profile')

    }

    const profileData: FinancialProfile =

      await profileResponse.json()

    const runwayResponse = await fetch(

      apiUrl('/calculations/emergency-runway'),

      {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          available_cash: profileData.cash.available,

          monthly_expenses: profileData.expenses.monthly,

        }),

      }

    )

    if (!runwayResponse.ok) {

      throw new Error('Failed to calculate runway')

    }

    const runwayData = await runwayResponse.json()

    setFinancialProfile(profileData)
    setIsDemoProfile(false)

    setRunwayMonths(runwayData.runway_months)


    setQuestion('')

    setView('workspace')

  } catch (error) {

    console.error(

      'Failed to build financial twin:',

      error

    )

  } finally {

    setProfileLoading(false)

  }

}

  if (view === 'workspace' && financialProfile) {

  return (

    <WorkspaceShell

      profile={financialProfile}

      runwayMonths={runwayMonths}

      question={question}

      scenarioLoading={scenarioLoading}

      onQuestionChange={setQuestion}

      jobLossMonths={jobLossMonths}

      jobLossScenario={jobLossScenario}

      onJobLossMonthsChange={setJobLossMonths}

      onRunJobLossScenario={runJobLossScenario}
      isDemoProfile={isDemoProfile}
      onUseMyData={openSetup}

      onExit={openSetup}

    />

  )

}


  if (view === 'connect-accounts') {

  return (

    <ConnectAccounts

      onBack={openSetup}

      onContinueManual={() => {

        setProfileSource('manual')

        setPendingStatement(null)
        setConnectedSource(null)

        setView('manual-setup')

      }}
         
      onContinueStatement={continueFromReviewedStatement}
      onContinueConnected={continueFromConnectedAccounts}

    />

  )

}

if (view === 'statement-setup' && pendingStatement) {

  return (

    <StatementSetupFlow

      statement={pendingStatement}

      currencies={currencies}

      onBack={() => setView('connect-accounts')}

      onConfirm={confirmStatementSetup}

    />

  )

}

if (view === 'manual-setup') {

  return (

    <ManualSetupFlow

      currencies={currencies}

      currencySearch={currencySearch}

      selectedCurrency={selectedCurrency}

      monthlyIncome={monthlyIncome}

      monthlyExpenses={monthlyExpenses}

      availableCash={availableCash}

      totalAssets={totalAssets}

      totalDebts={totalDebts}

      holdings={holdings}

      goals={goals}

      profileLoading={profileLoading}

      onBack={openSetup}

      setCurrencySearch={setCurrencySearch}

      setSelectedCurrency={setSelectedCurrency}

      setMonthlyIncome={setMonthlyIncome}

      setMonthlyExpenses={setMonthlyExpenses}

      setAvailableCash={setAvailableCash}

      setTotalAssets={setTotalAssets}

      setTotalDebts={setTotalDebts}

      setHoldings={setHoldings}

      setGoals={setGoals}

      addHolding={addHolding}

      removeHolding={removeHolding}

      buildFinancialTwin={buildFinancialTwin}

    />

  )

}







  if (view === 'setup') {

    return (

      <main className="onboarding-page">

        <nav className="navbar">

          <div className="logo">PORTELYX</div>

          <button

            className="nav-button"

            type="button"

            onClick={goHome}

          >

            ← Back

          </button>

        </nav>

        <section className="setup-container">

          <div className="setup-heading">

            <p className="onboarding-label">

              SET UP PORTELYX

            </p>

            <h1>Build your financial picture.</h1>

            <p>

              Choose how you'd like to get started. You can

              always add more later.

            </p>

          </div>

          <div className="setup-options">

            <button

              className="setup-card"

              type="button"

              onClick={() => setView('connect-accounts')}

            >

              <div className="setup-icon">

                <span>⌁</span>

              </div>

               <div className="setup-card-copy">

  <div className="setup-title-row">

    <h2>Connect your accounts</h2>

  </div>

                <p>

                  Securely import your financial information

                  and keep your picture up to date.

                </p>

              </div>

              <span className="setup-arrow">→</span>

            </button>

            <button

             className="setup-card"

             type="button"

             onClick={() => {

  setProfileSource('manual')

  setPendingStatement(null)
  setConnectedSource(null)

  setView('manual-setup')

}}

            >

              <div className="setup-icon">

                <span>＋</span>

              </div>

              <div className="setup-card-copy">

                <h2>Add finances manually</h2>

                <p>

                  Build your financial twin yourself and choose

                  exactly what Portelyx knows.

                </p>

              </div>

              <span className="setup-arrow">→</span>

            </button>

            <button

              className="setup-card"

              type="button"

              onClick={openDemoWorkspace}

            >

              <div className="setup-icon">

                <span>◇</span>

              </div>

              <div className="setup-card-copy">

                <h2>Explore with demo data</h2>

                <p>

                  Experience Portelyx with a ready-made financial

                  profile before adding your own.

                </p>

              </div>

              <span className="setup-arrow">→</span>

            </button>

          </div>

          <p className="setup-note">

            Your financial information stays under your control.

          </p>

        </section>

      </main>

    )

  }

  return (
    <main className="landing-page landing-minimal">
      <nav className="navbar landing-nav">
        <button className="landing-brand" type="button" onClick={goHome} aria-label="Portelyx home">PORTELYX</button>
        <button className="nav-button landing-enter" type="button" onClick={openSetup}>Enter platform <span>→</span></button>
      </nav>

      <section className="landing-hero">
        <div className="landing-copy">
          <div className="landing-kicker"><span className="eyebrow-dot" /> FINANCIAL DECISION TWIN</div>
          <h1>Rehearse your financial<span> decisions before you live them.</span></h1>
          <p>Explore possible futures, stress-test important choices, and discover what would need to change before your answer changes.</p>
          <div className="landing-actions">
            <button className="primary-button landing-primary" type="button" onClick={openSetup}>Build my Financial Twin <span>→</span></button>
            <button className="landing-demo" type="button" onClick={openDemoWorkspace}>Try the demo</button>
          </div>
        </div>

        <div className="future-visual" aria-label="One financial decision branching into possible futures">
          <div className="future-question"><span>YOUR DECISION</span><strong>What if I buy it?</strong></div>
          <div className="future-stem" aria-hidden="true" />
          <div className="future-paths">
            <div className="future-card"><span>NOW</span><strong>Buy</strong><small>Test resilience</small></div>
            <div className="future-card future-card-featured"><span>ALTERNATIVE</span><strong>Wait</strong><small>Compare the future</small></div>
            <div className="future-card"><span>OPTION</span><strong>Finance</strong><small>Find the breakpoint</small></div>
          </div>
          <div className="future-answer"><span className="future-answer-dot" /><p><strong>PORTELYX</strong> calculates which choice survives the most futures.</p></div>
        </div>
      </section>

      <div className="landing-footnote"><span>Your finances</span><i>→</i><span>Your possible futures</span><i>→</i><span>Your decision</span></div>
    </main>
  )

}

export default App