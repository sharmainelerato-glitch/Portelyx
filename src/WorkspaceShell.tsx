import { useEffect, useState, type CSSProperties } from 'react'
import { jsPDF } from 'jspdf'
import { apiUrl } from './api'
import McpSimulator from './McpSimulator'
import { usePortelyxLanguage } from './i18n'
import './WorkspaceShell.css'
import './ScenarioLab.css'
import './RiskIntelligence.css'
import './ReportsCaseFile.css'
import './ReportsPdfExport.css'
import './DataSourcesProvenance.css'
import './InvestmentsIntelligence.css'
import './GoalsIntelligence.css'
import './PortelyxAI.css'
import DecisionTwin from './DecisionTwin'

type Holding = {
  holding_id: string
  name: string
  symbol: string | null
  asset_type: string
  quantity: number
  current_price: number
  currency: string
}

type Goal = {
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
}


type GoalIntelligence = {
  goal_id: string
  name: string
  category: string
  currency: string
  target_amount: number
  target_date: string
  current_saved: number
  monthly_contribution: number
  months_remaining: number
  remaining_amount: number
  projected_contributions: number
  projected_amount: number
  required_monthly_contribution: number | null
  monthly_contribution_gap: number | null
  funding_gap: number
  projected_surplus: number
  progress_percent: number
  status: string
  assumptions: {
    investment_growth_percent: number
    uses_investment_return_assumption: boolean
  }
  additional_monthly_needed: number | null
  monthly_buffer_above_required: number | null
  months_to_target_at_current_contribution: number | null
  estimated_completion_date: string | null
  deadline_delay_months: number | null
  months_ahead_of_deadline: number
  deadline_outlook: string
}

type GoalIntelligenceResponse = {
  base_currency: string
  goal_count: number
  assumed_return_percent: number
  goals: Array<{
    goal: Goal
    intelligence: GoalIntelligence
  }>
}

type JobLossScenario = {
  months_without_income: number
  lost_income: number
  expenses_during_period: number
  starting_cash: number
  cash_after_period: number
  months_cash_can_cover: number
  funding_gap: number
}

type AgentExecution = {
  tool_name: string
  parameters: Record<string, unknown>
  result: Record<string, unknown>
}

type AgentScenarioResponse = {
  status: 'completed' | 'needs_clarification'
  executions?: AgentExecution[]
  simulated_state?: {
    available_cash: number
    funding_gap: number
    monthly_income: number
    monthly_expenses: number
    monthly_surplus: number
    portfolio_value: number
    combined_scenario_impact: number
    [key: string]: unknown
  }
  explanation?: string | null
  clarification_question?: string | null
}

type AIChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type AIChatResponse = {
  message: string
  intent: string
  navigation?: { destination: string } | null
  decision?: Record<string, unknown> | null
  requested_engine?: string | null
  engine_results?: Record<string, unknown> | null
  engine_status?: string | null
  provider?: string
  degraded?: boolean
}

const AI_TO_WORKSPACE: Record<string, WorkspaceSection> = {
  overview: 'overview',
  'decision-twin': 'decision',
  investments: 'investments',
  goals: 'goals',
  scenarios: 'scenarios',
  risk: 'risk',
  reports: 'reports',
  'data-sources': 'sources',
}

const WORKSPACE_TO_AI: Record<WorkspaceSection, string> = {
  overview: 'overview',
  decision: 'decision-twin',
  investments: 'investments',
  goals: 'goals',
  scenarios: 'scenarios',
  risk: 'risk',
  reports: 'reports',
  sources: 'data-sources',
  'mcp-simulator': 'decision',
}

type ConnectedAccountProvenance = {
  source: string
  provider: string
  environment: string
  provider_account_id: number | string | null
  provider_account_name: string | null
  balance_source_field: string | null
  currency: string | null
  provider_refresh_metadata: Record<string, unknown>
  ingested_at: string
}

type ConnectedAccountEvidence = {
  provider: string
  environment: string
  provider_account_id: number | string | null
  provider_account_name: string | null
  name: string | null
  category: string
  account_type: string | null
  container: string | null
  balance: number
  currency: string | null
  provenance: ConnectedAccountProvenance
}

type FinancialDataSource = {
  source: string
  provider: string | null
  environment: string | null
  ingested_at: string | null
  accounts: ConnectedAccountEvidence[]
}

type FinancialProfile = {
  profile_id: string
  profile_type?: string
  base_currency: string
  income: { monthly: number }
  expenses: { monthly: number }
  cash: { available: number }
  assets: { total: number }
  debts: { total: number }
  holdings: Holding[]
  goals: Goal[]
  data_sources?: FinancialDataSource[]
}

type WorkspaceSection =
  | 'overview'
  | 'decision'
  | 'investments'
  | 'goals'
  | 'scenarios'
  | 'risk'
  | 'reports'
  | 'sources'
  | 'mcp-simulator'

type Props = {
  profile: FinancialProfile
  runwayMonths: number | null
  question: string
  scenarioLoading: boolean
  onQuestionChange: (value: string) => void
  jobLossMonths: string
  jobLossScenario: JobLossScenario | null
  onJobLossMonthsChange: (value: string) => void
  onRunJobLossScenario: () => void
  isDemoProfile: boolean
  onUseMyData: () => void
  onExit: () => void
}

export default function WorkspaceShell({
  profile,
  runwayMonths,
  question,
  scenarioLoading,
  onQuestionChange,
  jobLossMonths,
  jobLossScenario,
  onJobLossMonthsChange,
  onRunJobLossScenario,
  isDemoProfile,
  onUseMyData,
  onExit,
}: Props) {
  const { t, languageCode, languageName } = usePortelyxLanguage()
  const [section, setSection] = useState<WorkspaceSection>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [goalIntelligence, setGoalIntelligence] = useState<GoalIntelligenceResponse | null>(null)
  const [goalIntelligenceLoading, setGoalIntelligenceLoading] = useState(false)
  const [goalIntelligenceError, setGoalIntelligenceError] = useState<string | null>(null)
  const [, setAgentResponse] = useState<AgentScenarioResponse | null>(null)
  const [agentLoading, setAgentLoading] = useState(false)
  const [, setAgentError] = useState<string | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiMessages, setAiMessages] = useState<AIChatMessage[]>([])
  const [aiChatLoading, setAiChatLoading] = useState(false)
  const [aiChatError, setAiChatError] = useState<string | null>(null)
  const [aiActiveDecision, setAiActiveDecision] = useState<Record<string, unknown> | null>(null)
  const [aiEngineResults, setAiEngineResults] = useState<Record<string, unknown> | null>(null)


  const money = (value: number, currency = profile.base_currency) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(value)
    } catch {
      return `${currency} ${value.toLocaleString()}`
    }
  }

  const holdings = profile.holdings ?? []
  const goals = profile.goals ?? []

  useEffect(() => {
    let cancelled = false

    const loadGoalIntelligence = async () => {
      if (goals.length === 0) {
        setGoalIntelligence(null)
        setGoalIntelligenceError(null)
        return
      }

      setGoalIntelligenceLoading(true)
      setGoalIntelligenceError(null)

      try {
        const response = await fetch(apiUrl('/goals/intelligence'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        })

        if (!response.ok) {
          throw new Error(`Goal Intelligence request failed (${response.status})`)
        }

        const result = await response.json() as GoalIntelligenceResponse
        if (!cancelled) setGoalIntelligence(result)
      } catch (error) {
        if (!cancelled) {
          setGoalIntelligenceError(
            error instanceof Error ? error.message : t('workspace.goalIntelligenceUnavailable'),
          )
        }
      } finally {
        if (!cancelled) setGoalIntelligenceLoading(false)
      }
    }

    void loadGoalIntelligence()

    return () => {
      cancelled = true
    }
  }, [profile])


  const holdingsByCurrency = holdings.reduce<
  Record<
    string,
    {
      total: number
      holdings: Array<{
        holding: Holding
        value: number
      }>
    }
  >
>((groups, holding) => {
  const currency = holding.currency || profile.base_currency
  const value =
    Math.max(
      0,
      Number(holding.quantity || 0) *
        Number(holding.current_price || 0),
    )

  if (!groups[currency]) {
    groups[currency] = {
      total: 0,
      holdings: [],
    }
  }

  groups[currency].total += value
  groups[currency].holdings.push({
    holding,
    value,
  })

  return groups
}, {})

const holdingCurrencies = Object.keys(holdingsByCurrency)

const hasSingleHoldingCurrency =
  holdingCurrencies.length === 1

const singleHoldingCurrency =
  hasSingleHoldingCurrency
    ? holdingCurrencies[0]
    : null

const comparablePortfolioValue =
  singleHoldingCurrency
    ? holdingsByCurrency[singleHoldingCurrency]?.total ?? 0
    : null

const comparableLargestHolding =
  singleHoldingCurrency
    ? Math.max(
        0,
        ...holdingsByCurrency[singleHoldingCurrency].holdings.map(
          ({ value }) => value,
        ),
      )
    : null

const comparableConcentrationPct =
  comparablePortfolioValue &&
  comparableLargestHolding !== null
    ? (
        comparableLargestHolding /
        comparablePortfolioValue
      ) * 100
    : null



  const dataSources = profile.data_sources ?? []

const connectedSources = dataSources.filter(
  (source) => source.source === 'connected_account',
)

const connectedAccounts = connectedSources.flatMap(
  (source) => source.accounts ?? [],
)

const investmentSourceCount =
  new Set(
    connectedAccounts
      .filter(
        (account) =>
          account.category === 'investment',
      )
      .map((account) => account.provider),
  ).size

const connectedProvider =
  connectedSources[0]?.provider ?? null

const connectedEnvironment =
  connectedSources[0]?.environment ?? null

