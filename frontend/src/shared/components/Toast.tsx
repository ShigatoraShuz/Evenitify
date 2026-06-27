import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastData {
  id: string
  type: ToastType
  message: string
}

interface ToastContainerProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
      setTimeout(() => onRemove(toast.id), 300)
    }, 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  const colors = {
    success: 'border-emerald-200/60 bg-emerald-50/95 text-emerald-900',
    error: 'border-rose-200/60 bg-rose-50/95 text-rose-900',
    info: 'border-cyan-200/60 bg-cyan-50/95 text-cyan-900'
  }

  return (
    <div
      className={[
        'flex min-w-[280px] items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-[0_18px_45px_rgba(2,6,23,0.18)] backdrop-blur-xl transition-all duration-300',
        colors[toast.type],
        exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0',
      ].join(' ')}
    >
      <span className="flex-1 leading-5">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="rounded-full border border-current/10 bg-white/60 px-2 py-1 text-current/70 transition-opacity hover:text-current">&times;</button>
    </div>
  )
}
