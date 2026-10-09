import { useState } from 'react'
import { apiUrl } from './api'
import './McpSimulator.css'

type SimulationResult = {
  status?: string
  clarification_question?: string
  simulated_state?: {
    available_cash?: number
    monthly_income?: number
    monthly_expenses?: number
    monthly_surplus?: number
  }
  executions?: Array<{
    tool_name: string
    parameters?: Record<string, unknown>
    result?: Record<string, unknown>
  }>
  base_twin_unchanged?: boolean
  explanation?: string
}

const EXAMPLE_QUESTIONS = [
  'What happens if my monthly expenses increase by R3000?',
  'What happens if my monthly income decreases by R5000?',
  'What happens if I lose my job?',
]

export default function McpSimulator() {
  const [question, setQuestion] = useState(EXAMPLE_QUESTIONS[0])
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function runSimulation() {
    const trimmed = question.trim()

    if (!trimmed || trimmed.length > 500 || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(apiUrl('/simulator/simulate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmed }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again in a minute.')
        }
        throw new Error('The simulation could not be completed.')
      }

      const data = await response.json()

      if (data.source !== 'real_mcp' || !data.result) {
        throw new Error('The MCP server did not return a valid result.')
      }

      const mcpResult = data.result

      const simulation =
        mcpResult?.structured_content ??
        (typeof mcpResult?.content?.[0]?.text === 'string'
          ? JSON.parse(mcpResult.content[0].text)
          : mcpResult)

      if (
        !simulation?.simulated_state &&
        !(
          simulation?.status === 'needs_clarification' &&
          simulation?.clarification_question
        )
      ) {
        throw new Error('The MCP server returned no usable simulation data.')
      }

      setResult(simulation as SimulationResult)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="px-mcp-simulator">
      <header>
        <p>PORTELYX MCP LAB</p>
        <h1>Financial Decision Simulator</h1>
        <p>
          Ask a financial what-if question and see a real MCP-powered simulation.
          All calculations use fictional demonstration data.
        </p>
      </header>

      <div className="px-mcp-input">
        <label htmlFor="mcp-question">Your financial question</label>
        <textarea
          id="mcp-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          rows={3}
        />

        <div className="px-mcp-examples">
          {EXAMPLE_QUESTIONS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setQuestion(example)}
              disabled={loading}
            >
              {example}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={runSimulation}
          disabled={loading || !question.trim()}
        >
          {loading ? 'Running MCP simulation...' : 'Run Simulation'}
        </button>
      </div>

      {error && <p role="alert">{error}</p>}

      {result && (
        <div className="px-mcp-results">
          <h2>Simulation Results</h2>

          <p>Status: {result.status ?? 'Completed'}</p>

          {result.status === 'needs_clarification' &&
            result.clarification_question && (
              <div className="px-mcp-clarification">
                <strong>PORTELYX needs one more detail</strong>
                <p>{result.clarification_question}</p>
                <p>Enter a more specific question above, then run the simulation again.</p>
              </div>
            )}

          {result.simulated_state && (
            <div className="px-mcp-metrics">
              {[
                {
                  label: 'Monthly Income',
                  value: result.simulated_state.monthly_income,
                },
                {
                  label: 'Monthly Expenses',
                  value: result.simulated_state.monthly_expenses,
                },
                {
                  label: 'Monthly Surplus',
                  value: result.simulated_state.monthly_surplus,
                },
              ].map((metric) => (
                <div className="px-mcp-metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>
                    {typeof metric.value === 'number'
                      ? `R${metric.value.toLocaleString('en-ZA')}`
                      : 'Unavailable'}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <h3>MCP Tool Activity</h3>
          {result.executions?.map((execution, index) => (
            <div key={`${execution.tool_name}-${index}`}>
              <strong>{execution.tool_name}</strong>
              <pre>{JSON.stringify(execution.result, null, 2)}</pre>
            </div>
          ))}

          {result.base_twin_unchanged && (
            <p>Original Financial Twin unchanged.</p>
          )}
        </div>
      )}
    </section>
  )
}
