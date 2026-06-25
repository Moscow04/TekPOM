'use client';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/lib/api';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'My Projects', href: '/projects', icon: '📁' },
  { label: 'Product', href: '/products', icon: '🎨' },
  { label: 'Engineering', href: '/engineering', icon: '⚙️' },
  { label: 'Brand', href: '/brand', icon: '🏷️' },
  { label: 'Business Analysis', href: '/business-analysis', icon: '📈' },
  { label: 'CAB', href: '/cab', icon: '✅' },
  { label: 'Back Office', href: '/back-office', icon: '🏢' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) router.push('/login');
  }, [router]);

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className={`${collapsed ? 'w-16' : 'w-56'} bg-white border-r flex flex-col transition-all duration-200`}>
        <div className="p-4 border-b">
          <h2 className="font-bold text-blue-600 truncate">{collapsed ? 'TPM' : 'TekTariq PM'}</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${pathname?.startsWith(item.href) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <span>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-2 border-t">
          <button onClick={() => { setAuthToken(null); router.push('/login'); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
            {collapsed ? '🚪' : 'Sign out'}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}
