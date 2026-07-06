import { useEffect, useRef } from 'react'

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
  const primaryRef = useRef(null)

  useEffect(() => {
    if (!open) return
    primaryRef.current?.focus()

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); onCancel() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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
        aria-labelledby="cdlg-title"
        aria-describedby="cdlg-msg"
        className="w-full max-w-sm rounded-2xl bg-paper p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="cdlg-title" className="font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        <p id="cdlg-msg" className="mt-1 text-sm text-inkSoft leading-relaxed">
          {message}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-paperLine py-2.5 text-sm font-semibold text-inkSoft hover:bg-white transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={primaryRef}
            type="button"
            onClick={onConfirm}
            className={[
              'flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-colors',
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
