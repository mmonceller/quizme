import { NavLink, Outlet, useNavigate } from 'react-router';
import { Home, LogOut, User as UserIcon, Users } from 'lucide-react';
import { useUser, useAuth } from '@/context/AuthContext';
import { Avatar, Menu } from '@/components/ui';
import { cn, fullName } from '@/lib/utils';
import { Logo } from './Logo';

const NAV = [
  { to: '/', label: 'Library', icon: Home, end: true },
  { to: '/shared', label: 'Shared with me', icon: Users, end: false },
  { to: '/account', label: 'Account', icon: UserIcon, end: false },
];

export function AppShell() {
  const user = useUser();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-8 px-4 sm:px-8">
          <Logo />
          <nav className="hidden h-full flex-1 items-stretch gap-6 sm:flex">
            {NAV.slice(0, 2).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    '-mb-px flex items-center border-b-2 text-sm transition-colors',
                    isActive
                      ? 'border-brand-700 font-medium text-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 md:block">{fullName(user)}</span>
            <Menu
              trigger={<Avatar user={user} size={32} />}
              items={[
                { label: 'Account settings', icon: <UserIcon />, onClick: () => navigate('/account') },
                {
                  label: 'Log out',
                  icon: <LogOut />,
                  danger: true,
                  onClick: async () => {
                    await logout();
                    navigate('/login');
                  },
                },
              ]}
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>

      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-slate-200 bg-white sm:hidden">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', isActive ? 'text-brand-700' : 'text-slate-500')
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label.replace(' with me', '')}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
