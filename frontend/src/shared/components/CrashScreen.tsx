import { Button } from './Button'

interface CrashScreenProps {
  error?: Error | null
  onReset?: () => void
}

export function CrashScreen({ error, onReset }: CrashScreenProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl" aria-hidden="true">!</span>
        </div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-600 mb-6">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        {error && import.meta.env.DEV && (
          <details className="mb-6 text-left">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-700">Error details</summary>
            <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-red-700 overflow-auto max-h-32">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          {onReset && (
            <Button variant="secondary" onClick={onReset}>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
