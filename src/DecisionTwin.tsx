import { useMemo, useState } from 'react'
import { apiUrl } from './api'
import { usePortelyxLanguage } from './i18n'
import './DecisionTwin.css'

type FinancialProfile = {
  profile_id: string
  profile_type?: string
  base_currency: string
  income: { monthly: number }
  expenses: { monthly: number }
  cash: { available: number }
  assets: { total: number }
  debts: { total: number }
  holdings: unknown[]
  goals: unknown[]
  data_sources?: unknown[]
}

type DecisionKind = 'buy_now' | 'wait' | 'save_then_buy' | 'finance'
type DecisionOption = { option_id: string; label: string; kind: DecisionKind; purchase_price: number; purchase_month: number; deposit: number; finance_months: number; annual_interest_percent: number }
type ForkProjection = { option_id: string; label: string; kind: DecisionKind; currency: string; purchase_price: number; purchase_month: number; starting_cash: number; monthly_income: number; monthly_expenses: number; monthly_surplus: number; ending_cash: number; lowest_cash: number; purchase_funded: boolean; cash_shortfall: number; finance: null | { deposit: number; principal: number; months: number; annual_interest_percent: number; monthly_payment: number; total_decision_cost: number } }
type ForkResponse = { profile_id: string; currency: string; horizon_months: number; options: ForkProjection[]; cash_preservation_ranking: string[]; note: string }
type ResilienceResult = { option_id: string; label: string; currency: string; base_projection: ForkProjection; stress_scenarios: Array<{ scenario_id: string; label: string; passed: boolean; lowest_cash: number; ending_cash?: number }>; resilience: { score: number; survival_points: number; liquidity_points: number; passed_scenarios: number; failed_scenarios: number; total_scenarios: number; survival_rate_percent: number; average_buffer_preservation_percent: number; weakest_scenario_id: string; weakest_scenario_label: string; weakest_lowest_cash: number; method: string }; assumption_note: string }
type ResilienceResponse = { profile_id: string; currency: string; horizon_months: number; options: ResilienceResult[]; resilience_ranking: string[]; recommended_by_resilience: string }
type Boundary = { status: string; largest_survived?: number; first_failed?: number; survived_boundary_lowest_cash?: number; failed_boundary_lowest_cash?: number }
type BreakpointResponse = { breakpoints: { emergency_expense?: Boundary; income_reduction?: Boundary; expense_increase?: Boundary; [key: string]: Boundary | undefined } }
type PathItem = { rank: number; kind: string; action: string; verified_score: number; relative_change_score: number }
type PathToYesResponse = { baseline_resilience_score: number; target_resilience_score: number; already_at_target: boolean; recommended_path: unknown; paths: PathItem[] }
type Props = { profile: FinancialProfile; money: (value: number, currency?: string) => string }

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(apiUrl(path), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = payload && typeof payload === 'object' && 'detail' in payload ? JSON.stringify((payload as { detail: unknown }).detail) : `Request failed (${response.status})`
    throw new Error(detail)
  }
  return payload as T
}

