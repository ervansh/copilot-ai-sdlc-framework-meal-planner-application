import { useEffect, useRef, useState } from 'react'
import type { CatalogueIndex } from '../domain/catalogue-index'
import type { CoordinatorState } from '../domain/coordinator'
import type { PreferenceInput } from '../domain/preferences'
import { ALLERGENS, DIET_TYPES, type Allergen, type DietType } from '../domain/catalogue'
import { WEEK_DAYS, WEEKLY_MEAL_SLOTS, type MealAssignment, type WeekDay } from '../domain/planning'

export interface PlanViewsProps {
  state: CoordinatorState
  catalogue: CatalogueIndex
  isGenerating?: boolean
  onPreferencesChange?: (input: PreferenceInput) => void
  onSave?: () => void
  onRegenerate?: () => void
  onReplaceMeal?: (slot: MealAssignment['slot']) => void
  onConfirmAction?: () => void
  onCancelAction?: () => void
  confirmationAction?: 'save' | 'regenerate'
  hasStorage?: boolean
}

const dayLabel = (day: WeekDay): string =>
  day.charAt(0) + day.slice(1).toLowerCase()

const mealLabel = (mealType: MealAssignment['slot']['mealType']): string =>
  mealType.charAt(0) + mealType.slice(1).toLowerCase()

const slotKey = (assignment: MealAssignment): string =>
  `${assignment.slot.day}:${assignment.slot.mealType}`

function PreferencePanel({
  state,
  isGenerating,
  onPreferencesChange,
  onSave,
  onRegenerate,
  onConfirmAction,
  onCancelAction,
  confirmationAction,
}: PlanViewsProps) {
  const [exclusionInput, setExclusionInput] = useState('')
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const regenerateButtonRef = useRef<HTMLButtonElement>(null)
  const saveButtonRef = useRef<HTMLButtonElement>(null)
  const lastActionRef = useRef<HTMLButtonElement | null>(null)
  const updatePreference = (input: PreferenceInput) => onPreferencesChange?.(input)
  const toggleAllergen = (allergen: Allergen) => {
    const allergens = state.currentPreferences.allergens.includes(allergen)
      ? state.currentPreferences.allergens.filter((item) => item !== allergen)
      : [...state.currentPreferences.allergens, allergen]
    updatePreference({ ...state.currentPreferences, allergens })
  }
  const addExclusion = () => {
    updatePreference({
      ...state.currentPreferences,
      excludedIngredients: [...state.currentPreferences.excludedIngredients, exclusionInput],
    })
    if (exclusionInput.trim()) setExclusionInput('')
  }
  const removeExclusion = (exclusion: string) => updatePreference({
    ...state.currentPreferences,
    excludedIngredients: state.currentPreferences.excludedIngredients.filter((item) => item !== exclusion),
  })

  useEffect(() => {
    if (confirmationAction) confirmButtonRef.current?.focus()
  }, [confirmationAction])

  const cancelConfirmation = () => {
    onCancelAction?.()
    window.setTimeout(() => lastActionRef.current?.focus(), 0)
  }
  const startRegeneration = () => {
    lastActionRef.current = regenerateButtonRef.current
    onRegenerate?.()
  }
  const startSave = () => {
    lastActionRef.current = saveButtonRef.current
    onSave?.()
  }

  return (
    <>
      <section className="preferences-panel" aria-labelledby="preferences-title" aria-busy={isGenerating}>
        <div className="section-heading">
          <div><p className="eyebrow">Shape the week</p><h2 id="preferences-title">Preferences</h2></div>
          {state.stale && <span className="stale-note">Plan uses older preferences</span>}
        </div>
        <fieldset><legend>Diet</legend><div className="choice-row">
          {DIET_TYPES.map((diet: DietType) => <label className="choice" key={diet}><input type="radio" name="diet" value={diet} checked={state.currentPreferences.dietType === diet} onChange={() => updatePreference({ ...state.currentPreferences, dietType: diet })} /><span>{diet.charAt(0) + diet.slice(1).toLowerCase()}</span></label>)}
        </div></fieldset>
        <fieldset><legend>Allergens to avoid</legend><div className="choice-row">
          {ALLERGENS.map((allergen) => <label className="choice" key={allergen}><input type="checkbox" checked={state.currentPreferences.allergens.includes(allergen)} onChange={() => toggleAllergen(allergen)} /><span>{allergen.charAt(0) + allergen.slice(1).toLowerCase()}</span></label>)}
        </div></fieldset>
        <fieldset><legend>Excluded ingredients</legend>
          <div className="exclusion-entry"><label htmlFor="excluded-ingredient">Add an ingredient</label><input id="excluded-ingredient" value={exclusionInput} onChange={(event) => setExclusionInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addExclusion() } }} /><button type="button" onClick={addExclusion}>Add</button></div>
          {state.currentPreferences.excludedIngredients.length > 0 && <ul className="exclusion-list">{state.currentPreferences.excludedIngredients.map((exclusion) => <li key={exclusion}><span>{exclusion}</span><button type="button" onClick={() => removeExclusion(exclusion)} aria-label={`Remove ${exclusion}`}>×</button></li>)}</ul>}
        </fieldset>
        <div className="action-row"><button ref={regenerateButtonRef} type="button" className="primary-action" onClick={startRegeneration} disabled={isGenerating} aria-live="polite">{isGenerating ? 'Generating…' : 'Regenerate plan'}</button>{state.displayedPlan && <button ref={saveButtonRef} type="button" className="secondary-action" onClick={startSave}>Save plan</button>}{state.generationStatus === 'failed' && state.error && <span className="action-error" role="alert">{state.error.message}</span>}</div>
      </section>
      {confirmationAction && <div className="confirmation" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description"><div className="confirmation-content"><p className="eyebrow">One more check</p><h2 id="confirmation-title" tabIndex={-1}>{confirmationAction === 'save' ? 'Replace the saved plan?' : 'Discard unsaved plan changes?'}</h2><p id="confirmation-description">{confirmationAction === 'save' ? 'Saving will replace the existing saved plan.' : 'Regenerating will replace the displayed plan changes.'}</p><div className="action-row"><button ref={confirmButtonRef} type="button" className="primary-action" onClick={onConfirmAction}>Confirm</button><button type="button" className="secondary-action" onClick={cancelConfirmation}>Cancel</button></div></div></div>}
    </>
  )
}

