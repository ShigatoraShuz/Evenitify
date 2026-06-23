import type { RoleHelpContent, RoleHelpStep } from '../../services/helpService'
import { Button } from './Button'
import { Modal } from './Modal'

export function StepHintCard({ step, index }: { step: RoleHelpStep; index: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
        {index + 1}
      </div>
      <h3 className="text-sm font-semibold text-gray-950">{step.title}</h3>
      <p className="mt-1 text-sm text-gray-600">{step.description}</p>
    </div>
  )
}

export function HelpPanel({ content }: { content: RoleHelpContent }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-950">{content.title}</h2>
        <p className="mt-1 text-sm text-gray-600">{content.description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {content.steps.map((step, index) => (
          <StepHintCard key={step.title} step={step} index={index} />
        ))}
      </div>
    </section>
  )
}

export function GuidedEmptyState({
  title,
  description,
  steps,
  action
}: {
  title: string
  description: string
  steps: RoleHelpStep[]
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6">
      <h3 className="text-lg font-semibold text-gray-950">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.slice(0, 3).map((step, index) => (
          <StepHintCard key={step.title} step={step} index={index} />
        ))}
      </div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function RoleHelpDrawer({
  open,
  content,
  onClose
}: {
  open: boolean
  content: RoleHelpContent | null
  onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title="Role guidance">
      {content ? (
        <div className="space-y-4">
          <HelpPanel content={content} />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Role guidance is available after signing in.</p>
      )}
    </Modal>
  )
}

