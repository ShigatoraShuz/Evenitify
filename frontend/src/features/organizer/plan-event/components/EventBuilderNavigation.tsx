import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '../../../../shared/components/Button'
import { TOTAL_STEPS } from '../models/planEvent.model'

interface EventBuilderNavigationProps {
  currentStep: number
  submitting: boolean
  isLastStep: boolean
  onBack: () => void
  onNext: () => void
  onSubmit: () => void
  onContinueToProcurement?: () => void
  onCreateAnother?: () => void
  submitted?: boolean
}

export function EventBuilderNavigation({
  currentStep,
  submitting,
  isLastStep,
  onBack,
  onNext,
  onSubmit,
  onContinueToProcurement,
  onCreateAnother,
  submitted
}: EventBuilderNavigationProps) {
  if (submitted) {
    return (
      <div className="flex flex-wrap gap-3">
        {onContinueToProcurement && (
          <Button onClick={onContinueToProcurement}>
            Continue to Marketplace
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
        {onCreateAnother && (
          <Button variant="secondary" onClick={onCreateAnother}>
            Create another event
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-sm text-slate-600">
        {isLastStep
          ? 'Review the plan before creating the event and generating marketplace requirements.'
          : 'Use the guided steps to build the full event setup before vendor outreach.'}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={onBack} disabled={currentStep === 0 || submitting}>
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        {currentStep < TOTAL_STEPS - 1 ? (
          <Button onClick={onNext} disabled={submitting}>
            Next
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onSubmit} loading={submitting}>
            Create Event Plan
          </Button>
        )}
      </div>
    </div>
  )
}
