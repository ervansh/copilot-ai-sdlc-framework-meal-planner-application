import { useEffect, useRef, useState } from 'react'
import { BUNDLED_CATALOGUE_INDEX } from './catalogue'
import {
  createCoordinatorState,
  editCurrentPreferences,
  regeneratePlan,
  replaceDisplayedMeal,
  restoreCoordinatorState,
  saveDisplayedPlan,
  type CoordinatorResult,
  type CoordinatorState,
} from './domain/coordinator'
import { validatePreferences, type PreferenceInput } from './domain/preferences'
import { ACTIVE_PLAN_STORAGE_KEY } from './domain/persistence'
import { PlanViews } from './components/plan-views'
import type { CatalogueIndex } from './domain/catalogue-index'

export interface AppProps {
  state?: CoordinatorState
  catalogue?: CatalogueIndex
}

export default function App({ state, catalogue = BUNDLED_CATALOGUE_INDEX }: AppProps) {
  const defaultPreferences = validatePreferences({ dietType: 'VEGAN' }).preferences!
  const [coordinatorState, setCoordinatorState] = useState<CoordinatorState>(
    state ?? createCoordinatorState(defaultPreferences),
  )
  const [confirmAction, setConfirmAction] = useState<'save' | 'regenerate' | undefined>()
  const [isGenerating, setIsGenerating] = useState(false)
  const restoreAttempted = useRef(Boolean(state))

  useEffect(() => {
    if (restoreAttempted.current) return
    restoreAttempted.current = true
    try {
      const restored = restoreCoordinatorState(coordinatorState, window.localStorage, catalogue)
      if (restored.success) setCoordinatorState(restored.state)
    } catch {
      setCoordinatorState((current) => ({
        ...current,
        error: { code: 'storage-unavailable', message: 'Saved plan could not be restored.' },
      }))
    }
  }, [catalogue])

  const applyResult = (result: CoordinatorResult): void => {
    setCoordinatorState(result.state)
    if (!result.success && result.code === 'confirmation-required') return
    setConfirmAction(undefined)
  }

  const updatePreferences = (input: PreferenceInput): void => {
    applyResult(editCurrentPreferences(coordinatorState, input))
  }

  const save = (confirmReplacement = false): void => {
    let storage: Storage
    try {
      storage = window.localStorage
    } catch {
      setCoordinatorState((current) => ({
        ...current,
        error: { code: 'storage-unavailable', message: 'Browser storage is unavailable.' },
      }))
      return
    }
    const result = saveDisplayedPlan(coordinatorState, storage, catalogue, { confirmReplacement })
    if (!result.success && result.code === 'confirmation-required') {
      setConfirmAction('save')
      setCoordinatorState(result.state)
      return
    }
    applyResult(result)
  }

  const regenerate = async (confirmDiscard = false): Promise<void> => {
    setConfirmAction(undefined)
    setIsGenerating(true)
    const result = await regeneratePlan(coordinatorState, catalogue, { confirmDiscard })
    setIsGenerating(false)
    if (!result.success && result.code === 'confirmation-required') {
      setConfirmAction('regenerate')
    }
    applyResult(result)
  }

  const replaceMeal = (selectedSlot: Parameters<typeof replaceDisplayedMeal>[2]): void => {
    applyResult(replaceDisplayedMeal(coordinatorState, catalogue, selectedSlot))
  }

  const storage = typeof window === 'undefined' ? undefined : window.localStorage

  return (
    <PlanViews
      state={coordinatorState}
      catalogue={catalogue}
      isGenerating={isGenerating}
      onPreferencesChange={updatePreferences}
      onSave={() => save()}
      onRegenerate={() => void regenerate()}
      onReplaceMeal={replaceMeal}
      onConfirmAction={() => {
        if (confirmAction === 'save') save(true)
        if (confirmAction === 'regenerate') void regenerate(true)
      }}
      onCancelAction={() => setConfirmAction(undefined)}
      confirmationAction={confirmAction}
      hasStorage={Boolean(storage) && Boolean(ACTIVE_PLAN_STORAGE_KEY)}
    />
  )
}