import { useToast, TOAST_ICONS } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

const TONE: Record<string, string> = {
  success: "border-emerald-200 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  error: "border-red-200 text-red-600 dark:border-red-500/30 dark:text-red-400",
  info: "border-blue-200 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  warning: "border-amber-200 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:right-6 sm:top-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "slide-up pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-3.5 pr-3 shadow-lg shadow-slate-200/60 dark:bg-slate-900 dark:shadow-none",
            TONE[toast.type]
          )}
        >
          <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-current/10")}>
            <i className={cn(TOAST_ICONS[toast.type], "text-base")} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{toast.title}</p>
            {toast.message && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{toast.message}</p>}
          </div>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-slate-300 transition hover:text-slate-500 dark:hover:text-slate-300"
          >
            <i className="fi fi-rr-cross-small text-sm" />
          </button>
        </div>
      ))}
    </div>
  );
}
