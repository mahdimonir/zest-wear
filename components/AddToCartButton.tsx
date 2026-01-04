'use client';

import { useCartStore } from '@/lib/cart-store';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  size: string[];
  color: string[];
  hasVariants: boolean;
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.size.length > 0 ? product.size[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.color.length > 0 ? product.color[0] : undefined
  );
  
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
  };

  return (
    <div className="space-y-6">
      {/* Variants */}
      {product.hasVariants && (
        <div className="space-y-4">
          {product.size.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
              <div className="flex flex-wrap gap-2">
                {product.size.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedSize === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {product.color.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      selectedColor === c
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
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

      {/* Action Button */}
      <button
        onClick={handleAddToCart}
        disabled={product.quantity === 0}
        className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ShoppingCart className="w-5 h-5" />
        Add to Cart
      </button>
    </div>
  );
}