export default function DecisionTwin({ profile, money }: Props) {
  const { t } = usePortelyxLanguage()
  const [question, setQuestion] = useState(() => t('decisionTwin.defaultQuestion'))
  const [purchasePrice, setPurchasePrice] = useState('15000')
  const [horizonMonths, setHorizonMonths] = useState('12')
  const [waitMonths, setWaitMonths] = useState('3')
  const [financeMonths, setFinanceMonths] = useState('6')
  const [deposit, setDeposit] = useState('3000')
  const [interestRate, setInterestRate] = useState('12')
  const [targetScore, setTargetScore] = useState('90')
  const [forks, setForks] = useState<ForkResponse | null>(null)
  const [resilience, setResilience] = useState<ResilienceResponse | null>(null)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [breakpoints, setBreakpoints] = useState<BreakpointResponse | null>(null)
  const [pathToYes, setPathToYes] = useState<PathToYesResponse | null>(null)
  const [savedDecisionId, setSavedDecisionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deepDiveLoading, setDeepDiveLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const price = Number(purchasePrice), horizon = Number(horizonMonths), wait = Number(waitMonths), financeTerm = Number(financeMonths), financeDeposit = Number(deposit), apr = Number(interestRate), target = Number(targetScore)
  const options = useMemo<DecisionOption[]>(() => {
    const p = Number.isFinite(price) && price >= 0 ? price : 0
    const w = Number.isInteger(wait) && wait >= 1 ? wait : 3
    const term = Number.isInteger(financeTerm) && financeTerm >= 1 ? financeTerm : 6
    const dep = Number.isFinite(financeDeposit) ? Math.min(Math.max(0, financeDeposit), p) : 0
    const rate = Number.isFinite(apr) && apr >= 0 ? apr : 0
    return [
      { option_id: 'buy-now', label: t('decisionTwin.buyNow'), kind: 'buy_now', purchase_price: p, purchase_month: 0, deposit: 0, finance_months: 0, annual_interest_percent: 0 },
      { option_id: `wait-${w}`, label: t('decisionTwin.waitMonthsLabel', { count: w }), kind: 'wait', purchase_price: p, purchase_month: w, deposit: 0, finance_months: 0, annual_interest_percent: 0 },
      { option_id: `finance-${term}`, label: t('decisionTwin.financeMonthsLabel', { count: term }), kind: 'finance', purchase_price: p, purchase_month: 0, deposit: dep, finance_months: term, annual_interest_percent: rate },
    ]
  }, [price, wait, financeTerm, financeDeposit, apr, t])

  const selectedOption = options.find((o) => o.option_id === selectedOptionId) ?? null
  const selectedResilience = resilience?.options.find((o) => o.option_id === selectedOptionId) ?? null
  const recommendedId = resilience?.recommended_by_resilience ?? null

  const validate = () => {
    if (!question.trim()) return t('decisionTwin.errorDescribeDecision')
    if (!Number.isFinite(price) || price <= 0) return t('decisionTwin.errorPurchasePrice')
    if (!Number.isInteger(horizon) || horizon < 1) return t('decisionTwin.errorHorizon')
    if (!Number.isInteger(wait) || wait < 1) return t('decisionTwin.errorWait')
    if (!Number.isInteger(financeTerm) || financeTerm < 1) return t('decisionTwin.errorFinanceTerm')
    if (!Number.isFinite(financeDeposit) || financeDeposit < 0 || financeDeposit > price) return t('decisionTwin.depositError')
    if (!Number.isFinite(apr) || apr < 0) return t('decisionTwin.errorInterestRate')
    if (!Number.isFinite(target) || target < 0 || target > 100) return t('decisionTwin.targetError')
    return null
  }

  const runDecisionTwin = async () => {
    const problem = validate(); if (problem) { setError(problem); return }
    setLoading(true); setError(null); setForks(null); setResilience(null); setBreakpoints(null); setPathToYes(null); setSavedDecisionId(null)
    try {
      const body = { financial_profile: profile, options, horizon_months: horizon }
      const [f, r] = await Promise.all([postJson<ForkResponse>('/decision-twin/forks', body), postJson<ResilienceResponse>('/decision-twin/resilience', body)])
      setForks(f); setResilience(r); setSelectedOptionId(r.recommended_by_resilience || r.resilience_ranking?.[0] || options[0].option_id)
    } catch (e) { setError(e instanceof Error ? e.message : t('decisionTwin.errorRun')) } finally { setLoading(false) }
  }

  const inspectOption = async (optionId: string) => {
    const option = options.find((o) => o.option_id === optionId); if (!option) return
    setSelectedOptionId(optionId); setDeepDiveLoading(true); setError(null); setBreakpoints(null); setPathToYes(null)
    try {
      const [b, p] = await Promise.all([
        postJson<BreakpointResponse>('/decision-twin/breakpoints', { financial_profile: profile, option, horizon_months: horizon }),
        postJson<PathToYesResponse>('/decision-twin/path-to-yes', { financial_profile: profile, option, horizon_months: horizon, target_resilience_score: target }),
      ])
      setBreakpoints(b); setPathToYes(p)
    } catch (e) { setError(e instanceof Error ? e.message : t('decisionTwin.errorInspect')) } finally { setDeepDiveLoading(false) }
  }

  const rememberDecision = async () => {
    if (!selectedOption) return
    setSaving(true); setError(null)
    try {
      const id = `decision-${Date.now()}`
      await postJson('/decision-twin/memory', { financial_profile: profile, options, horizon_months: horizon, decision_id: id, question: question.trim(), chosen_option_id: selectedOption.option_id, reason: selectedResilience ? `Chosen after PORTELYX resilience comparison. Score: ${selectedResilience.resilience.score}/100.` : 'Chosen after PORTELYX decision comparison.' })
      setSavedDecisionId(id)
    } catch (e) { setError(e instanceof Error ? e.message : t('decisionTwin.errorRemember')) } finally { setSaving(false) }
  }

  const boundary = (label: string, b?: Boundary) => !b ? null : <article><span>{label}</span><strong>{b.status === 'survives_full_search_range' ? t('decisionTwin.survivesSearchRange') : `${b.largest_survived ?? '—'} → ${b.first_failed ?? '—'}`}</strong><small>{b.status === 'survives_full_search_range' ? t('decisionTwin.noFailureBoundary') : t('decisionTwin.survivedToFailed')}</small></article>

  return <div className="dt-shell">
    <header className="px-page-heading dt-heading"><div><p>{t('decisionTwin.eyebrow')}</p><h1>{t('decisionTwin.title')}</h1><span>{t('decisionTwin.description')}</span></div><span className="dt-principle">{t('decisionTwin.principle')}</span></header>
    <section className="dt-composer"><div className="dt-composer-copy"><span>{t('decisionTwin.ask')}</span><h2>{t('decisionTwin.questionTitle')}</h2><p>{t('decisionTwin.engineNote')}</p></div><div className="dt-form">
      <label className="dt-wide"><span>{t('decisionTwin.decision')}</span><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={t('decisionTwin.decisionPlaceholder')} /></label>
      <label><span>{t('decisionTwin.purchasePrice', { currency: profile.base_currency })}</span><input type="number" min="0" step="100" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} /></label>
      <label><span>{t('decisionTwin.decisionHorizon')}</span><input type="number" min="1" step="1" value={horizonMonths} onChange={(e) => setHorizonMonths(e.target.value)} /></label>
      <label><span>{t('decisionTwin.waitAlternative')}</span><input type="number" min="1" step="1" value={waitMonths} onChange={(e) => setWaitMonths(e.target.value)} /></label>
      <label><span>{t('decisionTwin.financeTerm')}</span><input type="number" min="1" step="1" value={financeMonths} onChange={(e) => setFinanceMonths(e.target.value)} /></label>
      <label><span>{t('decisionTwin.financeDeposit', { currency: profile.base_currency })}</span><input type="number" min="0" step="100" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></label>
      <label><span>{t('decisionTwin.annualInterest')}</span><input type="number" min="0" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} /></label>
      <label><span>{t('decisionTwin.pathToYesTarget')}</span><input type="number" min="0" max="100" step="1" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} /></label>
      <button className="dt-run" type="button" onClick={() => void runDecisionTwin()} disabled={loading}>{loading ? t('decisionTwin.rehearsing') : t('decisionTwin.forkDecision')}<b>→</b></button>
    </div></section>
    {error && <section className="dt-error"><strong>{t('decisionTwin.couldNotComplete')}</strong><span>{error}</span></section>}
    {!forks || !resilience ? <section className="dt-empty"><div className="dt-loop">{[t('decisionTwin.loopAsk'),t('decisionTwin.loopFork'),t('decisionTwin.loopStress'),t('decisionTwin.loopScore'),t('decisionTwin.loopBreakpoint'),t('decisionTwin.loopPathToYes'),t('decisionTwin.loopDecide')].map((s,i)=><div key={`${i}-${s}`}><b>{String(i+1).padStart(2,'0')}</b><span>{s}</span></div>)}</div><p>{t('decisionTwin.deterministicNote')}</p></section> : <>
      <section className="dt-section-head"><div><span>{t('decisionTwin.forkStressScore')}</span><h2>{t('decisionTwin.threeFutures')}</h2></div><p>{t('decisionTwin.recommendedByResilience')} <strong>{resilience.options.find((o)=>o.option_id===recommendedId)?.label ?? recommendedId}</strong></p></section>
      <section className="dt-forks">{resilience.options.map((item)=>{const projection=forks.options.find((f)=>f.option_id===item.option_id)??item.base_projection; const active=selectedOptionId===item.option_id; return <article className={`dt-fork-card ${active?'active':''}`} key={item.option_id}><header><div><span>{projection.kind.replaceAll('_',' ').toUpperCase()}</span><h3>{item.label}</h3></div>{recommendedId===item.option_id&&<b className="dt-recommended">{t('decisionTwin.mostResilient')}</b>}</header><div className="dt-score-row"><div className="dt-score"><strong>{item.resilience.score}</strong><span>/100</span></div><div><span>{t('decisionTwin.decisionResilience')}</span><strong>{t('decisionTwin.stressTestsSurvived', { passed: item.resilience.passed_scenarios, total: item.resilience.total_scenarios })}</strong></div></div><div className="dt-card-metrics"><div><span>{t('decisionTwin.endingCash')}</span><strong>{money(projection.ending_cash)}</strong></div><div><span>{t('decisionTwin.lowestCash')}</span><strong>{money(projection.lowest_cash)}</strong></div><div><span>{t('decisionTwin.weakestStress')}</span><strong>{item.resilience.weakest_scenario_label}</strong></div><div><span>{t('decisionTwin.purchaseFunded')}</span><strong>{projection.purchase_funded ? t('decisionTwin.yes') : t('decisionTwin.no')}</strong></div></div>{projection.finance&&<div className="dt-finance-note"><span>{t('decisionTwin.financePayment')}</span><strong>{money(projection.finance.monthly_payment)}{t('decisionTwin.perMonth')}</strong><small>{t('decisionTwin.totalDecisionCost')} {money(projection.finance.total_decision_cost)}</small></div>}<button type="button" onClick={()=>void inspectOption(item.option_id)} disabled={deepDiveLoading&&active}>{deepDiveLoading && active ? t('decisionTwin.findingBoundaries') : t('decisionTwin.inspectFuture')}<b>→</b></button></article>})}</section>
      <p className="dt-method">{t('decisionTwin.scoreMethod')}</p>
      {selectedOption&&<section className="dt-deep-dive"><header><div><span>{t('decisionTwin.breakpointPathToYes')}</span><h2>{selectedOption.label}</h2></div>{selectedResilience&&<div className="dt-selected-score"><span>{t('decisionTwin.currentResilience')}</span><strong>{selectedResilience.resilience.score}/100</strong></div>}</header>{deepDiveLoading?<div className="dt-loading">{t('decisionTwin.searchingBoundary')}</div>:breakpoints&&pathToYes?<><div className="dt-breakpoint-grid">{boundary(t('decisionTwin.emergencyExpense', { currency: profile.base_currency }),breakpoints.breakpoints.emergency_expense)}{boundary(t('decisionTwin.incomeReduction'),breakpoints.breakpoints.income_reduction)}{boundary(t('decisionTwin.expenseIncrease'),breakpoints.breakpoints.expense_increase)}</div><div className="dt-path-panel"><header><div><span>{t('decisionTwin.pathToYes')}</span><h3>{pathToYes.already_at_target ? t('decisionTwin.alreadyReaches', { score: pathToYes.target_resilience_score }) : t('decisionTwin.whatGetsTo', { score: pathToYes.target_resilience_score })}</h3></div><strong>{pathToYes.baseline_resilience_score} → {pathToYes.target_resilience_score}</strong></header>{pathToYes.paths.length===0?<p className="dt-no-path">{t('decisionTwin.noPath')}</p>:<div className="dt-path-list">{pathToYes.paths.slice(0,5).map((p)=><article key={`${p.rank}-${p.kind}`}><b>#{p.rank}</b><div><strong>{p.action}</strong><span>{p.kind.replaceAll('_',' ')}</span></div><em>{p.verified_score}/100</em></article>)}</div>}</div><div className="dt-decide"><div><span>{t('decisionTwin.decide')}</span><h3>{t('decisionTwin.chooseAndRemember')}</h3><p>{t('decisionTwin.decisionMemoryDescription')}</p></div><button type="button" onClick={()=>void rememberDecision()} disabled={saving}>{saving ? t('decisionTwin.remembering') : t('decisionTwin.chooseOption', { option: selectedOption.label })}</button></div>{savedDecisionId&&<div className="dt-saved"><span>✓</span><div><strong>{t('decisionTwin.remembered')}</strong><p>{t('decisionTwin.rememberedDescription')}</p><small>{savedDecisionId}</small></div></div>}</>:<div className="dt-select-note">{t('decisionTwin.inspectPrompt')}</div>}</section>}
    </>}
    <footer className="dt-footer"><strong>{t('decisionTwin.footerTitle')}</strong><span>{t('decisionTwin.footerNote')}</span></footer>
  </div>
}
