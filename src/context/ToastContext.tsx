import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (type: ToastType, title: string, message?: string) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const ICONS: Record<ToastType, string> = {
  success: "fi fi-rr-check-circle",
  error: "fi fi-rr-cross-circle",
  info: "fi fi-rr-info",
  warning: "fi fi-rr-triangle-warning",
};

export const TOAST_ICONS = ICONS;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      counter.current += 1;
      const id = `toast-${Date.now()}-${counter.current}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => dismissToast(id), 3800);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
