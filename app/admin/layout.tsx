import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { LayoutDashboard, LogOut, Package, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

async function checkAdminAccess() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  return user;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdminAccess();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold gradient-text-light mb-8">Admin Panel</h2>
            
            <nav className="space-y-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link
                href="/admin/products"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Products</span>
              </Link>
              
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Orders</span>
              </Link>
            </nav>

            <div className="mt-8 pt-8 border-t border-gray-200">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-blue-600"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Back to Store</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
