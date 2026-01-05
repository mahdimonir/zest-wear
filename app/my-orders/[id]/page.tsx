import { prisma } from '@/lib/prisma';
import { getStatusColor } from '@/lib/utils';
import { auth } from '@clerk/nextjs/server';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

async function getOrder(orderId: string, userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) return null;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Access control: Ensure order belongs to current user
    if (!order || order.userId !== user.id) {
      return null;
    }

    return order;
  } catch (error) {
    console.error('Failed to fetch order:', error);
    return null;
  }
}

export default async function MyOrderDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const params = await props.params;
  const order = await getOrder(params.id, userId);

  if (!order) {
    notFound();
  }

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Back Link */}
        <Link
          href="/my-orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Orders
        </Link>

        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(-8)}</h1>
            <span
                className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}
            >
                {order.status}
            </span>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Order ID</p>
              <p className="font-medium text-gray-900">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium text-gray-900">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Items</p>
              <p className="font-medium text-gray-900">{order.items.length}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-600 mb-2">Estimated Delivery</p>
            <p className="font-medium text-gray-900">
              {estimatedDelivery.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
          <div className="text-gray-700">
            <p className="font-medium">{(order.shippingAddress as any).fullName}</p>
            <p>{(order.shippingAddress as any).addressLine1}</p>
            {(order.shippingAddress as any).addressLine2 && (
              <p>{(order.shippingAddress as any).addressLine2}</p>
            )}
            <p>
              {(order.shippingAddress as any).city}, {(order.shippingAddress as any).postalCode}
            </p>
            <p>{(order.shippingAddress as any).country}</p>
            <p className="mt-2">
              <span className="text-gray-600">Phone:</span> {(order.shippingAddress as any).phone}
            </p>
            <p>
              <span className="text-gray-600">Email:</span> {(order.shippingAddress as any).email}
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-6 py-6 last:pb-0 first:pt-0">
                <div className="relative w-24 h-24 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate pr-4">
                        {item.product.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.selectedSize && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-50 text-xs font-medium text-gray-600 border border-gray-100">
                            Color: {item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-500">
                      Qty: <span className="font-medium text-gray-900">{item.quantity}</span> × ৳{item.price.toFixed(2)}
                    </p>
                    {/* Future: Add 'Buy Again' or 'Review' buttons here */}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Order Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span className="text-blue-600">৳{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
