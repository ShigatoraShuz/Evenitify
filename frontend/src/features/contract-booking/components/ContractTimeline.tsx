import { memo } from 'react'

interface TimelineStep {
  label: string
  date: string | null
  active: boolean
  completed: boolean
}

interface ContractTimelineProps {
  steps: TimelineStep[]
}

export const ContractTimeline = memo(function ContractTimeline({ steps }: ContractTimelineProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.label} className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full border-2 ${
                step.completed
                  ? 'bg-emerald-500 border-emerald-500'
                  : step.active
                  ? 'bg-brand-500 border-brand-500'
                  : 'bg-white border-gray-300'
              }`}
            />
            {index < steps.length - 1 && (
              <div className={`w-0.5 h-8 ${step.completed ? 'bg-emerald-200' : 'bg-gray-200'}`} />
            )}
          </div>
          <div className="pb-4">
            <p className={`text-sm font-medium ${step.completed || step.active ? 'text-gray-900' : 'text-gray-400'}`}>
              {step.label}
            </p>
            {step.date && (
              <p className="text-xs text-gray-500">{new Date(step.date).toLocaleDateString()}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
})

export function buildContractTimeline(contract: {
  contract_status: string
  created_at?: string
  sent_at?: string | null
  organizer_signed_at?: string | null
  vendor_signed_at?: string | null
}): TimelineStep[] {
  const status = contract.contract_status
  const statusOrder = ['draft', 'sent', 'organizer_signed', 'vendor_signed', 'active', 'completed']
  const currentIndex = statusOrder.indexOf(status)

  return [
    { label: 'Draft Created', date: contract.created_at || null, active: currentIndex === 0, completed: currentIndex > 0 },
    { label: 'Sent', date: contract.sent_at || null, active: currentIndex === 1, completed: currentIndex > 1 },
    { label: 'Organizer Signed', date: contract.organizer_signed_at || null, active: currentIndex === 2, completed: currentIndex > 2 },
    { label: 'Vendor Signed', date: contract.vendor_signed_at || null, active: currentIndex === 3, completed: currentIndex > 3 },
    { label: 'Active', date: null, active: currentIndex === 4, completed: currentIndex > 4 },
    { label: 'Completed', date: null, active: currentIndex >= 5, completed: currentIndex > 5 }
  ]
}
