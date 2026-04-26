'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/', label: 'Overview' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/calls', label: 'Call Logs' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '200px',
      minHeight: '100vh',
      background: '#fff',
      borderRight: '1px solid #e8e8e6',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #f0f0ee' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px',
            background: '#0f0f0f',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '11px', fontWeight: 700,
          }}>M</div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f0f0f' }}>MediCall</span>
        </div>
      </div>

      <nav style={{ padding: '8px', flex: 1 }}>
        {nav.map(({ href, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{
              display: 'block',
              padding: '6px 8px',
              borderRadius: '5px',
              fontSize: '13px',
              fontWeight: active ? 500 : 400,
              color: active ? '#0f0f0f' : '#6b6b6b',
              background: active ? '#f5f5f4' : 'transparent',
              textDecoration: 'none',
              marginBottom: '1px',
            }}>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
