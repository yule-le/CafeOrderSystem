import { useEffect, useState } from "react";
import { getProducts } from "../api/productApi";
import ProductCard from "../components/ProductCard";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getProducts()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
          console.error("API returned unexpected format:", res);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-400 mx-auto mb-4"></div>
          <p className="text-stone-500 text-sm font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="text-center">
          <p className="text-stone-500 text-sm font-light">{error}</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-stone-50">
        <div className="text-center">
          <p className="text-stone-500 text-sm font-light">
            No products available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 min-h-screen">
      {/* Hero Section */}
      <div className="bg-neutral-800 border-b border-neutral-700 py-12 sm:py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-neutral-100 mb-3 sm:mb-4 tracking-wide">
            Our Collection
          </h1>
          <p className="text-neutral-300 font-light text-sm sm:text-base max-w-md mx-auto px-4">
            Carefully curated selections for your daily moments
          </p>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
