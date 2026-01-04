'use client';

import Link from 'next/link';

import { useCartStore } from '@/lib/cart-store';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
  category: string | null;
  size: string[];
  color: string[];
  hasVariants: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.size.length > 0 ? product.size[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.color.length > 0 ? product.color[0] : undefined
  );
  
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (product.hasVariants && product.size.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (product.hasVariants && product.color.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      selectedSize,
      selectedColor,
    });

    toast.success(`${product.name} added to cart!`);
    
    setTimeout(() => {
      router.push('/cart');
    }, 500);
  };

  return (
    <div className="card-light overflow-hidden group">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block relative h-64 w-full overflow-hidden bg-gray-100">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.category && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 border border-gray-200">
            {product.category}
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-6">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Stock Quantity */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${product.quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-700 font-medium">
            {product.quantity > 0 ? `In Stock: ${product.quantity}` : 'Out of Stock'}
          </span>
        </div>

        {/* Variants */}
        {product.hasVariants && (
          <div className="mb-4 space-y-3">
            {product.size.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-2">Size:</label>
                <div className="flex flex-wrap gap-2">
                  {product.size.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`text-xs px-3 py-1.5 rounded border transition-all ${
                        selectedSize === s
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {product.color.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-2">Color:</label>
                <div className="flex flex-wrap gap-2">
                  {product.color.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`text-xs px-3 py-1.5 rounded border transition-all ${
                        selectedColor === c
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-700 hover:border-blue-400'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Price and Action */}
        <div className="flex items-center justify-between mt-4">
          <span className="text-2xl font-bold text-blue-600">
            ৳{product.price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-500 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={product.quantity === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
