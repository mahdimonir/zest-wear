import ProductMainSection from "@/components/product/ProductMainSection";
import ProductTabs from "@/components/ProductTabs";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { notFound } from "next/navigation";
const getProduct = unstable_cache(
  async (id: number) => {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
      },
    });
  },
  ["product-detail"],
  { revalidate: 600, tags: ["products"] },
);
const getReviewStats = unstable_cache(
  async (productId: number) => {
    const aggregations = await prisma.review.aggregate({
      where: { productId },
      _count: true,
      _avg: {
        rating: true,
      },
    });
    const reviews = await prisma.review.findMany({
      where: { productId },
      select: { rating: true, id: true },
      take: 100,
    });
    return { aggregations, reviews };
  },
  ["review-stats"],
  { revalidate: 300, tags: ["reviews"] },
);
export default async function ProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const productId = parseInt(params.id);
  if (isNaN(productId)) notFound();
  const [product, stats] = await Promise.all([
    getProduct(productId),
    getReviewStats(productId),
  ]);
  if (!product) {
    notFound();
  }
  const productWithReviews = {
    ...product,
    reviews: stats.reviews,
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {}
        <ProductMainSection product={productWithReviews} />
        {}
        <ProductTabs
          product={productWithReviews}
          reviewCount={stats.aggregations._count}
        />
      </div>
    </div>
  );
}
