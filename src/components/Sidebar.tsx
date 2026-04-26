'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/calls', label: 'Call Logs' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-52 min-h-screen flex flex-col border-r" style={{ background: '#fff', borderColor: '#e8e8e5' }}>
      <div className="px-5 py-5" style={{ borderBottom: '1px solid #e8e8e5' }}>
        <span className="font-semibold tracking-tight" style={{ color: '#1a1a1a', fontSize: '15px' }}>MediCall</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 rounded-md text-sm transition-colors"
              style={{
                color: isActive ? '#1a1a1a' : '#7a7a72',
                background: isActive ? '#f0efec' : 'transparent',
                fontWeight: isActive ? 500 : 400,
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
