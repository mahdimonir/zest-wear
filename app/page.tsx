import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductHeroSlider from "@/components/ProductHeroSlider";
import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
const getFeaturedProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      where: {
        imageUrl: { not: "" },
        quantity: { gt: 0 },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        imageUrl: true,
        category: true,
      },
    });
  },
  ["featured-products"],
  { revalidate: 3600, tags: ["products"] },
);
const getLatestProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        quantity: true,
        imageUrl: true,
        category: true,
        images: {
          select: {
            color: true,
            url: true,
          },
        },
        size: true,
        color: true,
        hasVariants: true,
      },
    });
  },
  ["latest-products"],
  { revalidate: 600, tags: ["products"] },
);
export default async function Home() {
  const [featuredProducts, products] = await Promise.all([
    getFeaturedProducts(),
    getLatestProducts(),
  ]);
  return (
    <main className="min-h-screen">
      <ProductHeroSlider products={featuredProducts} />
      <section id="products" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Our <span className="gradient-text-light">Premium Collection</span>
        </h2>
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white border border-gray-200 inline-block px-8 py-6 rounded-xl shadow-sm">
              <p className="text-xl text-gray-900 mb-2">
                No products available yet
              </p>
              <p className="text-sm text-gray-600">
                Please add your NeonDB connection string and run the seed script
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
