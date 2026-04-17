import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback(
    (message: string, type: ToastType = "info", duration = TOAST_DURATION) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
    },
    [remove]
  );

  const toast = useCallback(
    (message: string, type?: ToastType, duration?: number) => {
      add(message, type ?? "info", duration ?? TOAST_DURATION);
    },
    [add]
  );

  const success = useCallback(
    (message: string, duration?: number) => add(message, "success", duration ?? TOAST_DURATION),
    [add]
  );

  const error = useCallback(
    (message: string, duration?: number) => add(message, "error", duration ?? 6000),
    [add]
  );

  const warning = useCallback(
    (message: string, duration?: number) => add(message, "warning", duration ?? TOAST_DURATION),
    [add]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, remove }}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, remove }: { toasts: Toast[]; remove: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="position-fixed top-0 end-0 p-3 d-flex flex-column gap-2"
      style={{ zIndex: 9999, maxWidth: "360px" }}
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`toast show align-items-center text-bg-${t.type === "error" ? "danger" : t.type === "success" ? "success" : t.type === "warning" ? "warning" : "primary"} border-0 shadow`}
          style={{ minWidth: "280px" }}
        >
          <div className="d-flex align-items-center flex-grow-1">
            <i
              className={`bi ${t.type === "success" ? "bi-check-circle" : t.type === "error" ? "bi-exclamation-circle" : t.type === "warning" ? "bi-exclamation-triangle" : "bi-info-circle"} me-2`}
              aria-hidden
            />
            <div className="toast-body">{t.message}</div>
            <button
              type="button"
              className="btn-close btn-close-white me-2"
              onClick={() => remove(t.id)}
              aria-label="Cerrar"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
