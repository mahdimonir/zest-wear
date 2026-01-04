import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function MyOrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    // Should not happen if sync is working, but safe fallback
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Not Found</h1>
          <p className="text-gray-600">Please try signing out and signing in again.</p>
        </div>
      </div>
    );
  }

  const orders = user.orders;

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-8">Start shopping to see your orders here.</p>
            <Link href="/" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order Placed</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="font-medium text-gray-900">৳{order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <div className="md:text-right">
                    <p className="text-sm text-gray-500 mb-1">Order #</p>
                    <p className="font-mono text-sm text-gray-900">{order.id.slice(-8)}</p>
                  </div>
                </div>

                {/* Preview Items */}
                <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 mb-6">
                  {order.items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0"
                      title={item.product.name}
                    >
                      {/* Note: In a real app, use optimized images */}
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex items-center justify-center w-16 h-16 bg-gray-50 rounded-md border border-gray-200 text-gray-500 text-sm font-medium">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/my-orders/${order.id}`}
                    className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
                  >
                    View Order Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