const connectedIngestedAt =
  connectedSources[0]?.ingested_at ?? null

const formatTimestamp = (value: string | null | undefined) => {
  if (!value) return t('workspace.notSupplied')

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString()
}

  // Risk view: derived only from the current Financial Twin.
  const monthlyIncome = Number(profile.income?.monthly ?? 0)
  const monthlyExpenses = Number(profile.expenses?.monthly ?? 0)
  const availableCash = Number(profile.cash?.available ?? 0)
  const totalAssets = Number(profile.assets?.total ?? 0)
  const totalDebt = Number(profile.debts?.total ?? 0)
  

const portfolioValue =
  comparablePortfolioValue ?? 0



const concentrationPct =
  comparableConcentrationPct ?? 0
  const expenseCoverage =
    monthlyExpenses > 0 ? Math.max(0, availableCash / monthlyExpenses) : 0
  const debtToAssets =
    totalAssets > 0
      ? Math.max(0, (totalDebt / totalAssets) * 100)
      : totalDebt > 0
        ? 100
        : 0
  const surplusMargin =
    monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0

  const liquidityRisk =
    monthlyExpenses <= 0
      ? 'Not enough data'
      : expenseCoverage >= 6
        ? 'Low'
        : expenseCoverage >= 3
          ? 'Moderate'
          : 'High'

  const concentrationRisk =
  holdings.length === 0
    ? 'Not enough data'
    : !hasSingleHoldingCurrency
      ? 'Not enough data'
      : portfolioValue <= 0
        ? 'Not enough data'
        : concentrationPct <= 35
          ? 'Low'
          : concentrationPct <= 60
            ? 'Moderate'
            : 'High'

  const debtRisk =
    totalDebt <= 0
      ? 'Low'
      : debtToAssets <= 20
        ? 'Low'
        : debtToAssets <= 50
          ? 'Moderate'
          : 'High'

  const cashFlowRisk =
    monthlyIncome <= 0
      ? 'Not enough data'
      : surplusMargin >= 20
        ? 'Low'
        : surplusMargin >= 0
          ? 'Moderate'
          : 'High'

  const riskLevels = [liquidityRisk, concentrationRisk, debtRisk, cashFlowRisk]
  const measuredRiskLevels = riskLevels.filter((level) => level !== 'Not enough data')
  const riskPoints = measuredRiskLevels.reduce(
    (sum, level) => sum + (level === 'High' ? 3 : level === 'Moderate' ? 2 : 1),
    0,
  )
  const resilienceScore = measuredRiskLevels.length
    ? Math.round(
        100 -
          ((riskPoints - measuredRiskLevels.length) /
            (measuredRiskLevels.length * 2)) *
            70,
      )
    : null
  const overallRisk =
    resilienceScore === null
      ? 'Not enough data'
      : resilienceScore >= 76
        ? 'Low'
        : resilienceScore >= 51
          ? 'Moderate'
          : 'High'

  const riskText = (level: string) => {
    if (level === 'Low') return t('workspace.riskLow')
    if (level === 'Moderate') return t('workspace.riskModerate')
    if (level === 'High') return t('workspace.riskHigh')
    return t('workspace.notEnoughData')
  }

  const atRiskGoals = goals.filter((goal) => {
    const remaining = Math.max(0, goal.target_amount - goal.current_saved)
    const monthlyContribution = Math.max(0, goal.monthly_contribution)
    if (remaining === 0) return false
    if (monthlyContribution === 0) return true
    const target = new Date(goal.target_date)
    const today = new Date()
    const monthsLeft = Math.max(
      0,
      (target.getFullYear() - today.getFullYear()) * 12 +
        target.getMonth() -
        today.getMonth(),
    )
    return monthsLeft === 0 || remaining / monthlyContribution > monthsLeft
  })
  const netWorth = profile.assets.total - profile.debts.total
  const surplus = profile.income.monthly - profile.expenses.monthly
  const totalOutflow = Math.max(profile.income.monthly, profile.expenses.monthly, 1)
  const incomeWidth = Math.min(100, profile.income.monthly / totalOutflow * 100)
  const expenseWidth = Math.min(100, profile.expenses.monthly / totalOutflow * 100)
  const surplusWidth = Math.min(100, Math.abs(surplus) / totalOutflow * 100)
  const debtShare = profile.assets.total > 0
    ? Math.min(100, Math.max(0, profile.debts.total / profile.assets.total * 100))
    : 0


  const downloadCaseFilePdf = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const left = 18
    const right = 18
    const contentWidth = pageWidth - left - right
    let y = 20

    const ensureSpace = (needed = 16) => {
      if (y + needed > pageHeight - 18) {
        doc.addPage()
        y = 20
      }
    }

    const line = () => {
      doc.setDrawColor(218, 224, 230)
      doc.line(left, y, pageWidth - right, y)
      y += 8
    }

    const heading = (index: string, title: string, subtitle?: string) => {
      ensureSpace(24)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(26, 116, 91)
      doc.text(index, left, y)

      doc.setTextColor(28, 35, 43)
      doc.setFontSize(12)
      doc.text(title, left + 12, y)
      y += 5

      if (subtitle) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(105, 115, 125)
        const lines = doc.splitTextToSize(subtitle, contentWidth - 12)
        doc.text(lines, left + 12, y)
        y += lines.length * 4
      }
      y += 5
    }

    const metric = (label: string, value: string, x: number, width: number) => {
      doc.setFillColor(247, 249, 250)
      doc.roundedRect(x, y, width, 16, 2, 2, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(105, 115, 125)
      doc.text(label, x + 4, y + 5)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(28, 35, 43)
      doc.text(value, x + 4, y + 11)
    }

    // Cover / identity
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(26, 116, 91)
    doc.text('PORTELYX', left, y)
    y += 8

    doc.setFontSize(22)
    doc.setTextColor(19, 26, 34)
    doc.text(t('workspace.caseFileTitle'), left, y)
    y += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(92, 103, 114)
    doc.text(
      doc.splitTextToSize(
        t('workspace.caseFileDescription'),
        contentWidth,
      ),
      left,
      y,
    )
    y += 14

    doc.setFontSize(8)
    doc.setTextColor(110, 120, 130)
    doc.text(`Base currency: ${profile.base_currency}`, left, y)
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - right, y, {
      align: 'right',
    })
    y += 8
    line()

    // 01 Financial position
    heading('01', t('workspace.financialPosition'), t('workspace.financialPositionDescription'))
    const gap = 4
    const cardWidth = (contentWidth - gap * 2) / 3
    metric(t('workspace.estimatedNetWorth'), money(netWorth), left, cardWidth)
    metric(t('workspace.availableCash'), money(availableCash), left + cardWidth + gap, cardWidth)
    metric(t('workspace.monthlyIncome'), money(monthlyIncome), left + (cardWidth + gap) * 2, cardWidth)
    y += 20
    metric(t('workspace.monthlyExpenses'), money(monthlyExpenses), left, cardWidth)
    metric(t('workspace.monthlySurplus'), money(monthlyIncome - monthlyExpenses), left + cardWidth + gap, cardWidth)
    metric(
      t('workspace.cashRunway'),
      monthlyExpenses > 0 ? t('workspace.monthsValue', { count: expenseCoverage.toFixed(1) }) : t('workspace.notAvailable'),
      left + (cardWidth + gap) * 2,
      cardWidth,
    )
    y += 22
    line()

    // 02 Risk
    heading(
      '02',
      t('workspace.riskFindings'),
      t('workspace.riskDisclaimer'),
    )
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(19, 26, 34)
    doc.text(resilienceScore === null ? '—' : String(resilienceScore), left, y)
    doc.setFontSize(8)
    doc.setTextColor(100, 111, 122)
    doc.text(
      overallRisk === 'Not enough data' ? t('workspace.needsMoreData') : t('workspace.measuredRiskValue', { level: riskText(overallRisk) }),
      left + 18,
      y,
    )
    y += 9

    const findings: Array<[string, string, string]> = [
      [
        t('workspace.liquidity'),
        liquidityRisk,
        monthlyExpenses > 0
          ? `${expenseCoverage.toFixed(1)} months of cash coverage`
          : t('workspace.expensesNeeded'),
      ],
      [
        t('workspace.cashFlow'),
        cashFlowRisk,
        monthlyIncome > 0 ? t('workspace.surplusMarginValue', { value: surplusMargin.toFixed(0) }) : t('workspace.incomeNeeded'),
      ],
      [t('workspace.debtExposure'), debtRisk, t('workspace.trackedDebtValue', { value: money(totalDebt) })],
      [
        t('workspace.concentration'),
        concentrationRisk,
        portfolioValue > 0
          ? `${concentrationPct.toFixed(0)}% in largest tracked holding`
          : t('workspace.noTrackedPortfolioValue'),
      ],
    ]

    findings.forEach(([label, level, detail]) => {
      ensureSpace(10)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(37, 45, 54)
      doc.text(label, left, y)
      doc.setTextColor(26, 116, 91)
      doc.text(level, pageWidth - right, y, { align: 'right' })
      y += 4
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(105, 115, 125)
      doc.text(detail, left, y)
      y += 7
    })
    line()

    // 03 Coverage
    heading('03', t('workspace.trackedObjectivesInvestments'), t('workspace.coverageRepresented'))
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 45, 54)
    doc.text(`Investments: ${holdings.length}`, left, y)
    doc.text(`Goals: ${goals.length}`, left + contentWidth / 2, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(105, 115, 125)
    doc.text(
      holdings.length
        ? t('workspace.investmentCoverageValue', { value: money(portfolioValue) })
        : t('workspace.noInvestmentHoldingsRepresented'),
      left,
      y,
    )
    doc.text(
      goals.length
        ? `${atRiskGoals.length} goal(s) potentially off pace.`
        : t('workspace.noFinancialGoalsRepresented'),
      left + contentWidth / 2,
      y,
    )
    y += 10
    line()

    // 04 Scenario evidence
    heading('04', t('workspace.scenarioEvidence'), t('workspace.scenarioEvidenceDescription'))
    if (jobLossScenario) {
      const scenarioRows: Array<[string, string]> = [
        [t('workspace.test'), `${t('workspace.monthsWithoutIncomeValue', { count: jobLossScenario.months_without_income })}`],
        [t('workspace.startingCash'), money(jobLossScenario.starting_cash)],
        [t('workspace.cashAfterPeriod'), money(jobLossScenario.cash_after_period)],
        [t('workspace.fundingGap'), money(jobLossScenario.funding_gap)],
        [t('workspace.cashCoverage'), `${t('workspace.monthsValue', { count: jobLossScenario.months_cash_can_cover.toFixed(1) })}`],
        [t('workspace.baseTwin'), t('workspace.unchanged')],
      ]

      scenarioRows.forEach(([label, value]) => {
        ensureSpace(8)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(105, 115, 125)
        doc.text(label, left, y)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(37, 45, 54)
        doc.text(value, pageWidth - right, y, { align: 'right' })
        y += 7
      })
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(105, 115, 125)
      doc.text(t('workspace.noScenarioEvidenceReport'), left, y)
      y += 8
    }

    line()

heading(
  '05',
  t('workspace.dataProvenance'),
  t('workspace.dataProvenanceDescription'),
)

if (connectedSources.length > 0) {
  connectedSources.forEach((source) => {
    ensureSpace(18)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 45, 54)
    doc.text(
      `${source.provider ?? t('workspace.financialProvider')} · ${(source.environment ?? t('workspace.unknown')).toUpperCase()}`,
      left,
      y,
    )

    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(105, 115, 125)

    doc.text(
      `Accounts represented: ${source.accounts?.length ?? 0}`,
      left,
      y,
    )

    y += 4

    doc.text(
      `Portelyx ingestion: ${formatTimestamp(source.ingested_at)}`,
      left,
      y,
    )

    y += 7

    if (source.environment?.toLowerCase() === 'sandbox') {
      ensureSpace(10)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(150, 105, 35)
      doc.text(
        t('workspace.sandboxDataWarning'),
        left,
        y,
      )

      y += 7
    }

    source.accounts?.forEach((account) => {
      ensureSpace(14)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(37, 45, 54)

      doc.text(
        account.provider_account_name ||
          account.name ||
          t('workspace.connectedAccount'),
        left,
        y,
      )

      doc.text(
        money(
          Number(account.balance ?? 0),
          account.currency || profile.base_currency,
        ),
        pageWidth - right,
        y,
        { align: 'right' },
      )

      y += 4

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(105, 115, 125)

      const detail =
        `${account.category || t('workspace.account')} · ` +
        `${account.account_type || account.container || t('workspace.providerAccount')} · ` +
        t('workspace.balanceSourceValue', { value: account.provenance?.balance_source_field || t('workspace.notSupplied') })

      doc.text(
        doc.splitTextToSize(detail, contentWidth),
        left,
        y,
      )

      y += 7
    })
  })
} else {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(105, 115, 125)

  doc.text(
    t('workspace.noConnectedProvenance'),
    left,
    y,
  )

  y += 8
}

  line()

