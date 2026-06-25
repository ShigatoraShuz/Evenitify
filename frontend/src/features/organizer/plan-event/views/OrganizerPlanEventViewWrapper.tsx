import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanEventViewModel } from '../viewmodels/usePlanEventViewModel'
import { OrganizerPlanEventView } from './OrganizerPlanEventView'
import type { DraftEvent } from '../components/DraftEventsTab'
import type { EventBrief } from '../../vendor-marketplace/models/vendorMarketplace.model'

const BRIEF_STORAGE_KEY = 'eventify:marketplace-brief'

export default function OrganizerPlanEventViewWrapper() {
  const navigate = useNavigate()
  const vm = usePlanEventViewModel()
  const redirectingRef = useRef(false)

  useEffect(() => {
    vm.loadDraft()
  }, [])

  const redirect = useCallback(async (brief: EventBrief) => {
    if (redirectingRef.current) return
    redirectingRef.current = true
    sessionStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(brief))
    navigate(`/organizer/vendor-marketplace?eventId=${brief.eventId}`)
  }, [navigate])

  useEffect(() => {
    if (vm.pendingMarketplaceBrief) {
      void redirect(vm.pendingMarketplaceBrief)
    }
  }, [vm.pendingMarketplaceBrief, redirect])

  return (
    <OrganizerPlanEventView
      currentStep={vm.currentStep}
      form={vm.form}
      drafts={vm.drafts.map((draft) => ({
        id: draft.id,
        title: draft.title,
        eventType: draft.eventType,
        venue: draft.venue,
        eventDate: draft.eventDate,
        guests: draft.guests,
        budget: draft.budget,
        progress: draft.progress,
        lastSaved: draft.lastSaved,
      })) as DraftEvent[]}
      completedBriefs={vm.completedBriefs}
      loading={vm.loading}
      error={vm.error}
      errors={vm.errors}
      submitted={vm.submitted}
      submitting={vm.submitting}
      createdEventId={vm.createdEventId}
      eventTypeMeta={vm.eventTypeMeta}
      recommendedServices={vm.recommendedServices}
      progress={vm.progress}
      onUpdateForm={vm.updateForm}
      onToggleService={vm.toggleService}
      onSelectEventType={vm.selectEventType}
      onGoNext={vm.goNext}
      onGoBack={vm.goBack}
      onSubmit={vm.handleSubmit}
      onSaveDraft={vm.saveDraft}
      onReset={vm.reset}
      onContinueToProcurement={vm.pendingMarketplaceBrief ? () => redirect(vm.pendingMarketplaceBrief!) : undefined}
      onContinueDraft={(draftId) => {
        vm.loadDraft(draftId)
        navigate('/organizer/plan-event', { replace: true })
      }}
      onEditDraft={(draftId) => {
        vm.loadDraft(draftId)
        navigate('/organizer/plan-event', { replace: true })
      }}
      onDeleteDraft={(draftId) => {
        vm.clearDraft(draftId)
      }}
    />
  )
}
