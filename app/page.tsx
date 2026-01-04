import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen">
      <Hero />
      
      <section id="products" className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
          Our <span className="gradient-text-light">Premium Collection</span>
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white border border-gray-200 inline-block px-8 py-6 rounded-xl shadow-sm">
              <p className="text-xl text-gray-900 mb-2">No products available yet</p>
              <p className="text-sm text-gray-600">Please add your NeonDB connection string and run the seed script</p>
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
