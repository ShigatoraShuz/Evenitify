import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { ToastContainer, type ToastData, type ToastType } from './Toast'

interface ToastContextValue {
  addToast: (type: ToastType, message: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {}, clearToasts: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}
