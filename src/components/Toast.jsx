import { useEffect } from "react";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Icon and colors based on type
  const config = {
    success: {
      icon: "✅",
      bg: "bg-emerald-500",
      border: "border-emerald-600",
    },
    error: {
      icon: "❌",
      bg: "bg-red-500",
      border: "border-red-600",
    },
    warning: {
      icon: "⚠️",
      bg: "bg-amber-500",
      border: "border-amber-600",
    },
    info: {
      icon: "ℹ️",
      bg: "bg-blue-500",
      border: "border-blue-600",
    },
  };

  const { icon, bg, border } = config[type] || config.success;

  return (
    <div
      className={`fixed top-24 right-6 z-50 max-w-sm rounded-xl border-2 ${border} ${bg} px-5 py-4 text-white shadow-2xl animate-slide-in`}
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icon}</span>
        <p className="text-sm font-semibold leading-relaxed">{message}</p>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/30">
        <div
          className="h-full bg-white/80 rounded-full"
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      {/* Animation styles */}
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Toast;