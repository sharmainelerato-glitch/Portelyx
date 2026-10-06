import './GoalBuilder.css'

export type GoalInput = {
  id: string
  name: string
  category: string
  targetAmount: string
  targetDate: string
  currency: string
  currentSaved: string
  monthlyContribution: string
  priority: string
  notes: string
}

type Props = {
  goals: GoalInput[]
  defaultCurrency: string
  onChange: (goals: GoalInput[]) => void
}

export default function GoalBuilder({
  goals,
  defaultCurrency,
  onChange,
}: Props) {
  const addGoal = () => {
    onChange([
      ...goals,
      {
        id: crypto.randomUUID(),
        name: '',
        category: 'custom',
        targetAmount: '',
        targetDate: '',
        currency: defaultCurrency,
        currentSaved: '',
        monthlyContribution: '',
        priority: '',
        notes: '',
      },
    ])
  }

  const updateGoal = (
    goalId: string,
    field: keyof GoalInput,
    value: string,
  ) => {
    onChange(
      goals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              [field]: value,
            }
          : goal,
      ),
    )
  }

  const removeGoal = (goalId: string) => {
    onChange(goals.filter((goal) => goal.id !== goalId))
  }

  return (
    <section className="goal-builder">
      <div className="goal-builder-heading">
        <div>
          <p className="onboarding-label">
            FINANCIAL GOALS
          </p>
          <h2>What are you building toward?</h2>
          <p>
            Add any financial target. Portelyx uses the details
            you provide to calculate the path, test scenarios,
            and show what changes.
          </p>
        </div>

        <button
          className="secondary-button goal-add-button"
          type="button"
          onClick={addGoal}
        >
          + Add goal
        </button>
      </div>

      {goals.length === 0 ? (
        <button
          className="goal-empty"
          type="button"
          onClick={addGoal}
        >
          <span className="goal-empty-mark">◎</span>

          <span className="goal-empty-copy">
            <strong>Add your first goal</strong>
            <small>
              A business, home, tuition, travel, emergency
              fund, retirement plan — or anything else with
              a financial target.
            </small>
          </span>

          <span className="goal-empty-arrow">→</span>
        </button>
      ) : (
        <div className="goal-list">
          {goals.map((goal, index) => {
            const target = Number(goal.targetAmount)
            const saved = Number(goal.currentSaved)
            const progress =
              target > 0
                ? Math.min(
                    100,
                    Math.max(0, (saved / target) * 100),
                  )
                : 0

            return (
              <article
                className="goal-card"
                key={goal.id}
              >
                <div className="goal-card-top">
                  <div className="goal-number">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="goal-card-title">
                    <span>GOAL</span>
                    <strong>
                      {goal.name.trim() || 'Untitled goal'}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="goal-remove"
                    onClick={() => removeGoal(goal.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className="goal-primary-fields">
                  <label className="goal-field goal-field-name">
                    <span>What are you working toward?</span>
                    <input
                      type="text"
                      value={goal.name}
                      placeholder="e.g. Start my business"
                      onChange={(event) =>
                        updateGoal(
                          goal.id,
                          'name',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="goal-field">
                    <span>Target amount</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={goal.targetAmount}
                      placeholder="0"
                      onChange={(event) =>
                        updateGoal(
                          goal.id,
                          'targetAmount',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="goal-field">
                    <span>Target date</span>
                    <input
                      type="date"
                      value={goal.targetDate}
                      onChange={(event) =>
                        updateGoal(
                          goal.id,
                          'targetDate',
                          event.target.value,
                        )
                      }
                    />
                  </label>
                </div>

                <div className="goal-secondary-fields">
                  <label className="goal-field">
                    <span>Already saved</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={goal.currentSaved}
                      placeholder="0"
                      onChange={(event) =>
                        updateGoal(
                          goal.id,
                          'currentSaved',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="goal-field">
                    <span>Monthly contribution</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={goal.monthlyContribution}
                      placeholder="0"
                      onChange={(event) =>
                        updateGoal(
                          goal.id,
                          'monthlyContribution',
                          event.target.value,
                        )
                      }
                    />
                  </label>

                  <label className="goal-field">
                    <span>Currency</span>
                    <input
                      type="text"
                      maxLength={3}
                      value={goal.currency}
                      placeholder={defaultCurrency || 'USD'}
                      onChange={(event) =>
                        updateGoal(
                          goal.id,
                          'currency',
                          event.target.value.toUpperCase(),
                        )
                      }
                    />
                  </label>
                </div>

                <details className="goal-details">
                  <summary>
                    Add optional details
                    <span>＋</span>
                  </summary>

                  <div className="goal-detail-fields">
                    <label className="goal-field">
                      <span>Category</span>
                      <input
                        type="text"
                        value={goal.category}
                        placeholder="custom"
                        onChange={(event) =>
                          updateGoal(
                            goal.id,
                            'category',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="goal-field">
                      <span>Priority</span>
                      <input
                        type="text"
                        value={goal.priority}
                        placeholder="Optional"
                        onChange={(event) =>
                          updateGoal(
                            goal.id,
                            'priority',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="goal-field goal-field-notes">
                      <span>Notes</span>
                      <input
                        type="text"
                        value={goal.notes}
                        placeholder="Anything Portelyx should know"
                        onChange={(event) =>
                          updateGoal(
                            goal.id,
                            'notes',
                            event.target.value,
                          )
                        }
                      />
                    </label>
                  </div>
                </details>

                <div className="goal-progress">
                  <div className="goal-progress-copy">
                    <span>
                      {target > 0
                        ? `${progress.toFixed(0)}% funded`
                        : 'Add a target to see progress'}
                    </span>

                    {goal.targetDate && (
                      <small>
                        Target {goal.targetDate}
                      </small>
                    )}
                  </div>

                  <div
                    className="goal-progress-track"
                    aria-hidden="true"
                  >
                    <span
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </article>
            )
          })}

          <button
            type="button"
            className="goal-add-another"
            onClick={addGoal}
          >
            <span>＋</span>
            Add another goal
          </button>
        </div>
      )}

      <div className="goal-builder-note">
        <span>i</span>
        <p>
          Portelyx does not assume an investment return here.
          Goal projections use the amounts and contributions
          you provide unless a separate scenario explicitly
          introduces another assumption.
        </p>
      </div>
    </section>
  )
}
