import { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiPieChart,
  FiDollarSign,
  FiCreditCard,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiBell,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { Dropdown, DropdownItem, DropdownDivider } from '../components/ui/Dropdown';
import { cn } from '../utils/helpers';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { path: '/members', label: 'Members', icon: FiUsers },
  { path: '/savings', label: 'Savings', icon: FiPieChart },
  { path: '/loans', label: 'Loans', icon: FiDollarSign },
  { path: '/repayments', label: 'Repayments', icon: FiCreditCard },
  { path: '/reports', label: 'Reports', icon: FiBarChart2 },
  { path: '/settings', label: 'Settings', icon: FiSettings },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7FF]">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          {!sidebarCollapsed && (
            <Link to="/dashboard" className="text-xl font-bold text-[#7C3AED]">
              Chama Manager
            </Link>
          )}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            className="p-2 rounded-lg text-gray-500 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth font-medium',
                    location.pathname === item.path && 'bg-[#C4B5FD]/30 text-[#7C3AED]'
                  )}
                >
                  <item.icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <div
        className={cn(
          'flex-1 flex flex-col min-h-screen transition-all duration-300',
          sidebarCollapsed ? 'ml-[72px]' : 'ml-64'
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm hidden sm:block">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 rounded-lg text-gray-500 hover:bg-[#F8F7FF] hover:text-[#7C3AED] transition-smooth relative"
              aria-label="Notifications"
            >
              <FiBell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#7C3AED] rounded-full" />
            </button>
            <Dropdown
              trigger={
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#F8F7FF] transition-smooth cursor-pointer">
                  <div className="w-8 h-8 rounded-full bg-[#C4B5FD] flex items-center justify-center text-[#7C3AED] font-bold">
                    {(user?.name || 'U')[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">
                    {user?.name || 'User'}
                  </span>
                </div>
              }
              align="right"
            >
              <DropdownItem onClick={() => navigate('/member-dashboard')}>
                My Dashboard
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem onClick={handleLogout} icon={FiLogOut}>
                Logout
              </DropdownItem>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
