"use client";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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
  createdAt: Date;
}
interface Props {
  product: Product;
  onDelete: (formData: FormData) => void;
  onEdit: (product: Product) => void;
}
export default function ExpandableProductRow({
  product,
  onDelete,
  onEdit,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                  No Img
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{product.name}</p>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {product.description}
              </p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {product.category || "Uncategorized"}
        </td>
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          ৳{product.price.toFixed(2)}
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
              product.quantity > 0
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {product.quantity} in stock
          </span>
        </td>
        <td
          className="px-6 py-4 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <form action={onDelete}>
              <input type="hidden" name="id" value={product.id} />
              <button
                type="submit"
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  Full Description
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
              {}
              <div className="space-y-4">
                {product.hasVariants && (
                  <>
                    {product.size.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Available Sizes
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.size.map((s) => (
                            <span
                              key={s}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {product.color.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Available Colors
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {product.color.map((c) => (
                            <span
                              key={c}
                              className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm text-gray-700"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
                {}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Product Details
                  </h4>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-gray-500">Product ID:</dt>
                    <dd className="text-gray-900 font-medium">#{product.id}</dd>
                    <dt className="text-gray-500">Created:</dt>
                    <dd className="text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </dd>
                    <dt className="text-gray-500">Has Variants:</dt>
                    <dd className="text-gray-900">
                      {product.hasVariants ? "Yes" : "No"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
