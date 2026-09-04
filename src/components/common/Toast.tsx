import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { toneCssVar } from '../../utils/helpers';
import { TOAST_EVENT, ToastItem } from '../../utils/toast';

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastItem>;
      if (!customEvent.detail) return;
      const newToast = customEvent.detail;
      setToasts((prev) => [...prev.slice(-4), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4500);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-5 end-5 z-[999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-3"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.tone === 'crit'
            ? AlertCircle
            : toast.tone === 'warn'
            ? AlertTriangle
            : toast.tone === 'ok'
            ? CheckCircle2
            : Info;

        const colorVar = toneCssVar(toast.tone || 'ok');

        return (
          <div
            key={toast.id}
            role="status"
            aria-live="polite"
            className="pointer-events-auto flex items-start gap-3 rounded-xl border border-border/80 bg-background/95 backdrop-blur-xl p-3.5 shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300"
            style={{ borderInlineStartColor: colorVar, borderInlineStartWidth: '4px' }}
          >
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-secondary/50">
              <Icon className="h-4 w-4" style={{ color: colorVar }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-tight">{toast.title}</h4>
              {toast.message && (
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="grid h-11 w-11 min-h-[44px] min-w-[44px] -my-2 -me-2 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
