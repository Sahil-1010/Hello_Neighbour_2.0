import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useApp } from "../../context/AppContext";

const CONFIG = {
  success: {
    Icon: CheckCircle,
    wrapper: "bg-white dark:bg-gray-800 border-emerald-300 dark:border-emerald-700",
    iconColor: "text-emerald-500",
    bar: "bg-emerald-500",
  },
  error: {
    Icon: AlertCircle,
    wrapper: "bg-white dark:bg-gray-800 border-red-300 dark:border-red-700",
    iconColor: "text-red-500",
    bar: "bg-red-500",
  },
  warning: {
    Icon: AlertTriangle,
    wrapper: "bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700",
    iconColor: "text-amber-500",
    bar: "bg-amber-500",
  },
  info: {
    Icon: Info,
    wrapper: "bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700",
    iconColor: "text-blue-500",
    bar: "bg-blue-500",
  },
};

function ToastItem({ toast, onRemove }) {
  const [leaving, setLeaving] = useState(false);
  const cfg = CONFIG[toast.type] || CONFIG.info;
  const { Icon } = cfg;

  useEffect(() => {
    const t = setTimeout(() => triggerLeave(), toast.duration ?? 4000);
    return () => clearTimeout(t);
  }, []);

  const triggerLeave = () => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 320);
  };

  return (
    <div
      className={`
        relative flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg
        max-w-xs w-full overflow-hidden
        ${cfg.wrapper}
        ${leaving ? "animate-toast-out" : "animate-toast-in"}
      `}
    >
      {/* Progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} rounded-full`}
        style={{
          animation: `shrink ${(toast.duration ?? 4000)}ms linear forwards`,
        }}
      />

      <Icon size={18} className={`${cfg.iconColor} flex-shrink-0 mt-0.5`} />

      <p className="text-sm text-gray-800 dark:text-gray-200 flex-1 leading-relaxed">
        {toast.message}
      </p>

      <button
        onClick={triggerLeave}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
