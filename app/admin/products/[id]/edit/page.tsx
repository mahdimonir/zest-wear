import ProductForm from '@/components/admin/ProductForm';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Product</h1>
      <ProductForm initialData={product} />
    </div>
  );
}
