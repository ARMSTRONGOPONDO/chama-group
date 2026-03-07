import { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { cn } from '../../utils/helpers';

const types = {
  success: { icon: FiCheckCircle, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconColor: 'text-green-500' },
  error: { icon: FiAlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconColor: 'text-red-500' },
  warning: { icon: FiAlertCircle, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', iconColor: 'text-amber-500' },
  info: { icon: FiInfo, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconColor: 'text-blue-500' },
};

export function Alert({ type = 'info', title, children, onDismiss, className = '', dismissible }) {
  const [visible, setVisible] = useState(true);
  const config = types[type];
  const Icon = config.icon;

  useEffect(() => {
    if (!visible && onDismiss) onDismiss();
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border transition-smooth',
        config.bg,
        config.border,
        config.text,
        className
      )}
    >
      <Icon className={cn('flex-shrink-0 mt-0.5', config.iconColor)} size={20} />
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <p className="text-sm opacity-90">{children}</p>
      </div>
      {(dismissible || onDismiss) && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-smooth"
          aria-label="Dismiss"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
}
