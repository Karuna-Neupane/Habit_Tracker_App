import { useEffect, useRef } from 'react'

/**
 * Reusable confirmation popup. Used anywhere the app needs a yes/no
 * confirmation instead of the browser's native window.confirm/alert
 * (which block the tab, can't be styled, and are easy to misuse).
 *
 * Closes on Escape or backdrop click (treated as Cancel), and focuses
 * the primary action when it opens.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const confirmButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return

    confirmButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm rounded-xl bg-paper p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="font-display text-lg font-semibold text-ink"
        >
          {title}
        </h2>
        <p id="confirm-dialog-message" className="mt-1 text-sm text-inkSoft">
          {message}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-paperLine py-2 text-sm font-semibold text-inkSoft hover:bg-white"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={[
              'flex-1 rounded-lg py-2 text-sm font-semibold text-white',
              danger ? 'bg-ember hover:bg-ember/90' : 'bg-pine hover:bg-pine/90',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
