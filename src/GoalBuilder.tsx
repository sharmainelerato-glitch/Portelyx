import { usePortelyxLanguage } from './i18n'
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
  const { t } = usePortelyxLanguage()

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
            {t('manualSetup.financialGoals')}
          </p>
          <h2>{t('manualSetup.goalBuilderTitle')}</h2>
          <p>{t('manualSetup.goalBuilderDescription')}</p>
        </div>

        <button
          className="secondary-button goal-add-button"
          type="button"
          onClick={addGoal}
        >
          + {t('manualSetup.addGoal')}
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
            <strong>{t('manualSetup.addFirstGoal')}</strong>
            <small>{t('manualSetup.goalExamples')}</small>
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
                    <span>{t('manualSetup.goalLabel')}</span>
                    <strong>
                      {goal.name.trim() || t('manualSetup.untitledGoal')}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="goal-remove"
                    onClick={() => removeGoal(goal.id)}
                  >
                    {t('manualSetup.remove')}
                  </button>
                </div>

                <div className="goal-primary-fields">
                  <label className="goal-field goal-field-name">
                    <span>{t('manualSetup.goalQuestion')}</span>
                    <input
                      type="text"
                      value={goal.name}
                      placeholder={t('manualSetup.goalNamePlaceholder')}
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
                    <span>{t('manualSetup.targetAmount')}</span>
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
                    <span>{t('manualSetup.targetDate')}</span>
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
                    <span>{t('manualSetup.alreadySaved')}</span>
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
                    <span>{t('manualSetup.monthlyContribution')}</span>
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
                    <span>{t('manualSetup.currency')}</span>
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
                    {t('manualSetup.addOptionalDetails')}
                    <span>＋</span>
                  </summary>

                  <div className="goal-detail-fields">
                    <label className="goal-field">
                      <span>{t('manualSetup.category')}</span>
                      <input
                        type="text"
                        value={goal.category}
                        placeholder={t('manualSetup.custom')}
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
                      <span>{t('manualSetup.priority')}</span>
                      <input
                        type="text"
                        value={goal.priority}
                        placeholder={t('manualSetup.optional')}
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
                      <span>{t('manualSetup.notes')}</span>
                      <input
                        type="text"
                        value={goal.notes}
                        placeholder={t('manualSetup.notesPlaceholder')}
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
                        ? t('manualSetup.funded', {
                            progress: progress.toFixed(0),
                          })
                        : t('manualSetup.addTargetForProgress')}
                    </span>

                    {goal.targetDate && (
                      <small>
                        {t('manualSetup.targetDateDisplay', {
                          date: goal.targetDate,
                        })}
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
            {t('manualSetup.addAnotherGoal')}
          </button>
        </div>
      )}

      <div className="goal-builder-note">
        <span>i</span>
        <p>{t('manualSetup.goalProjectionNote')}</p>
      </div>
    </section>
  )
}