export function PlanViews({
  state,
  catalogue,
  isGenerating = false,
  onPreferencesChange,
  onSave,
  onRegenerate,
  onReplaceMeal,
  onConfirmAction,
  onCancelAction,
  confirmationAction,
}: PlanViewsProps) {
  const plan = state.displayedPlan
  const [selectedDay, setSelectedDay] = useState<WeekDay>('MONDAY')
  const [selectedAssignmentKey, setSelectedAssignmentKey] = useState<string | undefined>()

  useEffect(() => {
    if (!plan) {
      setSelectedAssignmentKey(undefined)
      return
    }
    const firstAssignment = plan.assignments.find((assignment) => assignment.slot.day === selectedDay)
    setSelectedAssignmentKey(firstAssignment ? slotKey(firstAssignment) : undefined)
  }, [plan, selectedDay])

  if (!plan) {
    return (
      <main className="app-shell">
        <header className="app-header">
          <p className="kicker">Meal Planner</p>
          <h1>Your week, thoughtfully arranged.</h1>
          <p className="intro">A complete plan will appear here once one has been generated.</p>
          {state.error && <p className="state-message" role="alert" aria-live="assertive">{state.error.message}</p>}
        </header>
        <PreferencePanel {...{ state, catalogue, isGenerating, onPreferencesChange, onSave, onRegenerate, onConfirmAction, onCancelAction, confirmationAction }} />
        <section className="empty-state" aria-labelledby="empty-title">
          <span className="empty-mark" aria-hidden="true">+</span>
          <h2 id="empty-title">No active plan yet</h2>
          <p>Generate a weekly plan to see your breakfasts, lunches, and dinners in one place.</p>
        </section>
      </main>
    )
  }

  const assignmentFor = (day: WeekDay, mealType: MealAssignment['slot']['mealType']) =>
    plan.assignments.find((assignment) => assignment.slot.day === day && assignment.slot.mealType === mealType)

  const selectedAssignment = plan.assignments.find((assignment) => slotKey(assignment) === selectedAssignmentKey)
  const selectedRecipe = selectedAssignment
    ? catalogue.catalogue.recipes.find((recipe) => recipe.id === selectedAssignment.recipeId)
    : undefined

  const selectAssignment = (assignment: MealAssignment) => {
    setSelectedDay(assignment.slot.day)
    setSelectedAssignmentKey(slotKey(assignment))
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="kicker">Meal Planner</p>
        <h1>Your week, thoughtfully arranged.</h1>
        <p className="intro">Monday through Sunday, with every meal accounted for.</p>
        {state.error && <p className="state-message" role="alert" aria-live="assertive">{state.error.message}</p>}
      </header>

      <PreferencePanel {...{ state, catalogue, isGenerating, onPreferencesChange, onSave, onRegenerate, onConfirmAction, onCancelAction, confirmationAction }} />

      <section className="plan-layout" aria-label="Weekly meal plan">
        <div className="weekly-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">The full week</p>
              <h2>Weekly plan</h2>
            </div>
            <span className="plan-status">{state.stale ? 'Based on earlier preferences' : 'Current plan'}</span>
          </div>
          <div className="week-grid">
            {WEEK_DAYS.map((day) => (
              <article className={`day-card${selectedDay === day ? ' is-selected' : ''}`} key={day}>
                <button className="day-heading" type="button" onClick={() => setSelectedDay(day)} aria-pressed={selectedDay === day}>
                  <span>{dayLabel(day)}</span>
                  <span className="day-arrow" aria-hidden="true">→</span>
                </button>
                <div className="meal-list">
                  {WEEKLY_MEAL_SLOTS.filter((slot) => slot.day === day).map((slot) => {
                    const assignment = assignmentFor(slot.day, slot.mealType)
                    const recipe = assignment && catalogue.catalogue.recipes.find((candidate) => candidate.id === assignment.recipeId)
                    if (!assignment || !recipe) return null
                    return (
                      <button
                        className={`meal-row${selectedAssignmentKey === slotKey(assignment) ? ' is-selected' : ''}`}
                        key={slot.mealType}
                        type="button"
                        onClick={() => selectAssignment(assignment)}
                      >
                        <span className="meal-type">{mealLabel(slot.mealType)}</span>
                        <span className="recipe-name">{recipe.name}</span>
                      </button>
                    )
                  })}
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="detail-panel" aria-label="Selected day and recipe details">
          <div className="section-heading">
            <div>
              <p className="eyebrow">A closer look</p>
              <h2>{dayLabel(selectedDay)}</h2>
            </div>
          </div>
          <div className="daily-list">
            {WEEKLY_MEAL_SLOTS.filter((slot) => slot.day === selectedDay).map((slot) => {
              const assignment = assignmentFor(slot.day, slot.mealType)
              const recipe = assignment && catalogue.catalogue.recipes.find((candidate) => candidate.id === assignment.recipeId)
              if (!assignment || !recipe) return null
              return (
                <button
                  className={`daily-meal${selectedAssignmentKey === slotKey(assignment) ? ' is-selected' : ''}`}
                  key={slot.mealType}
                  type="button"
                  onClick={() => selectAssignment(assignment)}
                >
                  <span>{mealLabel(slot.mealType)}</span>
                  <strong>{recipe.name}</strong>
                </button>
              )
            })}
          </div>

          {selectedRecipe && selectedAssignment ? (
            <article className="recipe-detail" aria-labelledby="recipe-title">
              <p className="eyebrow">{mealLabel(selectedAssignment.slot.mealType)} recipe</p>
              <h2 id="recipe-title">{selectedRecipe.name}</h2>
              <dl className="recipe-meta">
                <div><dt>Meal type</dt><dd>{mealLabel(selectedRecipe.mealType)}</dd></div>
                <div><dt>Preparation</dt><dd>{selectedRecipe.preparationTimeMinutes} minutes</dd></div>
                <div><dt>Serves</dt><dd>{selectedRecipe.servingSize}</dd></div>
              </dl>
              <h3>Ingredients</h3>
              <ul>{selectedRecipe.ingredients.map((ingredient) => <li key={ingredient.canonicalName}>{ingredient.displayName}</li>)}</ul>
              <button type="button" className="secondary-action replace-action" onClick={() => onReplaceMeal?.(selectedAssignment.slot)}>Replace meal</button>
              <h3>Instructions</h3>
              <p>{selectedRecipe.instructions}</p>
            </article>
          ) : (
            <p className="detail-empty">Select a meal to view its recipe.</p>
          )}
        </aside>
      </section>
    </main>
  )
}