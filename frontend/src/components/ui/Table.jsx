import { cn } from '../../utils/helpers';

export function Table({ children, className = '' }) {
  return (
    <div className={cn('overflow-x-auto rounded-xl border border-gray-200', className)}>
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <thead className={cn('bg-[#F8F7FF] text-gray-600 uppercase text-xs font-semibold', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={cn('hover:bg-[#F8F7FF]/50 transition-smooth', className)}>
      {children}
    </tr>
  );
}

export function Th({ children, className = '' }) {
  return (
    <th className={cn('px-6 py-4 whitespace-nowrap', className)} scope="col">
      {children}
    </th>
  );
}

export function Td({ children, className = '' }) {
  return <td className={cn('px-6 py-4', className)}>{children}</td>;
}
