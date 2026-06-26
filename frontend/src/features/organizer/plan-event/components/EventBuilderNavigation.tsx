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
  onSaveDraft?: () => void
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
  onSaveDraft,
  onContinueToProcurement,
  onCreateAnother,
  submitted
}: EventBuilderNavigationProps) {
  if (submitted) {
    return (
      <div className="flex flex-wrap gap-3">
        {onContinueToProcurement && (
          <Button onClick={onContinueToProcurement} className="px-3 py-1.5 text-xs">
            Continue to Marketplace
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}
        {onCreateAnother && (
          <Button variant="secondary" onClick={onCreateAnother} className="px-3 py-1.5 text-xs">
            Create another event
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-between">
      <div className="text-xs leading-5 text-slate-600 md:text-sm">
        {isLastStep
          ? 'Review the plan before creating the event and generating marketplace requirements.'
          : 'Use the guided steps to build the full event setup before vendor outreach.'}
      </div>
      <div className="flex flex-wrap gap-2">
        {onSaveDraft && (
          <Button type="button" variant="ghost" onClick={onSaveDraft} disabled={submitting} className="px-3 py-1.5 text-xs">
            Save Draft
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={onBack} disabled={currentStep === 0 || submitting} className="px-3 py-1.5 text-xs">
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Back
        </Button>
        {currentStep < TOTAL_STEPS - 1 ? (
          <Button type="button" onClick={onNext} disabled={submitting} className="px-3 py-1.5 text-xs">
            Next
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={onSubmit} loading={submitting} className="px-3 py-1.5 text-xs">
            Create Event Plan
          </Button>
        )}
      </div>
    </div>
  )
}
