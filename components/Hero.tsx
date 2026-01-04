'use client';

export default function Hero() {
  return (
    <div className="relative overflow-hidden py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30 blur-3xl"></div>
      
      <div className="relative max-w-6xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 animate-fade-in">
          Welcome to{" "}
          <span className="gradient-text-light">Zest Wear</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-slide-up">
          Discover premium products that elevate your lifestyle. From cutting-edge electronics to fashion-forward apparel.
        </p>
        
        <button
          onClick={() => {
            document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="btn-primary shadow-lg hover:shadow-xl active:scale-95"
        >
          Explore Collection
        </button>
      </div>
    </div>
  );
}
