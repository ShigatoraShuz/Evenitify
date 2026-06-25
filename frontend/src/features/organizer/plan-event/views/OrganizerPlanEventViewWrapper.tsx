import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlanEventViewModel } from '../viewmodels/usePlanEventViewModel'
import { OrganizerPlanEventView } from './OrganizerPlanEventView'
import type { DraftEvent } from '../components/DraftEventsTab'

const BRIEF_STORAGE_KEY = 'eventify:marketplace-brief'

export default function OrganizerPlanEventViewWrapper() {
  const navigate = useNavigate()
  const vm = usePlanEventViewModel()
  const redirectingRef = useRef(false)

  useEffect(() => {
    vm.loadDraft()
  }, [])

  const redirect = useCallback(async () => {
    if (!vm.createdEventId || redirectingRef.current) return
    redirectingRef.current = true
    const brief = {
      eventId: vm.createdEventId,
      eventType: vm.form.eventType,
      eventName: vm.form.title,
      location: vm.form.venue,
      eventDate: vm.form.eventDate,
      startTime: vm.form.eventTime,
      endTime: '',
      guestCount: Number(vm.form.guests),
      budget: Number(vm.form.budget),
      selectedTheme: vm.form.theme,
      setupStyle: vm.form.setupMode,
      selectedVendorServices: vm.recommendedServices,
      indoorOutdoorType: vm.form.setupMode,
      specialRequirements: vm.form.specialRequirements,
      preferredPackageTier: 'premium' as const,
    }
    sessionStorage.setItem(BRIEF_STORAGE_KEY, JSON.stringify(brief))
    navigate(`/organizer/vendor-marketplace?eventId=${vm.createdEventId}`)
  }, [vm.createdEventId, vm.form, vm.recommendedServices, navigate])

  useEffect(() => {
    if (vm.submitted && vm.createdEventId) {
      redirect()
    }
  }, [vm.submitted, vm.createdEventId, redirect])

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
      onContinueToProcurement={redirect}
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