heading(
  '05',
  t('workspace.dataProvenance'),
  t('workspace.dataProvenanceDescription'),
)

if (connectedSources.length > 0) {
  connectedSources.forEach((source) => {
    ensureSpace(20)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(37, 45, 54)

    const providerLabel =
      source.provider || t('workspace.financialProvider')

    const environmentLabel =
      (source.environment || t('workspace.unknown')).toUpperCase()

    doc.text(
      `${providerLabel} · ${environmentLabel}`,
      left,
      y,
    )

    y += 5

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(105, 115, 125)

    doc.text(
      `Accounts represented: ${source.accounts?.length ?? 0}`,
      left,
      y,
    )

    y += 4

    doc.text(
      `Portelyx ingestion: ${formatTimestamp(source.ingested_at)}`,
      left,
      y,
    )

    y += 7

    if (source.environment?.toLowerCase() === 'sandbox') {
      ensureSpace(10)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(150, 105, 35)

      doc.text(
        t('workspace.sandboxDataWarning'),
        left,
        y,
      )

      y += 8
    }

    source.accounts?.forEach((account) => {
      ensureSpace(16)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(37, 45, 54)

      const accountName =
        account.provider_account_name ||
        account.name ||
        t('workspace.connectedAccount')

      doc.text(
        accountName,
        left,
        y,
      )

      doc.text(
        money(
          Number(account.balance ?? 0),
          account.currency || profile.base_currency,
        ),
        pageWidth - right,
        y,
        { align: 'right' },
      )

      y += 4

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(105, 115, 125)

      const accountType =
        account.account_type ||
        account.container ||
        t('workspace.providerAccount')

      const balanceSource =
        account.provenance?.balance_source_field ||
        t('workspace.notSupplied')

      const detail =
        `${account.category || t('workspace.account')} · ` +
        `${accountType} · ` +
        t('workspace.balanceSourceValue', { value: balanceSource })

      const detailLines =
        doc.splitTextToSize(detail, contentWidth)

      doc.text(
        detailLines,
        left,
        y,
      )

      y += detailLines.length * 3.5

      const providerRefreshValues =
        Object.values(
          account.provenance?.provider_refresh_metadata ?? {},
        )

      const providerRefresh =
        providerRefreshValues.length > 0
          ? String(providerRefreshValues[0])
          : 'Not supplied'

      doc.setFontSize(6.8)
      doc.setTextColor(120, 129, 138)

      doc.text(
        `Provider refresh: ${providerRefresh}`,
        left,
        y,
      )

      y += 3.5

      doc.text(
        `Portelyx ingestion: ${formatTimestamp(
          account.provenance?.ingested_at,
        )}`,
        left,
        y,
      )

      y += 7
    })
  })
} else {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(105, 115, 125)

  doc.text(
    t('workspace.noConnectedProvenance'),
    left,
    y,
  )

  y += 8
}

    ensureSpace(22)
    y += 5
    line()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(26, 116, 91)
    doc.text('PORTELYX', left, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(105, 115, 125)
    doc.text('Financial Intelligence, Explained.', left, y + 4)
    doc.text(
      'Snapshot only - not financial advice.',
      pageWidth - right,
      y + 4,
      { align: 'right' },
    )

    const stamp = new Date().toISOString().slice(0, 10)
    doc.save(`Portelyx-Financial-Twin-Case-File-${stamp}.pdf`)
  }

  const askPortelyxAgent = async () => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || agentLoading) return

    setAgentLoading(true)
    setAgentError(null)
    setAgentResponse(null)

    try {
      const response = await fetch(apiUrl('/agent/scenario'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmedQuestion,
          financial_profile: profile,
        }),
      })

      const result = await response.json() as AgentScenarioResponse | { detail?: unknown }

      if (!response.ok) {
        const detail =
          typeof result === 'object' && result !== null && 'detail' in result
            ? JSON.stringify(result.detail)
            : `Request failed (${response.status})`
        throw new Error(detail)
      }

      setAgentResponse(result as AgentScenarioResponse)
    } catch (error) {
      setAgentError(
        error instanceof Error
          ? error.message
          : 'Portelyx AI is temporarily unavailable.',
      )
    } finally {
      setAgentLoading(false)
    }
  }

  const askPortelyxChat = async () => {
    const message = aiInput.trim()
    if (!message || aiChatLoading) return

    const userMessage: AIChatMessage = { role: 'user', content: message }
    const history = aiMessages.slice(-12)

    setAiInput('')
    setAiMessages((current) => [...current, userMessage])
    setAiChatLoading(true)
    setAiChatError(null)

    try {
      const response = await fetch(apiUrl('/agent/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          message,
          financial_profile: profile,
          history,
          language_code: languageCode,
          language_name: languageName,
          current_page: WORKSPACE_TO_AI[section],
          ui_context: {
            current_section: WORKSPACE_TO_AI[section],
            active_decision: aiActiveDecision,
            visible_result: aiEngineResults,
          },
        }),
      })

      const result = await response.json() as AIChatResponse | { detail?: unknown }

      if (!response.ok) {
        const detail =
          typeof result === 'object' && result !== null && 'detail' in result
            ? JSON.stringify(result.detail)
            : `Request failed (${response.status})`
        throw new Error(detail)
      }

      const chat = result as AIChatResponse
      setAiMessages((current) => [
        ...current,
        { role: 'assistant', content: chat.message },
      ])

      if (chat.decision) setAiActiveDecision(chat.decision)
      if (chat.engine_results) setAiEngineResults(chat.engine_results)

      const destination = chat.navigation?.destination
      if (destination) {
        const workspaceDestination = AI_TO_WORKSPACE[destination]
        if (workspaceDestination) {
          setSection(workspaceDestination)
          setMenuOpen(false)
        }
      }
    } catch (error) {
      setAiChatError(
        error instanceof Error
          ? error.message
          : 'Portelyx AI is temporarily unavailable.',
      )
    } finally {
      setAiChatLoading(false)
    }
  }

  const navigate = (next: WorkspaceSection) => {
    setSection(next)
    setMenuOpen(false)
  }

  return (
    <main className="px-workspace">
      <header className="px-topbar">
        <div className="px-topbar-left">
          <button
            className="px-menu-button"
            type="button"
            aria-label={t('workspace.openNavigation')}
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
          <div className="logo">PORTELYX</div>
        </div>

        <div className="px-topbar-right">
          <span className="px-twin-active">
            <i />
            {t('workspace.twinActive')}
          </span>

          {isDemoProfile && (
  <div className="px-demo-controls">
    <span className="px-demo-badge">
      {t('workspace.demoFinancialTwin')}
    </span>

    <button
      className="px-use-data-button"
      type="button"
      onClick={onUseMyData}
    >
      {t('workspace.useMyData')}
      <span>→</span>
    </button>
  </div>
)}
          <button className="px-exit" type="button" onClick={onExit}>
            {t('workspace.exit')}
          </button>
        </div>
      </header>

      <div className={`px-layout ${aiOpen ? '' : 'ai-collapsed'}`}>
        <aside className={`px-sidebar ${menuOpen ? 'open' : ''}`}>
          <div className="px-sidebar-title">
            <span>{t('workspace.workspace')}</span>
            <button
              type="button"
              aria-label={t('workspace.closeNavigation')}
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>
          </div>

          <nav>
            <button
              className={section === 'overview' ? 'active' : ''}
              type="button"
              onClick={() => navigate('overview')}
            >
              <span>{t('workspace.overview')}</span><b>01</b>
            </button>
            <button
              className={section === 'decision' ? 'active' : ''}
              type="button"
              onClick={() => navigate('decision')}
            >
              <span>{t('workspace.decisionTwin')}</span><b>02</b>
            </button>
            <button
              className={section === 'investments' ? 'active' : ''}
              type="button"
              onClick={() => navigate('investments')}
            >
              <span>{t('workspace.investments')}</span><b>{holdings.length}</b>
            </button>
            <button
              className={section === 'goals' ? 'active' : ''}
              type="button"
              onClick={() => navigate('goals')}
            >
              <span>{t('workspace.goals')}</span><b>{goals.length}</b>
            </button>

            <button
              className={section === 'scenarios' ? 'active' : ''}
              type="button"
              onClick={() => navigate('scenarios')}
            >
              <span>{t('workspace.scenarios')}</span><b>04</b>
            </button>
            <button
              className={section === 'risk' ? 'active' : ''}
              type="button"
              onClick={() => navigate('risk')}
            >
              <span>{t('workspace.risk')}</span><b>05</b>
            </button>
            <button
              className={section === 'reports' ? 'active' : ''}
              type="button"
              onClick={() => navigate('reports')}
            >
              <span>{t('workspace.reports')}</span><b>06</b>
            </button>

            <button
  className={section === 'sources' ? 'active' : ''}
  type="button"
  onClick={() => navigate('sources')}
>
  <span>{t('workspace.dataSources')}</span>
  <b>07</b>
</button>
            <button
              className={section === 'mcp-simulator' ? 'active' : ''}
              type="button"
              onClick={() => navigate('mcp-simulator')}
            >
              <span>MCP Simulator</span>
              <b>08</b>
            </button>
          </nav>

          <div className="px-sidebar-coming">
            <span>{t('workspace.workspaceMap')}</span>
            <p>{t('workspace.workspaceMapDescription')}</p>
          </div>
        </aside>

        <section className="px-canvas">
          {section === 'overview' && (
            <>
              <header className="px-page-heading">
                <div>
                  <p>{t('workspace.overviewEyebrow')}</p>
                  <h1>{t('workspace.overviewTitle')}</h1>
                  <span>
                    {t('workspace.overviewDescription')}
                  </span>
                </div>
                <button className="px-dots" type="button" aria-label={t('workspace.financialTwinOptions')}>
                  ···
                </button>
              </header>

              <section className="px-metrics">
                <article className="px-metric-primary">
                  <span>{t('workspace.estimatedNetWorth')}</span>
                  <strong>{money(netWorth)}</strong>
                  <small>{t('workspace.assetsMinusDebts')}</small>
                </article>
                <article>
                  <span>{t('workspace.monthlySurplus')}</span>
                  <strong>{money(surplus)}</strong>
                  <small>{t('workspace.incomeMinusSpending')}</small>
                </article>
                <article>
                  <span>{t('workspace.availableCash')}</span>
                  <strong>{money(profile.cash.available)}</strong>
                  <small>{t('workspace.currentTwin')}</small>
                </article>
                <article>
                  <span>{t('workspace.cashRunway')}</span>
                  <strong>{runwayMonths !== null ? t('workspace.monthsShort', { count: runwayMonths }) : '—'}</strong>
                  <small>{t('workspace.atCurrentSpending')}</small>
                </article>
              </section>

              <div className="px-overview-grid">
                <article className="px-panel px-flow-panel">
                  <header>
                    <div>
                      <span>{t('workspace.monthlyFlow')}</span>
                      <h2>{t('workspace.incomeAndSpending')}</h2>
                    </div>
                    <button className="px-dots" type="button" aria-label={t('workspace.cashFlowOptions')}>···</button>
                  </header>

                  <div className="px-bar-chart" aria-label={t('workspace.cashFlowComparison')}>
                    <div className="px-bar-row">
                      <div><span>{t('workspace.income')}</span><strong>{money(profile.income.monthly)}</strong></div>
                      <div className="px-bar-track"><i style={{ width: `${incomeWidth}%` }} /></div>
                    </div>
                    <div className="px-bar-row">
                      <div><span>{t('workspace.spending')}</span><strong>{money(profile.expenses.monthly)}</strong></div>
                      <div className="px-bar-track"><i style={{ width: `${expenseWidth}%` }} /></div>
                    </div>
                    <div className="px-bar-row surplus">
                      <div><span>{surplus >= 0 ? t('workspace.surplus') : t('workspace.deficit')}</span><strong>{money(surplus)}</strong></div>
                      <div className="px-bar-track"><i style={{ width: `${surplusWidth}%` }} /></div>
                    </div>
                  </div>
                </article>

                <article className="px-panel px-balance-panel">
                  <header>
                    <div>
                      <span>{t('workspace.balanceSheet')}</span>
                      <h2>{t('workspace.assetsAndDebt')}</h2>
                    </div>
                    <button className="px-dots" type="button" aria-label={t('workspace.balanceSheetOptions')}>···</button>
                  </header>

                  <div className="px-ring-row">
                    <div
                      className="px-ring"
                      style={{ '--debt-share': `${debtShare * 3.6}deg` } as CSSProperties}
                    >
                      <div>
                        <strong>{Math.round(debtShare)}%</strong>
                        <span>{t('workspace.debtAssets')}</span>
                      </div>
                    </div>
                    <div className="px-balance-values">
                      <div><span>{t('workspace.assets')}</span><strong>{money(profile.assets.total)}</strong></div>
                      <div><span>{t('workspace.debts')}</span><strong>{money(profile.debts.total)}</strong></div>
                    </div>
                  </div>
                </article>
              </div>

              <section className="px-twin-summary">
                <header>
                  <div>
                    <span>{t('workspace.twinCoverage')}</span>
                    <h2>{t('workspace.whatPortelyxKnows')}</h2>
                  </div>
                  <button className="px-dots" type="button" aria-label={t('workspace.twinCoverageOptions')}>···</button>
                </header>
                <div className="px-twin-pulse">
                  <div><strong>{holdings.length}</strong><span>{t('workspace.investments')}</span></div>
                  <div><strong>{goals.length}</strong><span>{t('workspace.goals')}</span></div>
                  <div><strong>{profile.base_currency}</strong><span>{t('workspace.baseCurrency')}</span></div>
                  <div><strong>{runwayMonths !== null ? `${runwayMonths}` : '—'}</strong><span>{t('workspace.runwayMonths')}</span></div>
                </div>
              </section>
            </>
          )}

          {section === 'investments' && (
  <>
    <header className="px-page-heading px-investment-heading">
      <div>
        <p>{t('workspace.investmentsEyebrow')}</p>
        <h1>{t('workspace.investmentsTitle')}</h1>
        <span>
          {t('workspace.investmentsDescription')}
        </span>
      </div>

      <span className="px-investment-status">
        <i />
        {t('workspace.trackedCount', { count: holdings.length })}
      </span>
    </header>

    {holdings.length === 0 ? (
      <section className="px-investment-empty">
        <span>{t('workspace.noTrackedInvestments')}</span>
        <h2>{t('workspace.portfolioEmpty')}</h2>
        <p>
          {t('workspace.portfolioEmptyDescription')}
        </p>
      </section>
    ) : (
      <>
        <section className="px-investment-summary">
          <article className="px-investment-main-card">
            <span>{t('workspace.trackedPortfolioValue')}</span>

            {hasSingleHoldingCurrency &&
            singleHoldingCurrency ? (
              <>
                <strong>
                  {money(
                    comparablePortfolioValue ?? 0,
                    singleHoldingCurrency,
                  )}
                </strong>
                <small>
                  Across {t('workspace.trackedCount', { count: holdings.length })} holding
                  {holdings.length === 1 ? '' : 's'}
                </small>
              </>
            ) : (
              <>
                <strong>{t('workspace.multiCurrency')}</strong>
                <small>
                  {t('workspace.multiCurrencyDescription')}
                </small>
              </>
            )}

            <div className="px-investment-currency-totals">
              {holdingCurrencies.map((currency) => (
                <div key={currency}>
                  <span>{currency}</span>
                  <strong>
                    {money(
                      holdingsByCurrency[currency].total,
                      currency,
                    )}
                  </strong>
                </div>
              ))}
            </div>
          </article>

          <article className="px-investment-signal-card">
            <span>{t('workspace.concentration')}</span>

            <strong>
              {comparableConcentrationPct !== null
                ? `${comparableConcentrationPct.toFixed(0)}%`
                : '—'}
            </strong>

            <p>
              {comparableConcentrationPct === null
                ? t('workspace.concentrationNeedsCurrency')
                : comparableConcentrationPct <= 35
                  ? t('workspace.concentrationLow')
                  : comparableConcentrationPct <= 60
                    ? t('workspace.concentrationModerate')
                    : t('workspace.concentrationHigh')}
            </p>

            {comparableConcentrationPct !== null && (
              <div className="px-investment-signal-track">
                <i
                  style={{
                    width: `${Math.min(
                      100,
                      comparableConcentrationPct,
                    )}%`,
                  }}
                />
              </div>
            )}
          </article>

          <article className="px-investment-meta-card">
            <span>{t('workspace.portfolioCoverage')}</span>

            <div>
              <strong>{holdings.length}</strong>
              <small>{t('workspace.holdingsLabel')}</small>
            </div>

            <div>
              <strong>{holdingCurrencies.length}</strong>
              <small>
                Currenc
                {holdingCurrencies.length === 1
                  ? 'y'
                  : 'ies'}
              </small>
            </div>

            <div>
              <strong>{investmentSourceCount}</strong>
              <small>{t('workspace.connectedSourcesLabel')}</small>
            </div>
          </article>
        </section>

        <section className="px-allocation-panel">
          <header>
            <div>
              <span>{t('workspace.portfolioStructure')}</span>
              <h2>{t('workspace.allocationByHolding')}</h2>
            </div>

            {!hasSingleHoldingCurrency && (
              <small>
                {t('workspace.shownByCurrency')}
              </small>
            )}
          </header>

          <div className="px-allocation-groups">
            {holdingCurrencies.map((currency) => {
              const group =
                holdingsByCurrency[currency]

              return (
                <article
                  className="px-allocation-group"
                  key={currency}
                >
                  <header>
                    <div>
                      <span>{currency}</span>
                      <strong>
                        {money(group.total, currency)}
                      </strong>
                    </div>

                    <small>
                      {group.holdings.length} holding
                      {group.holdings.length === 1
                        ? ''
                        : 's'}
                    </small>
                  </header>

                  <div className="px-allocation-list">
                    {group.holdings.map(
                      ({ holding, value }) => {
                        const allocation =
                          group.total > 0
                            ? (value / group.total) * 100
                            : 0

                        return (
                          <div
                            className="px-allocation-row"
                            key={holding.holding_id}
                          >
                            <div className="px-allocation-copy">
                              <div className="px-investment-mark">
                                {holding.name
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {holding.name}
                                </strong>

                                <span>
                                  {holding.symbol ||
                                    holding.asset_type}
                                </span>
                              </div>
                            </div>

                            <div className="px-allocation-value">
                              <strong>
                                {money(
                                  value,
                                  holding.currency,
                                )}
                              </strong>

                              <span>
                                {allocation.toFixed(1)}%
                              </span>
                            </div>

                            <div className="px-allocation-track">
                              <i
                                style={{
                                  width: `${Math.min(
                                    100,
                                    allocation,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      },
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="px-investment-holdings">
          <header>
            <div>
              <span>{t('workspace.holdingsEyebrow')}</span>
              <h2>{t('workspace.trackedPositions')}</h2>
            </div>
          </header>

          <div className="px-investment-grid">
            {holdings.map((holding) => {
              const value =
                Number(holding.quantity || 0) *
                Number(holding.current_price || 0)

              const currencyGroup =
                holdingsByCurrency[holding.currency]

              const allocation =
                currencyGroup?.total > 0
                  ? (value / currencyGroup.total) * 100
                  : 0

              return (
                <article
                  className="px-investment-card"
                  key={holding.holding_id}
                >
                  <header>
                    <div className="px-investment-mark large">
                      {holding.name
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>

                    <button
                      className="px-dots"
                      type="button"
                      aria-label={t('workspace.holdingOptions', { name: holding.name })}
                    >
                      ···
                    </button>
                  </header>

                  <div className="px-investment-card-copy">
                    <span>
                      {holding.asset_type}
                    </span>

                    <h3>{holding.name}</h3>

                    <small>
                      {holding.symbol ||
                        holding.currency}
                    </small>
                  </div>

                  <strong className="px-investment-value">
                    {money(
                      value,
                      holding.currency,
                    )}
                  </strong>

                  <div className="px-investment-position">
                    <div>
                      <span>{t('workspace.quantity')}</span>
                      <strong>
                        {holding.quantity}
                      </strong>
                    </div>

                    <div>
                      <span>{t('workspace.unitPrice')}</span>
                      <strong>
                        {money(
                          holding.current_price,
                          holding.currency,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        {t('workspace.currencyAllocation', { currency: holding.currency })}
                      </span>
                      <strong>
                        {allocation.toFixed(1)}%
                      </strong>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      </>
    )}
  </>
)}

          {section === 'goals' && (
            <>
              <header className="px-page-heading px-goals-heading">
                <div>
                  <p>{t('workspace.goalsEyebrow')}</p>
                  <h1>{t('workspace.goalsTitle')}</h1>
                  <span>
                    {t('workspace.goalsDescription')}
                  </span>
                </div>
                <span className="px-goals-method">{t('workspace.assumedReturnZero')}</span>
              </header>

              {goals.length === 0 ? (
                <section className="px-goals-empty">
                  <span>{t('workspace.noTrackedGoals')}</span>
                  <h2>{t('workspace.goalsEmptyTitle')}</h2>
                  <p>{t('workspace.goalsEmptyDescription')}</p>
                </section>
              ) : goalIntelligenceLoading && !goalIntelligence ? (
                <section className="px-goals-loading">{t('workspace.calculatingGoalIntelligence')}</section>
              ) : goalIntelligenceError ? (
                <section className="px-goals-error">
                  <strong>{t('workspace.goalIntelligenceUnavailable')}</strong>
                  <span>{goalIntelligenceError}</span>
                </section>
              ) : (
                <>
                  <section className="px-goals-summary">
                    <article className="px-goals-summary-primary">
                      <span>{t('workspace.trackedObjectives')}</span>
                      <strong>{goalIntelligence?.goal_count ?? goals.length}</strong>
                      <small>{t('workspace.calculatedFromTwin')}</small>
                    </article>
                    <article>
                      <span>{t('workspace.onPace')}</span>
                      <strong>
                        {goalIntelligence?.goals.filter(({ intelligence }) =>
                          ['on_track', 'ahead', 'funded', 'already_funded'].includes(intelligence.status) ||
                          ['on_deadline', 'ahead_of_deadline', 'already_funded'].includes(intelligence.deadline_outlook),
                        ).length ?? 0}
                      </strong>
                      <small>{t('workspace.currentContributionPace')}</small>
                    </article>
                    <article>
                      <span>{t('workspace.needsAttention')}</span>
                      <strong>
                        {goalIntelligence?.goals.filter(({ intelligence }) =>
                          intelligence.funding_gap > 0 &&
                          !['on_deadline', 'ahead_of_deadline', 'already_funded'].includes(intelligence.deadline_outlook),
                        ).length ?? 0}
                      </strong>
                      <small>{t('workspace.missCurrentTargetPace')}</small>
                    </article>
                  </section>

                  <section className="px-goals-intro">
                    <div>
                      <span>{t('workspace.objectiveMap')}</span>
                      <h2>{t('workspace.goalsMeasuredAgainstTime')}</h2>
                    </div>
                    <p>{t('workspace.growthAssumption')} <strong>0%</strong>. {t('workspace.contributionProjectionNote')}</p>
                  </section>

                  <section className="px-goals-grid">
                    {(goalIntelligence?.goals ?? []).map(({ goal, intelligence }) => {
                      const progress = Math.min(100, Math.max(0, intelligence.progress_percent ?? 0))
                      const funded = intelligence.remaining_amount <= 0
                      const onPace = funded || ['on_deadline', 'ahead_of_deadline', 'already_funded'].includes(intelligence.deadline_outlook)
                      const statusLabel = funded
                        ? t('workspace.funded')
                        : intelligence.status === 'deadline_reached'
                          ? t('workspace.deadlineReached')
                          : onPace
                            ? t('workspace.onPaceTitle')
                            : t('workspace.needsAttentionTitle')

                      return (
                        <article className="px-goal-intelligence-card" key={goal.goal_id}>
                          <header>
                            <div>
                              <span>{t('workspace.goalMeta', { category: goal.category || 'CUSTOM', priority: goal.priority || 'STANDARD' })}</span>
                              <h2>{goal.name}</h2>
                            </div>
                            <span className={`px-goal-status ${onPace ? 'on-pace' : 'attention'}`}>{statusLabel}</span>
                          </header>

                          <div className="px-goal-funding">
                            <div>
                              <span>{t('workspace.currentlyFunded')}</span>
                              <strong>{money(goal.current_saved, goal.currency)}</strong>
                              <small>of {money(goal.target_amount, goal.currency)}</small>
                            </div>
                            <div className="px-goal-progress-copy">
                              <strong>{progress.toFixed(0)}%</strong>
                              <span>{intelligence.months_remaining} months remaining</span>
                            </div>
                          </div>

                          <div className="px-goal-progress-track">
                            <i style={{ width: `${progress}%` }} />
                          </div>

                          <div className="px-goal-metrics">
                            <div>
                              <span>{t('workspace.currentMonthlyPace')}</span>
                              <strong>{money(goal.monthly_contribution, goal.currency)}</strong>
                            </div>
                            <div>
                              <span>{t('workspace.requiredMonthlyPace')}</span>
                              <strong>{intelligence.required_monthly_contribution === null ? '—' : money(intelligence.required_monthly_contribution, goal.currency)}</strong>
                            </div>
                            <div>
                              <span>{t('workspace.projectedAtDeadline')}</span>
                              <strong>{money(intelligence.projected_amount, goal.currency)}</strong>
                            </div>
                            <div>
                              <span>{intelligence.projected_surplus > 0 ? t('workspace.projectedSurplus') : t('workspace.projectedShortfall')}</span>
                              <strong>{money(intelligence.projected_surplus > 0 ? intelligence.projected_surplus : intelligence.funding_gap, goal.currency)}</strong>
                            </div>
                          </div>

                          <footer>
                            <div>
                              <span>{t('workspace.target')}</span>
                              <strong>{new Date(`${goal.target_date}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                            </div>
                            <div>
                              <span>{t('workspace.estimatedCompletion')}</span>
                              <strong>{intelligence.estimated_completion_date ? new Date(`${intelligence.estimated_completion_date}T00:00:00`).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : t('workspace.notReachableAtCurrentPace')}</strong>
                            </div>
                            <div>
                              <span>{t('workspace.paceAdjustment')}</span>
                              <strong>{intelligence.additional_monthly_needed === null ? t('workspace.notAvailable') : intelligence.additional_monthly_needed > 0 ? `+${money(intelligence.additional_monthly_needed, goal.currency)} / mo` : t('workspace.noIncreaseNeeded')}</strong>
                            </div>
                          </footer>
                        </article>
                      )
                    })}
                  </section>
                </>
              )}
            </>
          )}


          {section === 'reports' && (
            <>
              <header className="px-page-heading px-report-heading">
                <div>
                  <p>{t('workspace.reportsEyebrow')}</p>
                  <h1>{t('workspace.reportsTitle')}</h1>
                  <span>
                    {t('workspace.reportsDescription')}
                  </span>
                </div>
                <div className="px-report-actions">
                  <span className="px-report-state">
                    <i />
                    {t('workspace.currentSnapshot')}
                  </span>
                  <button
                    className="px-report-download"
                    type="button"
                    onClick={downloadCaseFilePdf}
                  >
                    {t('workspace.downloadPdf')}
                    <span>↓</span>
                  </button>
                </div>
              </header>

              <section className="px-casefile">
                <div className="px-casefile-top">
                  <div>
                    <span>{t('workspace.caseFile')}</span>
                    <h2>{t('workspace.financialTwinSnapshot')}</h2>
                    <p>
                      {t('workspace.reportDisclaimer')}
                    </p>
                  </div>
                  <div className="px-casefile-stamp">
                    <span>{t('workspace.baseCurrency').toUpperCase()}</span>
                    <strong>{profile.base_currency}</strong>
                  </div>
                </div>

                <div className="px-casefile-rule" />

                <section className="px-report-section">
                  <header>
                    <span>01</span>
                    <div>
                      <strong>{t('workspace.financialPosition')}</strong>
                      <small>{t('workspace.currentBaseTwin')}</small>
                    </div>
                  </header>

                  <div className="px-report-metrics">
                    <article>
                      <span>{t('workspace.estimatedNetWorthReport')}</span>
                      <strong>{money(netWorth)}</strong>
                    </article>
                    <article>
                      <span>{t('workspace.reportsAvailableCash')}</span>
                      <strong>{money(availableCash)}</strong>
                    </article>
                    <article>
                      <span>{t('workspace.monthlyIncome')}</span>
                      <strong>{money(monthlyIncome)}</strong>
                    </article>
                    <article>
                      <span>{t('workspace.reportsMonthlyExpenses')}</span>
                      <strong>{money(monthlyExpenses)}</strong>
                    </article>
                    <article>
                      <span>{t('workspace.reportsMonthlySurplus')}</span>
                      <strong>{money(monthlyIncome - monthlyExpenses)}</strong>
                    </article>
                    <article>
                      <span>{t('workspace.reportsCashRunway')}</span>
                      <strong>{monthlyExpenses > 0 ? t('workspace.monthsShortValue', { count: expenseCoverage.toFixed(1) }) : '—'}</strong>
                    </article>
                  </div>
                </section>

                <section className="px-report-section">
                  <header>
                    <span>02</span>
                    <div>
                      <strong>{t('workspace.riskFindings')}</strong>
                      <small>{t('workspace.riskFindingsDescription')}</small>
                    </div>
                  </header>

                  <div className="px-report-risk">
                    <div className="px-report-risk-summary">
                      <span>{t('workspace.resilienceSignal')}</span>
                      <strong>{resilienceScore ?? '—'}</strong>
                      <small>{overallRisk === 'Not enough data' ? t('workspace.needsMoreData') : t('workspace.measuredRiskValue', { level: riskText(overallRisk) })}</small>
                    </div>

                    <div className="px-report-findings">
                      {[
                        [t('workspace.liquidity'), liquidityRisk, monthlyExpenses > 0 ? `${expenseCoverage.toFixed(1)} months of cash coverage` : t('workspace.expensesNeeded')],
                        [t('workspace.cashFlow'), cashFlowRisk, monthlyIncome > 0 ? t('workspace.surplusMarginValue', { value: surplusMargin.toFixed(0) }) : t('workspace.incomeNeeded')],
                        [t('workspace.debtExposure'), debtRisk, t('workspace.trackedDebtValue', { value: money(totalDebt) })],
                        [t('workspace.concentration'), concentrationRisk, portfolioValue > 0 ? `${concentrationPct.toFixed(0)}% in largest tracked holding` : t('workspace.noTrackedPortfolioValue')],
                      ].map(([label, level, detail]) => (
                        <div key={label}>
                          <span>{label}</span>
                          <p>{detail}</p>
                          <strong className={level.toLowerCase().replaceAll(' ', '-')}>{level}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="px-report-section">
                  <header>
                    <span>03</span>
                    <div>
                      <strong>{t('workspace.trackedObjectivesInvestments')}</strong>
                      <small>{t('workspace.coverageRepresented')}</small>
                    </div>
                  </header>

                  <div className="px-report-coverage">
                    <article>
                      <span>{t('workspace.investments').toUpperCase()}</span>
                      <strong>{holdings.length}</strong>
                      <p>
                        {holdings.length
                          ? t('workspace.investmentCoverageValue', { value: money(portfolioValue) })
                          : t('workspace.noInvestmentHoldingsRepresented')}
                      </p>
                    </article>
                    <article>
                      <span>{t('workspace.goals').toUpperCase()}</span>
                      <strong>{goals.length}</strong>
                      <p>
                        {goals.length
                          ? t('workspace.goalsOffPaceCount', { count: atRiskGoals.length })
                          : t('workspace.noFinancialGoalsRepresented')}
                      </p>
                    </article>
                  </div>
                </section>

                <section className="px-report-section">
                  <header>
                    <span>04</span>
                    <div>
                      <strong>{t('workspace.scenarioEvidence')}</strong>
                      <small>{t('workspace.scenarioEvidenceDescription')}</small>
                    </div>
                  </header>

                  {jobLossScenario ? (
                    <div className="px-report-scenario">
                      <div>
                        <span>{t('workspace.test')}</span>
                        <strong>{t('workspace.monthsWithoutIncomeValue', { count: jobLossScenario.months_without_income })}</strong>
                      </div>
                      <div>
                        <span>{t('workspace.startingCash')}</span>
                        <strong>{money(jobLossScenario.starting_cash)}</strong>
                      </div>
                      <div>
                        <span>{t('workspace.cashAfterPeriod')}</span>
                        <strong>{money(jobLossScenario.cash_after_period)}</strong>
                      </div>
                      <div>
                        <span>{t('workspace.fundingGap')}</span>
                        <strong>{money(jobLossScenario.funding_gap)}</strong>
                      </div>
                      <div>
                        <span>{t('workspace.cashCoverage')}</span>
                        <strong>{t('workspace.monthsValue', { count: jobLossScenario.months_cash_can_cover.toFixed(1) })}</strong>
                      </div>
                      <div>
                        <span>{t('workspace.baseTwin').toUpperCase()}</span>
                        <strong>{t('workspace.unchanged')}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="px-report-empty">
                      <div>
                        <strong>{t('workspace.noScenarioEvidence')}</strong>
                        <span>{t('workspace.noScenarioEvidenceDescription')}</span>
                      </div>
                      <button type="button" onClick={() => navigate('scenarios')}>
                        {t('workspace.openScenarioLab')} <b>→</b>
                      </button>
                    </div>
                  )}
                </section>

                <footer className="px-casefile-footer">
                  <div>
                    <span>PORTELYX</span>
                    <p>{t('workspace.financialIntelligenceExplained')}</p>
                  </div>
                  <div>
                    <strong>{t('workspace.snapshotOnly')}</strong>
                    <span>{t('workspace.snapshotDescription')}</span>
                  </div>
                </footer>
              </section>
            </>
          )}

          {section === 'mcp-simulator' && <McpSimulator />}
          {section === 'sources' && (
  <>
    <header className="px-page-heading">
      <div>
        <p>{t('workspace.dataSourcesEyebrow')}</p>
        <h1>{t('workspace.dataSourcesTitle')}</h1>
        <span>
          Evidence retained from the financial data used to build this Financial Twin.
        </span>
      </div>

      {connectedEnvironment && (
        <span className={`px-source-environment ${connectedEnvironment.toLowerCase()}`}>
          {connectedEnvironment.toUpperCase()}
        </span>
      )}
    </header>

    {connectedSources.length === 0 ? (
      <section className="px-source-empty">
        <span>{t('workspace.noConnectedSource')}</span>
        <h2>{t('workspace.noConnectedSourceTitle')}</h2>
        <p>
          Financial values may have been entered manually or imported from another
          source. Connected-account provenance will appear here when available.
        </p>
      </section>
    ) : (
      <>
        <section className="px-source-hero">
          <div>
            <span>{t('workspace.connectedAccountSource')}</span>
            <h2>{connectedProvider ?? t('workspace.financialProvider')}</h2>
            <p>
              {connectedAccounts.length} account
              {connectedAccounts.length === 1 ? '' : 's'} contributed evidence to
              this Financial Twin.
            </p>
          </div>

          <div className="px-source-facts">
            <div>
              <span>{t('workspace.environment')}</span>
              <strong>
                {connectedEnvironment?.toUpperCase() ?? t('workspace.notSupplied')}
              </strong>
            </div>

            <div>
              <span>{t('workspace.baseCurrency').toUpperCase()}</span>
              <strong>{profile.base_currency}</strong>
            </div>

            <div>
              <span>{t('workspace.ingestedByPortelyx')}</span>
              <strong>{formatTimestamp(connectedIngestedAt)}</strong>
            </div>
          </div>
        </section>

        {connectedEnvironment?.toLowerCase() === 'sandbox' && (
          <div className="px-source-notice">
            <strong>{t('workspace.sandboxData')}</strong>
            <span>
              These are provider sandbox values used for testing and demonstration.
              They are not presented as live banking data.
            </span>
          </div>
        )}

        <section className="px-source-list">
          {connectedAccounts.map((account, index) => {
            const providerRefresh =
              Object.values(
                account.provenance?.provider_refresh_metadata ?? {},
              )[0]

            return (
              <article
                className="px-source-account"
                key={`${account.provider_account_id ?? account.name ?? t('workspace.account')}-${index}`}
              >
                <header>
                  <div>
                    <span>
                      {account.category?.toUpperCase() || t('workspace.account')}
                    </span>

                    <h2>
                      {account.provider_account_name ||
                        account.name ||
                        t('workspace.connectedAccount')}
                    </h2>

                    <small>
                      {[account.account_type, account.container]
                        .filter(Boolean)
                        .join(' · ') || t('workspace.providerAccount')}
                    </small>
                  </div>

                  <div className="px-source-balance">
                    <span>{t('workspace.providerReportedBalance')}</span>
                    <strong>
                      {money(
                        Number(account.balance ?? 0),
                        account.currency || profile.base_currency,
                      )}
                    </strong>
                  </div>
                </header>

                <div className="px-source-details">
                  <div>
                    <span>{t('workspace.provider')}</span>
                    <strong>{account.provider}</strong>
                  </div>

                  <div>
                    <span>{t('workspace.environment')}</span>
                    <strong>{account.environment}</strong>
                  </div>

                  <div>
                    <span>{t('workspace.currency')}</span>
                    <strong>{account.currency ?? 'Not supplied'}</strong>
                  </div>

                  <div>
                    <span>{t('workspace.balanceSource')}</span>
                    <strong>
                      {account.provenance?.balance_source_field ??
                        'Not supplied'}
                    </strong>
                  </div>

                  <div>
                    <span>{t('workspace.providerRefresh')}</span>
                    <strong>
                      {providerRefresh
                        ? String(providerRefresh)
                        : 'Not supplied'}
                    </strong>
                  </div>

                  <div>
                    <span>{t('workspace.portelyxIngestion')}</span>
                    <strong>
                      {formatTimestamp(
                        account.provenance?.ingested_at,
                      )}
                    </strong>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <footer className="px-source-proof">
          <span>✓</span>
          <div>
            <strong>{t('workspace.sourceEvidencePreserved')}</strong>
            <p>
              Portelyx keeps provider provenance separate from the Financial
              Twin values derived from it.
            </p>
          </div>
        </footer>
      </>
    )}
  </>
)}

          {section === 'risk' && (
            <>
              <header className="px-page-heading px-risk-heading">
                <div>
                  <p>{t('workspace.riskEyebrow')}</p>
                  <h1>{t('workspace.riskTitle')}</h1>
                  <span>
                    Risk signals are derived from your current Financial Twin — not a credit score or investment recommendation.
                  </span>
                </div>
                <span className={`px-risk-badge ${overallRisk.toLowerCase().replaceAll(' ', '-')}`}>
                  {overallRisk === 'Not enough data' ? t('workspace.needsData') : t('workspace.riskValue', { level: riskText(overallRisk) })}
                </span>
              </header>

              <section className="px-risk-hero">
                <article className="px-resilience-card">
                  <div className="px-risk-card-head">
                    <div>
                      <span>{t('workspace.financialResilience')}</span>
                      <h2>{t('workspace.currentBuffer')}</h2>
                    </div>
                    <button className="px-dots" type="button" aria-label={t('workspace.riskOptions')}>···</button>
                  </div>

                  <div className="px-resilience-body">
                    <div
                      className="px-score-ring"
                      style={{
                        '--risk-score': `${resilienceScore ?? 0}`,
                      } as CSSProperties}
                    >
                      <div>
                        <strong>{resilienceScore ?? '—'}</strong>
                        <span>{resilienceScore === null ? 'Needs data' : '/ 100'}</span>
                      </div>
                    </div>

                    <div className="px-resilience-copy">
                      <span>{t('workspace.currentSignal')}</span>
                      <strong>{riskText(overallRisk)}</strong>
                      <p>
                        {resilienceScore === null
                          ? 'Add more financial data to calculate a resilience signal.'
                          : overallRisk === 'Low'
                            ? 'Your measured buffers are currently stronger across the signals Portelyx can evaluate.'
                            : overallRisk === 'Moderate'
                              ? 'Your twin has some resilience, with specific areas worth stress-testing.'
                              : 'Your current twin has limited room to absorb one or more measured shocks.'}
                      </p>
                    </div>
                  </div>
                </article>

                <article className="px-risk-driver-card">
                  <span>{t('workspace.whatDrivesRisk')}</span>
                  <h2>{t('workspace.fourSignals')}</h2>
                  <div className="px-risk-driver-list">
                    {[
                      [t('workspace.liquidity'), liquidityRisk],
                      [t('workspace.cashFlow'), cashFlowRisk],
                      [t('workspace.debtExposure'), debtRisk],
                      [t('workspace.concentration'), concentrationRisk],
                    ].map(([label, level]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong className={level.toLowerCase().replaceAll(' ', '-')}>{level}</strong>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="px-risk-map">
                <article>
                  <header>
                    <span>{t('workspace.liquidityUpper')}</span>
                    <strong className={liquidityRisk.toLowerCase().replaceAll(' ', '-')}>{riskText(liquidityRisk)}</strong>
                  </header>
                  <h3>{monthlyExpenses > 0 ? t('workspace.monthsValue', { count: expenseCoverage.toFixed(1) }) : '—'}</h3>
                  <p>{t('workspace.liquidityDescription')}</p>
                  <div className="px-risk-scale">
                    <i style={{ width: `${Math.min(100, (expenseCoverage / 6) * 100)}%` }} />
                  </div>
                  <small>{t('workspace.liquidityBenchmark')}</small>
                </article>

                <article>
                  <header>
                    <span>{t('workspace.cashFlowUpper')}</span>
                    <strong className={cashFlowRisk.toLowerCase().replaceAll(' ', '-')}>{riskText(cashFlowRisk)}</strong>
                  </header>
                  <h3>{monthlyIncome > 0 ? `${surplusMargin.toFixed(0)}%` : '—'}</h3>
                  <p>{t('workspace.cashFlowDescription')}</p>
                  <div className="px-risk-scale">
                    <i style={{ width: `${Math.min(100, Math.max(0, surplusMargin * 3))}%` }} />
                  </div>
                  <small>{money(monthlyIncome - monthlyExpenses)} monthly surplus</small>
                </article>

                <article>
                  <header>
                    <span>{t('workspace.debtExposureUpper')}</span>
                    <strong className={debtRisk.toLowerCase().replaceAll(' ', '-')}>{riskText(debtRisk)}</strong>
                  </header>
                  <h3>{totalAssets > 0 ? `${debtToAssets.toFixed(0)}%` : totalDebt > 0 ? '100%+' : '0%'}</h3>
                  <p>{t('workspace.debtExposureDescription')}</p>
                  <div className="px-risk-scale inverse">
                    <i style={{ width: `${Math.min(100, debtToAssets)}%` }} />
                  </div>
                  <small>{money(totalDebt)} total debt</small>
                </article>

                <article>
                  <header>
                    <span>{t('workspace.portfolioConcentration')}</span>
                    <strong className={concentrationRisk.toLowerCase().replaceAll(' ', '-')}>{riskText(concentrationRisk)}</strong>
                  </header>
                  <h3>{portfolioValue > 0 ? `${concentrationPct.toFixed(0)}%` : '—'}</h3>
                  <p>{t('workspace.portfolioConcentrationDescription')}</p>
                  <div className="px-risk-scale inverse">
                    <i style={{ width: `${Math.min(100, concentrationPct)}%` }} />
                  </div>
                  <small>{t('workspace.trackedCount', { count: holdings.length })} holding{holdings.length === 1 ? '' : 's'}</small>
                </article>
              </section>

              <section className="px-risk-bottom">
                <article className="px-goal-risk-card">
                  <div>
                    <span>{t('workspace.goalVulnerability')}</span>
                    <h2>
                      {goals.length === 0
                        ? 'No goals to evaluate yet.'
                        : atRiskGoals.length === 0
                          ? 'Tracked goals are currently funded on pace.'
                          : `${atRiskGoals.length} of ${goals.length} goals may need attention.`}
                    </h2>
                    <p>
                      Portelyx compares the remaining amount, current monthly contribution and time left to the target date.
                    </p>
                  </div>
                  <strong>{goals.length ? `${atRiskGoals.length}/${goals.length}` : '—'}</strong>
                </article>

                <article className="px-stress-card">
                  <span>{t('workspace.stressTest')}</span>
                  <h2>{t('workspace.stressTestTitle')}</h2>
                  <p>
                    Use Scenario Lab to test how income interruptions and other simulated changes affect your financial position.
                  </p>
                  <button type="button" onClick={() => navigate('scenarios')}>
                    {t('workspace.openScenarioLab')} <b>→</b>
                  </button>
                </article>
              </section>
            </>
          )}

          {section === 'decision' && (
            <DecisionTwin profile={profile} money={money} />
          )}

          {section === 'scenarios' && (
            <>
              <header className="px-page-heading px-scenario-heading">
                <div>
                  <p>{t('workspace.scenariosEyebrow')}</p>
                  <h1>{t('workspace.scenarioTitle')}</h1>
                  <span>
                    Change assumptions without changing your base Financial Twin.
                  </span>
                </div>
                <span className="px-scenario-safe">
                  <i />
                  Base twin protected
                </span>
              </header>

              <section className="px-scenario-composer">
                <div className="px-scenario-composer-copy">
                  <span>{t('workspace.askToSimulate')}</span>
                  <h2>{t('workspace.describeChange')}</h2>
                  <p>
                    Natural-language scenarios use the same Financial Twin shown
                    across your workspace.
                  </p>
                </div>

                <form
  className="px-scenario-question"
  onSubmit={(event) => {
    event.preventDefault()
    void askPortelyxAgent()
  }}
>
                  <input
                    value={question}
                    onChange={(event) => onQuestionChange(event.target.value)}
                    placeholder="Try: What happens if my income drops by 20%?"
                  />
                  <button
                    type="submit"
                    disabled={scenarioLoading || !question.trim()}
                  >
                    {scenarioLoading ? t('workspace.running') : t('workspace.run')}
                    <span>→</span>
                  </button>
                </form>
              </section>

              <section className="px-scenario-grid">
                <article className="px-scenario-tool">
                  <header>
                    <div>
                      <span>{t('workspace.incomeInterruption')}</span>
                      <h2>{t('workspace.incomeStops')}</h2>
                    </div>
                    <span className="px-tool-live">{t('workspace.live')}</span>
                  </header>

                  <p>
                    Model a period with no employment income using your current
                    cash and monthly spending.
                  </p>

                  <div className="px-tool-control">
                    <label>
                      <span>{t('workspace.monthsWithoutIncome')}</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={jobLossMonths}
                        placeholder="e.g. 6"
                        onChange={(event) =>
                          onJobLossMonthsChange(event.target.value)
                        }
                      />
                    </label>

                    <button
                      type="button"
                      disabled={
                        scenarioLoading ||
                        !jobLossMonths ||
                        Number(jobLossMonths) < 1
                      }
                      onClick={onRunJobLossScenario}
                    >
                      {scenarioLoading ? t('workspace.simulating') : t('workspace.simulate')}
                      <span>→</span>
                    </button>
                  </div>
                </article>

                <article className="px-scenario-info">
                  <span>{t('workspace.howItWorks')}</span>
                  <h2>{t('workspace.branchNotRewrite')}</h2>
                  <p>
                    Portelyx creates a simulated state from your current twin,
                    applies the scenario, and keeps the original state intact.
                  </p>
                  <div className="px-branch-visual">
                    <div>
                      <strong>{t('workspace.baseTwin')}</strong>
                      <span>{money(netWorth)}</span>
                    </div>
                    <i>→</i>
                    <div>
                      <strong>{t('workspace.scenarioTwin')}</strong>
                      <span>{jobLossScenario ? t('workspace.calculated') : t('workspace.waiting')}</span>
                    </div>
                  </div>
                </article>
              </section>

              {jobLossScenario && (
                <section className="px-scenario-result-card">
                  <header>
                    <div>
                      <span>{t('workspace.scenarioImpact')}</span>
                      <h2>{t('workspace.monthsWithoutIncomeValue', { count: jobLossScenario.months_without_income })}</h2>
                    </div>
                    <span
                      className={`px-result-status ${
                        jobLossScenario.funding_gap > 0 ? 'risk' : 'covered'
                      }`}
                    >
                      {jobLossScenario.funding_gap > 0
                        ? t('workspace.fundingGap')
                        : t('workspace.cashCoversPeriod')}
                    </span>
                  </header>

                  <div className="px-compare-grid">
                    <article>
                      <span>{t('workspace.baseTwin').toUpperCase()}</span>
                      <strong>{money(jobLossScenario.starting_cash)}</strong>
                      <small>{t('workspace.availableCash')}</small>
                    </article>
                    <div className="px-compare-arrow">
                      <span>→</span>
                      <small>
                        {money(
                          jobLossScenario.cash_after_period -
                            jobLossScenario.starting_cash,
                        )}
                      </small>
                    </div>
                    <article className="simulated">
                      <span>{t('workspace.scenarioTwin').toUpperCase()}</span>
                      <strong>{money(jobLossScenario.cash_after_period)}</strong>
                      <small>{t('workspace.cashAfterPeriod')}</small>
                    </article>
                  </div>

                  <div className="px-impact-bars">
                    <div>
                      <span>{t('workspace.expensesDuringPeriod')}</span>
                      <strong>{money(jobLossScenario.expenses_during_period)}</strong>
                      <div className="px-impact-track">
                        <i
                          style={{
                            width: `${
                              jobLossScenario.expenses_during_period > 0
                                ? 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <span>{t('workspace.lostIncome')}</span>
                      <strong>{money(jobLossScenario.lost_income)}</strong>
                      <div className="px-impact-track neutral">
                        <i
                          style={{
                            width: `${
                              jobLossScenario.lost_income > 0 ? 100 : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <span>{t('workspace.fundingGap')}</span>
                      <strong>{money(jobLossScenario.funding_gap)}</strong>
                      <div className="px-impact-track risk">
                        <i
                          style={{
                            width: `${
                              jobLossScenario.funding_gap > 0
                                ? Math.min(
                                    100,
                                    Math.max(
                                      12,
                                      (jobLossScenario.funding_gap /
                                        Math.max(
                                          jobLossScenario.expenses_during_period,
                                          1,
                                        )) *
                                        100,
                                    ),
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <footer className="px-scenario-result-footer">
                    <div>
                      <span>{t('workspace.cashCoverage')}</span>
                      <strong>
                        {t('workspace.monthsValue', { count: jobLossScenario.months_cash_can_cover.toFixed(1) })}
                      </strong>
                    </div>
                    <div>
                      <span>{t('workspace.scenarioDuration')}</span>
                      <strong>
                        {jobLossScenario.months_without_income} months
                      </strong>
                    </div>
                    <div>
                      <span>{t('workspace.baseTwin')}</span>
                      <strong>{t('workspace.unchanged')}</strong>
                    </div>
                  </footer>
                </section>
              )}
            </>
          )}
        </section>

        <button
          className={`px-ai-tab ${aiOpen ? 'hidden' : ''}`}
          type="button"
          onClick={() => setAiOpen(true)}
          aria-label={t('workspace.askPortelyxAI')}
        >
          <span>P</span>
          <strong>{t('workspace.askPortelyxAI')}</strong>
        </button>

        <aside className={`px-ai-drawer ${aiOpen ? 'open' : ''}`}>
          <div className="px-ai-content">
            <header>
              <div className="px-ai-mark">P</div>
              <div>
                <strong>{t('workspace.portelyxAI')}</strong>
                <span>{t('workspace.aiCompanion')}</span>
              </div>
              <button
                type="button"
                aria-label={t('workspace.closePortelyxAI')}
                onClick={() => setAiOpen(false)}
              >
                ×
              </button>
            </header>

            <div className="px-ai-prompt">
              <span>{t('workspace.askAboutTwin')}</span>
              <p>
                Explore a change, investigate risk, or ask what is driving
                your financial position.
              </p>
            </div>

            {aiMessages.length > 0 && (
              <div className="px-ai-conversation" aria-live="polite">
                {aiMessages.map((message, index) => (
                  <div
                    className={`px-ai-result ${message.role === 'user' ? 'px-ai-user-message' : ''}`}
                    key={`${message.role}-${index}`}
                  >
                    <span>{message.role === 'user' ? t('workspace.you') : t('workspace.portelyxAI')}</span>
                    <p>{message.content}</p>
                  </div>
                ))}
              </div>
            )}

            <form
              className="px-ai-form"
              onSubmit={(event) => {
                event.preventDefault()
                void askPortelyxChat()
              }}
            >
              <textarea
                value={aiInput}
                onChange={(event) => setAiInput(event.target.value)}
                placeholder="Ask about a decision, your twin, or where to go next…"
                rows={4}
              />
              <button
                type="submit"
                disabled={aiChatLoading || !aiInput.trim()}
              >
                {aiChatLoading ? t('workspace.thinking') : t('workspace.ask')}
                <span>→</span>
              </button>
            </form>

            {aiChatLoading && (
              <div className="px-ai-result">
                <span>{t('workspace.portelyxAI')}</span>
                <strong>{t('workspace.aiWorking')}</strong>
              </div>
            )}

            {aiChatError && (
              <div className="px-ai-result px-ai-result-error">
                <span>{t('workspace.portelyxAI')}</span>
                <strong>{t('workspace.aiUnable')}</strong>
                <p>{aiChatError}</p>
              </div>
            )}

            {aiEngineResults && (
              <div className="px-ai-tools">
                <span>{t('workspace.deterministicEngine')}</span>
                <div>
                  <b>{t('workspace.decisionTwinVerified')}</b>
                </div>
              </div>
            )}

            <small className="px-ai-note">
              Simulations do not change your base Financial Twin.
            </small>
          </div>
        </aside>
      </div>

      {menuOpen && <button className="px-scrim" type="button" aria-label={t('workspace.closeNavigation')} onClick={() => setMenuOpen(false)} />}
    </main>
  )
}
