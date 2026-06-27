/**
 * FadingDots - animated loading indicator for page transitions.
 * Three dots that fade in/out in sequence.
 */
export function FadingDots() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_25%),linear-gradient(180deg,#07111f_0%,#0a1425_100%)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_20px_60px_rgba(2,6,23,0.3)] backdrop-blur-xl">
        <span className="text-3xl font-semibold tracking-tight text-white">Eventify</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-100">
          B2B
        </span>
      </div>

      <div className="flex items-center gap-4">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-4 w-4 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.45)]"
            style={{
              animation: 'fadingDot 1.2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * CardSkeleton - full-page skeleton screen for initial page load / auth hydration.
 * Mimics the authenticated shell and content cards.
 */
export function CardSkeleton() {
  return (
    <div
      className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,#07111f_0%,#0a1425_100%)]"
      role="status"
      aria-live="polite"
    >
      <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/72 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-2xl bg-white/10" />
            <div className="h-5 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="hidden h-5 w-14 animate-pulse rounded-full bg-white/10 sm:block" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-20 animate-pulse rounded-full bg-white/10" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
            <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <div className="mb-2 h-8 w-56 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-4 w-80 animate-pulse rounded-full bg-white/10" />
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.18)]"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-4 w-12 animate-pulse rounded-full bg-white/10" />
              </div>
              <div className="mb-1.5 h-8 w-24 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-4 w-36 animate-pulse rounded-full bg-white/10" />
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.18)]">
          <div className="mb-6 flex items-center justify-between">
            <div className="h-5 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />
          </div>
          <div className="space-y-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded-full bg-white/10" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
                </div>
                <div className="h-6 w-16 shrink-0 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-[30px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.18)]">
              <div className="mb-4 h-5 w-32 animate-pulse rounded-full bg-white/10" />
              <div className="space-y-3">
                {[0, 1, 2].map((j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-white/10" />
                    <div className="flex-1">
                      <div className="h-3.5 w-full animate-pulse rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading page...</span>
    </div>
  )
}
