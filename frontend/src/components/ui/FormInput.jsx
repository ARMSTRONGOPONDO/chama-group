import { cn } from '../../utils/helpers';

export function FormInput({
  label,
  error,
  className = '',
  id,
  type = 'text',
  ...props
}) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-smooth placeholder:text-gray-400',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          props.disabled && 'bg-gray-50 cursor-not-allowed opacity-70'
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FormSelect({ label, error, className = '', id, children, ...props }) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-smooth',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
          props.disabled && 'bg-gray-50 cursor-not-allowed opacity-70'
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function FormTextarea({ label, error, className = '', id, ...props }) {
  const inputId = id || props.name || label?.toLowerCase().replace(/\s/g, '-');
  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 outline-none transition-smooth resize-y min-h-[100px]',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
