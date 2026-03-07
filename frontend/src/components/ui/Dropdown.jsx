import { useState, useRef, useEffect } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '../../utils/helpers';

export function Dropdown({ trigger, children, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignClass = align === 'right' ? 'right-0' : 'left-0';

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 py-1 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-150',
            alignClass
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children, onClick, className = '', icon: Icon }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e);
      }}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth',
        className
      )}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function DropdownDivider() {
  return <div className="my-1 border-t border-gray-100" />;
}
