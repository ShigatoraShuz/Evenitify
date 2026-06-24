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
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  }

  return (
    <div
      className={`flex min-w-[280px] items-center gap-2 rounded-[18px] border px-4 py-3 text-sm shadow-[0_16px_32px_rgba(15,23,42,0.12)] transition-[opacity,transform] duration-300 ${colors[toast.type]} ${exiting ? 'translate-x-4 opacity-0' : 'translate-x-0 opacity-100'}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-current opacity-50 transition hover:opacity-100" aria-label="Dismiss toast">
        ×
      </button>
    </div>
  )
}
