import OrderStatusUpdater from '@/components/admin/OrderStatusUpdater';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';

interface AdminOrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminOrderDetailsPage(props: AdminOrderDetailsPageProps) {
  const params = await props.params;
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
          <p className="text-gray-600">ID: {order.id}</p>
        </div>
        
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.selectedSize && `Size: ${item.selectedSize}`}
                      {item.selectedSize && item.selectedColor && ' • '}
                      {item.selectedColor && `Color: ${item.selectedColor}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">৳{item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Payment Summary</h2>
            </div>
            <div className="p-6 space-y-3">
               <div className="flex justify-between text-gray-600">
                <span>Payment Method</span>
                <span className="font-medium text-gray-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Subtotal (Estimate)</span>
                {/* Re-calculating subtotal since I didn't store it separately, only total */}
                 <span>৳{(order.total / 1.05).toFixed(2)}</span>
              </div>
               <div className="flex justify-between text-gray-600">
                <span>Tax (5%)</span>
                <span>৳{(order.total - (order.total / 1.05)).toFixed(2)}</span>
              </div>
               <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-900">
                <span>Total</span>
                <span className="text-blue-600">৳{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Customer</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-medium text-gray-900">
                  {order.user?.name || (order.shippingAddress as any).fullName || 'Guest'}
                </p>
              </div>
               <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900">
                  {order.user?.email || (order.shippingAddress as any).email}
                </p>
              </div>
               <div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <p className="font-medium text-gray-900">
                  {(order.shippingAddress as any).phone}
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
            </div>
             <div className="p-6 text-gray-700">
                <p>{(order.shippingAddress as any).addressLine1}</p>
                {(order.shippingAddress as any).addressLine2 && (
                  <p>{(order.shippingAddress as any).addressLine2}</p>
                )}
                <p>
                  {(order.shippingAddress as any).city}, {(order.shippingAddress as any).postalCode}
                </p>
                <p>{(order.shippingAddress as any).country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
