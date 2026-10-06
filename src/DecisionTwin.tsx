import { useMemo, useState } from 'react'
import { apiUrl } from './api'
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
type ActualMonth = { month: number; income: number; expenses: number; closing_cash: number }
type RealityCheckResponse = { decision_id: string; chosen_option_id: string; currency: string; summary: { months_observed: number; mean_monthly_income_delta: number; mean_monthly_expense_delta: number; mean_absolute_cash_error: number; final_cash_error: number; final_cash_direction: string }; learning_signal: { income_bias: number; expense_bias: number; cash_error: number; note: string } }
type RegretReplayResponse = { decision_id: string; currency: string; chosen_option: { option_id: string; label: string; ending_cash_under_observed_conditions: number; lowest_cash_under_observed_conditions: number; cash_survives_observed_period: boolean }; rejected_replays: Array<{ option_id: string; label: string; ending_cash: number; lowest_cash: number; cash_survives_observed_period: boolean; cash_difference_vs_chosen_reality: number }>; best_cash_outcome_among_rejected: string | null; interpretation_note: string }
type CalibrationResponse = { profile_id: string; status: string; observations: { months_observed: number; average_income: number; average_expenses: number }; baseline: { monthly_income: number; monthly_expenses: number }; evidence: { income_gap: number; income_gap_percent: number; expense_gap: number; expense_gap_percent: number; evidence_maturity: number; evidence_maturity_note: string }; proposal: { monthly_income_adjustment: number; monthly_expense_adjustment: number; proposed_monthly_income: number; proposed_monthly_expenses: number }; requires_user_approval: boolean; note: string }
type ApplyCalibrationResponse = { financial_profile: FinancialProfile; audit: { approved: boolean; before: { monthly_income: number; monthly_expenses: number }; after: { monthly_income: number; monthly_expenses: number }; change: { monthly_income: number; monthly_expenses: number }; note: string } }
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
  const [question, setQuestion] = useState('Can I afford this purchase?')
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
  const [actualMonths, setActualMonths] = useState<ActualMonth[]>([])
  const [realityCheck, setRealityCheck] = useState<RealityCheckResponse | null>(null)
  const [regretReplay, setRegretReplay] = useState<RegretReplayResponse | null>(null)
  const [calibration, setCalibration] = useState<CalibrationResponse | null>(null)
  const [appliedCalibration, setAppliedCalibration] = useState<ApplyCalibrationResponse | null>(null)
  const [learningLoading, setLearningLoading] = useState(false)
  const [applyLoading, setApplyLoading] = useState(false)
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
      { option_id: 'buy-now', label: 'Buy now', kind: 'buy_now', purchase_price: p, purchase_month: 0, deposit: 0, finance_months: 0, annual_interest_percent: 0 },
      { option_id: `wait-${w}`, label: `Wait ${w} month${w === 1 ? '' : 's'}`, kind: 'wait', purchase_price: p, purchase_month: w, deposit: 0, finance_months: 0, annual_interest_percent: 0 },
      { option_id: `finance-${term}`, label: `Finance over ${term} months`, kind: 'finance', purchase_price: p, purchase_month: 0, deposit: dep, finance_months: term, annual_interest_percent: rate },
    ]
  }, [price, wait, financeTerm, financeDeposit, apr])

  const selectedOption = options.find((o) => o.option_id === selectedOptionId) ?? null
  const selectedResilience = resilience?.options.find((o) => o.option_id === selectedOptionId) ?? null
  const recommendedId = resilience?.recommended_by_resilience ?? null

  const validate = () => {
    if (!question.trim()) return 'Describe the decision you want PORTELYX to remember.'
    if (!Number.isFinite(price) || price <= 0) return 'Enter a purchase price above zero.'
    if (!Number.isInteger(horizon) || horizon < 1) return 'Horizon must be at least 1 month.'
    if (!Number.isInteger(wait) || wait < 1) return 'Wait period must be at least 1 month.'
    if (!Number.isInteger(financeTerm) || financeTerm < 1) return 'Finance term must be at least 1 month.'
    if (!Number.isFinite(financeDeposit) || financeDeposit < 0 || financeDeposit > price) return 'Deposit must be between zero and the purchase price.'
    if (!Number.isFinite(apr) || apr < 0) return 'Interest rate cannot be negative.'
    if (!Number.isFinite(target) || target < 0 || target > 100) return 'Target resilience must be between 0 and 100.'
    return null
  }

  const runDecisionTwin = async () => {
    const problem = validate(); if (problem) { setError(problem); return }
    setLoading(true); setError(null); setForks(null); setResilience(null); setBreakpoints(null); setPathToYes(null); setSavedDecisionId(null)
    try {
      const body = { financial_profile: profile, options, horizon_months: horizon }
      const [f, r] = await Promise.all([postJson<ForkResponse>('/decision-twin/forks', body), postJson<ResilienceResponse>('/decision-twin/resilience', body)])
      setForks(f); setResilience(r); setSelectedOptionId(r.recommended_by_resilience || r.resilience_ranking?.[0] || options[0].option_id)
    } catch (e) { setError(e instanceof Error ? e.message : 'PORTELYX could not run this decision.') } finally { setLoading(false) }
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
    } catch (e) { setError(e instanceof Error ? e.message : 'PORTELYX could not inspect this decision.') } finally { setDeepDiveLoading(false) }
  }

  const rememberDecision = async () => {
    if (!selectedOption) return
    setSaving(true); setError(null)
    try {
      const id = `decision-${Date.now()}`
      await postJson('/decision-twin/memory', { financial_profile: profile, options, horizon_months: horizon, decision_id: id, question: question.trim(), chosen_option_id: selectedOption.option_id, reason: selectedResilience ? `Chosen after PORTELYX resilience comparison. Score: ${selectedResilience.resilience.score}/100.` : 'Chosen after PORTELYX decision comparison.' })
      setSavedDecisionId(id)
      setActualMonths([
        { month: 1, income: profile.income.monthly, expenses: profile.expenses.monthly, closing_cash: profile.cash.available },
        { month: 2, income: profile.income.monthly, expenses: profile.expenses.monthly, closing_cash: profile.cash.available },
        { month: 3, income: profile.income.monthly, expenses: profile.expenses.monthly, closing_cash: profile.cash.available },
      ])
      setRealityCheck(null); setRegretReplay(null); setCalibration(null); setAppliedCalibration(null)
    } catch (e) { setError(e instanceof Error ? e.message : 'PORTELYX could not remember this decision.') } finally { setSaving(false) }
  }

  const updateActual = (index: number, field: 'income' | 'expenses' | 'closing_cash', raw: string) => {
    const value = Number(raw)
    setActualMonths((rows) => rows.map((row, i) => i === index ? { ...row, [field]: Number.isFinite(value) ? value : 0 } : row))
    setRealityCheck(null); setRegretReplay(null); setCalibration(null); setAppliedCalibration(null)
  }

  const addActualMonth = () => setActualMonths((rows) => [...rows, { month: rows.length + 1, income: profile.income.monthly, expenses: profile.expenses.monthly, closing_cash: rows.length ? rows[rows.length - 1].closing_cash : profile.cash.available }])

  const runLearningLoop = async () => {
    if (!savedDecisionId || actualMonths.length === 0) return
    setLearningLoading(true); setError(null); setAppliedCalibration(null)
    try {
      const observed = { decision_id: savedDecisionId, actual_months: actualMonths }
      const [reality, replay, proposal] = await Promise.all([
        postJson<RealityCheckResponse>('/decision-twin/reality-check', observed),
        postJson<RegretReplayResponse>('/decision-twin/regret-replay', observed),
        postJson<CalibrationResponse>('/decision-twin/adaptive/propose', { financial_profile: profile, actual_months: actualMonths, policy: { min_observed_months: 3, max_income_adjustment_percent: 20, max_expense_adjustment_percent: 20, learning_rate: 0.5, materiality_percent: 2 } }),
      ])
      setRealityCheck(reality); setRegretReplay(replay); setCalibration(proposal)
    } catch (e) { setError(e instanceof Error ? e.message : 'PORTELYX could not complete the learning loop.') }
    finally { setLearningLoading(false) }
  }

  const applyAdaptiveCalibration = async () => {
    if (!calibration || calibration.status !== 'ready_for_review') return
    setApplyLoading(true); setError(null)
    try {
      const result = await postJson<ApplyCalibrationResponse>('/decision-twin/adaptive/apply', { financial_profile: profile, calibration, approved: true })
      setAppliedCalibration(result)
    } catch (e) { setError(e instanceof Error ? e.message : 'PORTELYX could not apply the approved calibration.') }
    finally { setApplyLoading(false) }
  }

  const boundary = (label: string, b?: Boundary) => !b ? null : <article><span>{label}</span><strong>{b.status === 'survives_full_search_range' ? 'Survives search range' : `${b.largest_survived ?? '—'} → ${b.first_failed ?? '—'}`}</strong><small>{b.status === 'survives_full_search_range' ? 'No failure boundary found in the configured range.' : 'Largest survived → first failed'}</small></article>

  return <div className="dt-shell">
    <header className="px-page-heading dt-heading"><div><p>DECISION TWIN</p><h1>Rehearse the decision before you live it.</h1><span>Fork one choice into alternate futures, stress-test each path and find what would have to change before the answer changes.</span></div><span className="dt-principle">AI understands. PORTELYX calculates.</span></header>
    <section className="dt-composer"><div className="dt-composer-copy"><span>ASK</span><h2>What decision are you considering?</h2><p>The calculations below come from PORTELYX's deterministic Decision Twin engines.</p></div><div className="dt-form">
      <label className="dt-wide"><span>Decision</span><input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Can I afford a R15,000 laptop?" /></label>
      <label><span>Purchase price · {profile.base_currency}</span><input type="number" min="0" step="100" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} /></label>
      <label><span>Decision horizon · months</span><input type="number" min="1" step="1" value={horizonMonths} onChange={(e) => setHorizonMonths(e.target.value)} /></label>
      <label><span>Wait alternative · months</span><input type="number" min="1" step="1" value={waitMonths} onChange={(e) => setWaitMonths(e.target.value)} /></label>
      <label><span>Finance term · months</span><input type="number" min="1" step="1" value={financeMonths} onChange={(e) => setFinanceMonths(e.target.value)} /></label>
      <label><span>Finance deposit · {profile.base_currency}</span><input type="number" min="0" step="100" value={deposit} onChange={(e) => setDeposit(e.target.value)} /></label>
      <label><span>Annual interest · %</span><input type="number" min="0" step="0.1" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} /></label>
      <label><span>Path to Yes target · /100</span><input type="number" min="0" max="100" step="1" value={targetScore} onChange={(e) => setTargetScore(e.target.value)} /></label>
      <button className="dt-run" type="button" onClick={() => void runDecisionTwin()} disabled={loading}>{loading ? 'Rehearsing futures…' : 'Fork this decision'}<b>→</b></button>
    </div></section>
    {error && <section className="dt-error"><strong>Decision Twin could not complete this step.</strong><span>{error}</span></section>}
    {!forks || !resilience ? <section className="dt-empty"><div className="dt-loop">{['ASK','FORK','STRESS','SCORE','BREAKPOINT','PATH TO YES','DECIDE'].map((s,i)=><div key={s}><b>{String(i+1).padStart(2,'0')}</b><span>{s}</span></div>)}</div><p>Nothing here is a forecast or probability. PORTELYX compares deterministic futures using the Financial Twin currently loaded in this workspace.</p></section> : <>
      <section className="dt-section-head"><div><span>FORK + STRESS + SCORE</span><h2>Three futures. One decision.</h2></div><p>Recommended by resilience: <strong>{resilience.options.find((o)=>o.option_id===recommendedId)?.label ?? recommendedId}</strong></p></section>
      <section className="dt-forks">{resilience.options.map((item)=>{const projection=forks.options.find((f)=>f.option_id===item.option_id)??item.base_projection; const active=selectedOptionId===item.option_id; return <article className={`dt-fork-card ${active?'active':''}`} key={item.option_id}><header><div><span>{projection.kind.replaceAll('_',' ').toUpperCase()}</span><h3>{item.label}</h3></div>{recommendedId===item.option_id&&<b className="dt-recommended">Most resilient</b>}</header><div className="dt-score-row"><div className="dt-score"><strong>{item.resilience.score}</strong><span>/100</span></div><div><span>DECISION RESILIENCE</span><strong>{item.resilience.passed_scenarios}/{item.resilience.total_scenarios} stress tests survived</strong></div></div><div className="dt-card-metrics"><div><span>Ending cash</span><strong>{money(projection.ending_cash)}</strong></div><div><span>Lowest cash</span><strong>{money(projection.lowest_cash)}</strong></div><div><span>Weakest stress</span><strong>{item.resilience.weakest_scenario_label}</strong></div><div><span>Purchase funded</span><strong>{projection.purchase_funded?'Yes':'No'}</strong></div></div>{projection.finance&&<div className="dt-finance-note"><span>Finance payment</span><strong>{money(projection.finance.monthly_payment)}/mo</strong><small>Total decision cost {money(projection.finance.total_decision_cost)}</small></div>}<button type="button" onClick={()=>void inspectOption(item.option_id)} disabled={deepDiveLoading&&active}>{deepDiveLoading&&active?'Finding boundaries…':'Inspect this future'}<b>→</b></button></article>})}</section>
      <p className="dt-method">Score method: 60% scenario survival + 40% liquidity-buffer preservation. It is a product resilience signal, not a probability or credit score.</p>
      {selectedOption&&<section className="dt-deep-dive"><header><div><span>BREAKPOINT + PATH TO YES</span><h2>{selectedOption.label}</h2></div>{selectedResilience&&<div className="dt-selected-score"><span>Current resilience</span><strong>{selectedResilience.resilience.score}/100</strong></div>}</header>{deepDiveLoading?<div className="dt-loading">Searching the decision boundary…</div>:breakpoints&&pathToYes?<><div className="dt-breakpoint-grid">{boundary(`Emergency expense · ${profile.base_currency}`,breakpoints.breakpoints.emergency_expense)}{boundary('Income reduction · %',breakpoints.breakpoints.income_reduction)}{boundary('Expense increase · %',breakpoints.breakpoints.expense_increase)}</div><div className="dt-path-panel"><header><div><span>PATH TO YES</span><h3>{pathToYes.already_at_target?`This path already reaches ${pathToYes.target_resilience_score}/100.`:`What gets this path to ${pathToYes.target_resilience_score}/100?`}</h3></div><strong>{pathToYes.baseline_resilience_score} → {pathToYes.target_resilience_score}</strong></header>{pathToYes.paths.length===0?<p className="dt-no-path">No additional change is required, or no verified path was found in the engine's configured search space.</p>:<div className="dt-path-list">{pathToYes.paths.slice(0,5).map((p)=><article key={`${p.rank}-${p.kind}`}><b>#{p.rank}</b><div><strong>{p.action}</strong><span>{p.kind.replaceAll('_',' ')}</span></div><em>{p.verified_score}/100</em></article>)}</div>}</div><div className="dt-decide"><div><span>DECIDE</span><h3>Choose this future and let PORTELYX remember it.</h3><p>Saving creates Decision Memory so Reality Check and Regret Replay can compare the decision with what actually happens later.</p></div><button type="button" onClick={()=>void rememberDecision()} disabled={saving}>{saving?'Remembering…':`Choose ${selectedOption.label}`}</button></div>{savedDecisionId&&<div className="dt-saved"><span>✓</span><div><strong>Decision remembered.</strong><p>PORTELYX can use this record later for Reality Check, Regret Replay and Adaptive Twin learning.</p><small>{savedDecisionId}</small></div></div>}</>:<div className="dt-select-note">Select “Inspect this future” to calculate its real breakpoints and Path to Yes.</div>}</section>}
    </>}
    {savedDecisionId&&<section className="dt-learning">
      <header className="dt-learning-head"><div><span>LIVE → OBSERVE → REFLECT → REPLAY → LEARN</span><h2>Reality Check</h2><p>Enter what actually happened after the decision. These are observed values, not generated assumptions.</p></div><b>{actualMonths.length} observed month{actualMonths.length===1?'':'s'}</b></header>
      <div className="dt-observed-table"><div className="dt-observed-row dt-observed-labels"><span>Month</span><span>Income</span><span>Expenses</span><span>Closing cash</span></div>{actualMonths.map((row,index)=><div className="dt-observed-row" key={row.month}><strong>{row.month}</strong><input type="number" min="0" value={row.income} onChange={(e)=>updateActual(index,'income',e.target.value)}/><input type="number" min="0" value={row.expenses} onChange={(e)=>updateActual(index,'expenses',e.target.value)}/><input type="number" value={row.closing_cash} onChange={(e)=>updateActual(index,'closing_cash',e.target.value)}/></div>)}</div>
      <div className="dt-learning-actions"><button type="button" className="dt-secondary" onClick={addActualMonth}>+ Add observed month</button><button type="button" className="dt-primary" onClick={()=>void runLearningLoop()} disabled={learningLoading}>{learningLoading?'Comparing reality…':'Run Reality Check + Replay'}</button></div>
      {realityCheck&&regretReplay&&calibration&&<div className="dt-learning-results">
        <article className="dt-reality-card"><span>REFLECT · REALITY CHECK</span><h3>Prediction vs reality</h3><div className="dt-learning-metrics"><div><span>Months observed</span><strong>{realityCheck.summary.months_observed}</strong></div><div><span>Mean income delta</span><strong>{money(realityCheck.summary.mean_monthly_income_delta)}</strong></div><div><span>Mean expense delta</span><strong>{money(realityCheck.summary.mean_monthly_expense_delta)}</strong></div><div><span>Mean absolute cash error</span><strong>{money(realityCheck.summary.mean_absolute_cash_error)}</strong></div><div><span>Final cash error</span><strong>{money(realityCheck.summary.final_cash_error)}</strong></div><div><span>Direction</span><strong>{realityCheck.summary.final_cash_direction}</strong></div></div><p>{realityCheck.learning_signal.note}</p></article>
        <article className="dt-replay-card"><span>REPLAY · COUNTERFACTUAL</span><h3>What if you had chosen differently?</h3><div className="dt-chosen-reality"><span>Chosen · {regretReplay.chosen_option.label}</span><strong>{money(regretReplay.chosen_option.ending_cash_under_observed_conditions)}</strong><small>ending cash under observed conditions</small></div><div className="dt-replay-list">{regretReplay.rejected_replays.map((r)=><div key={r.option_id}><div><strong>{r.label}</strong><span>{r.cash_survives_observed_period?'Cash survived':'Cash failed'}</span></div><div><strong>{money(r.ending_cash)}</strong><span>{r.cash_difference_vs_chosen_reality>=0?'+':''}{money(r.cash_difference_vs_chosen_reality)} vs chosen</span></div></div>)}</div><p>{regretReplay.interpretation_note}</p></article>
        <article className="dt-adaptive-card"><span>LEARN · ADAPTIVE TWIN</span><h3>{calibration.status==='ready_for_review'?'A calibration is ready for your approval.':'PORTELYX is not changing your twin yet.'}</h3><div className="dt-adaptive-grid"><div><span>Modeled income</span><strong>{money(calibration.baseline.monthly_income)}</strong><small>Proposed {money(calibration.proposal.proposed_monthly_income)}</small></div><div><span>Modeled expenses</span><strong>{money(calibration.baseline.monthly_expenses)}</strong><small>Proposed {money(calibration.proposal.proposed_monthly_expenses)}</small></div><div><span>Evidence maturity</span><strong>{Math.round(calibration.evidence.evidence_maturity*100)}%</strong><small>heuristic indicator, not probability</small></div></div><p>{calibration.note}</p>{calibration.status==='ready_for_review'?<button type="button" className="dt-primary" disabled={applyLoading} onClick={()=>void applyAdaptiveCalibration()}>{applyLoading?'Applying approved calibration…':'Approve calibration'}</button>:<div className="dt-evidence-note">More or more-material observed evidence is required before PORTELYX proposes a change.</div>}{appliedCalibration&&<div className="dt-applied"><strong>✓ Calibration approved and verified.</strong><span>Income {money(appliedCalibration.audit.before.monthly_income)} → {money(appliedCalibration.audit.after.monthly_income)} · Expenses {money(appliedCalibration.audit.before.monthly_expenses)} → {money(appliedCalibration.audit.after.monthly_expenses)}</span><small>The backend returned a calibrated copy. The original Financial Twin was not silently mutated.</small></div>}</article>
      </div>}
    </section>}

    <footer className="dt-footer"><strong>PORTELYX Decision Twin</strong><span>Deterministic decision rehearsal. Stress scenarios are what-if assumptions, not forecasts.</span></footer>
  </div>
}
