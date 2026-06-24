
/**
 * FadingDots — animated loading indicator for page transitions.
 * Three dots that fade in/out in sequence.
 */
export function FadingDots() {
  return (
    <div
      className="fixed inset-0 z-[9999] bg-gradient-to-br from-brand-50 to-blue-50 flex flex-col items-center justify-center gap-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="text-4xl font-extrabold text-slate-900 tracking-tight">Eventify</span>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-600 border border-brand-200 bg-brand-50 rounded-md px-2 py-1">
          B2B
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block w-4 h-4 rounded-full bg-brand-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            style={{
              animation: 'fadingDot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  )
}

/**
 * CardSkeleton — full-page skeleton screen for initial page load / auth hydration.
 * Mimics a dashboard layout with header, sidebar items, and content cards.
 */
export function CardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50" role="status" aria-live="polite">

      {/* Header skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-200 animate-pulse" />
            <div className="w-24 h-5 rounded-md bg-slate-200 animate-pulse" />
            <div className="hidden sm:block w-10 h-5 rounded-full bg-slate-100 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-20 h-8 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Page title skeleton */}
        <div className="mb-8">
          <div className="w-48 h-7 rounded-lg bg-slate-200 animate-pulse mb-2" />
          <div className="w-72 h-4 rounded-md bg-slate-100 animate-pulse" />
        </div>

        {/* Summary cards row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 animate-pulse" />
                <div className="w-12 h-4 rounded-md bg-slate-100 animate-pulse" />
              </div>
              <div className="w-20 h-7 rounded-md bg-slate-200 animate-pulse mb-1.5" />
              <div className="w-32 h-3.5 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main content card skeleton */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="w-36 h-5 rounded-md bg-slate-200 animate-pulse" />
            <div className="w-24 h-8 rounded-xl bg-slate-100 animate-pulse" />
          </div>
          {/* Table-like rows */}
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-3/4 h-4 rounded bg-slate-200 animate-pulse" />
                  <div className="w-1/2 h-3 rounded bg-slate-100 animate-pulse" />
                </div>
                <div className="w-16 h-6 rounded-full bg-slate-100 animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Secondary cards row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
            >
              <div className="w-28 h-5 rounded-md bg-slate-200 animate-pulse mb-4" />
              <div className="space-y-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <div className="w-full h-3.5 rounded bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading page…</span>
    </div>
  )
}
