import { cn } from '../../utils/helpers';

const variants = {
  primary: 'bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-md hover:shadow-lg',
  secondary: 'bg-[#C4B5FD] text-[#6D28D9] hover:bg-[#A78BFA]',
  outline: 'border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white',
  ghost: 'text-[#7C3AED] hover:bg-[#C4B5FD]/30',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        'rounded-xl font-semibold transition-smooth focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
