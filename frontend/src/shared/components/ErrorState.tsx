import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function ErrorState({ title = 'Something went wrong', description, actionLabel = 'Try again', onAction }: ErrorStateProps) {
  return (
    <div className="rounded-[24px] border border-red-200 bg-red-50 p-5 text-red-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)]" role="alert">
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-red-800">{description}</p>
      {onAction && (
        <div className="mt-4">
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
