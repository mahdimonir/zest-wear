'use client';

import { clsx } from 'clsx';
import { LayoutDashboard, Package, ShoppingBag, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const sidebarItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    label: 'Products',
    icon: Package,
    href: '/admin/products',
  },
  {
    label: 'Orders',
    icon: ShoppingBag,
    href: '/admin/orders',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)] hidden md:block">
      <div className="p-6">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Menu
        </h2>
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className={clsx('w-5 h-5', isActive ? 'text-blue-600' : 'text-gray-400')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-8">
          System
        </h2>
        <nav className="space-y-1">
            <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Store className="w-5 h-5 text-gray-400" />
                Storefront
            </Link>
        </nav>
      </div>
    </aside>
  );
}
