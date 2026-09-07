import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from 'utils'

/* The one place in this app where context is the right tool: the publishers are
   scattered (a row menu, a topbar button, a page header) and the single consumer is the
   region at the root, so a callback would have to thread through every layer.

   House rule: notification copy never contains "success" or "successfully". */

export type ToastTone = 'neutral' | 'info'

type Toast = { id: number; message: string; tone: ToastTone }

const TOAST_DURATION_MS = 3200
const MAX_VISIBLE = 3

const ToastContext = createContext<((message: string, tone?: ToastTone) => void) | null>(null)

export const useToast = (): ((message: string, tone?: ToastTone) => void) => {
  const notify = useContext(ToastContext)
  if (!notify) throw new Error('useToast must be used inside <ToastProvider>.')
  return notify
}

export type ToastProviderProps = { children: ReactNode }

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<readonly Toast[]>([])

  const notify = useCallback((message: string, tone: ToastTone = 'neutral') => {
    const id = Date.now() + Math.random()
    setToasts(current => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, tone }])
    // Self-dismissing, so nothing has to remember to clear it.
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), TOAST_DURATION_MS)
  }, [])

  /* Memoised so the context value identity is stable: `notify` is already stable, and an
     inline object here would re-render every consumer on every parent render. */
  const value = useMemo(() => notify, [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* `aria-live='polite'` and `role='status'`, so a toast is announced without
          stealing focus. It is not a `role='alert'`: these are confirmations, not
          errors, and alert interrupts whatever the user is reading. */}
      <div
        role='status'
        aria-live='polite'
        className='pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:items-end'
      >
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto max-w-sm rounded-lg border px-3.5 py-2.5 text-[0.8125rem] shadow-card',
              toast.tone === 'info' ? 'border-line bg-surface-inverse text-ink-inverse' : 'border-line-strong bg-surface-raised text-ink',
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
