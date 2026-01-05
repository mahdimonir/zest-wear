import TableSearch from '@/components/admin/TableSearch';
import Pagination from '@/components/ui/Pagination';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';
import Link from 'next/link';

async function deleteProduct(formData: FormData) {
  'use server';
  const id = formData.get('id');
  if (id) {
    await prisma.product.delete({
      where: { id: parseInt(id.toString()) },
    });
    revalidatePath('/admin/products');
  }
}

interface Props {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function AdminProductsPage(props: Props) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const query = searchParams?.search || '';
  const category = searchParams?.category || '';
  const pageSize = 10;

  const where: Prisma.ProductWhereInput = {
    AND: [
      category ? { category } : {},
      query
        ? {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  const [products, totalItems, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      where: { category: { not: '' } }, // Helper to get distinct categories
    }),
  ]);

  const uniqueCategories = categories
    .map((c) => c.category)
    .filter((c): c is string => !!c);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <TableSearch
        placeholder="Search products..."
        filters={[
          {
            key: 'category',
            label: 'Category',
            options: uniqueCategories.map((c) => ({
              label: c,
              value: c,
            })),
          },
        ]}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-sm font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                           <Image
                             src={product.imageUrl}
                             alt={product.name}
                             fill
                             className="object-cover"
                           />
                        ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
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
                    {product.category || 'Uncategorized'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ৳{product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded text-xs font-medium ${
                        product.quantity > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.quantity} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <form action={deleteProduct}>
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
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Pagination
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={currentPage}
      />
    </div>
  );
}
