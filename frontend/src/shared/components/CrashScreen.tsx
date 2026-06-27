import { Button } from './Button'

interface CrashScreenProps {
  error?: Error | null
  onReset?: () => void
}

export function CrashScreen({ error, onReset }: CrashScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#07111f_0%,#0a1425_100%)] p-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-200/30 bg-rose-500/15">
          <span className="text-2xl font-bold text-rose-100" aria-hidden="true">!</span>
        </div>
        <h1 className="mb-2 text-xl font-semibold text-white">Something went wrong</h1>
        <p className="mb-6 text-sm leading-6 text-slate-300">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        {error && import.meta.env.DEV && (
          <details className="mb-6 text-left">
            <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-200">Error details</summary>
            <pre className="mt-2 max-h-32 overflow-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-xs text-rose-200">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
        <div className="flex justify-center gap-3">
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
