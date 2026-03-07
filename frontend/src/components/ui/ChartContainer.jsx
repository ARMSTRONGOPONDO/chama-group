import { Card } from './Card';
import { cn } from '../../utils/helpers';

export function ChartContainer({ title, subtitle, children, className = '' }) {
  return (
    <Card className={cn('', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-bold text-gray-900">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="w-full min-h-[240px] flex items-center justify-center">
        {children}
      </div>
    </Card>
  );
}
