import AddToCartButton from '@/components/AddToCartButton'; // I'll create this component to isolate client logic
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            {/* Image Section */}
            <div className="relative h-[400px] md:h-[600px] bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                {product.category && (
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm font-medium mb-3">
                    {product.category}
                  </span>
                )}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
                <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-blue-600">
                  ৳{product.price.toFixed(2)}
                </span>
                {product.quantity > 0 ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    In Stock ({product.quantity})
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    Out of Stock
                  </span>
                )}
              </div>

              <div className="border-t border-gray-100 pt-6">
                <AddToCartButton product={product} />
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-gray-500">
                <div>
                  <span className="block font-medium text-gray-900 mb-1">Free Shipping</span>
                  On orders over ৳5000
                </div>
                <div>
                  <span className="block font-medium text-gray-900 mb-1">Returns</span>
                  30 day return policy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
