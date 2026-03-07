import { cn } from '../../utils/helpers';

export function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-md hover:shadow-lg transition-smooth border border-gray-100 overflow-hidden',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={cn('', className)}>{children}</div>;
}
