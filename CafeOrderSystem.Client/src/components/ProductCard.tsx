import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../api/cartApi";

interface ProductProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  };
}

const ProductCard = ({ product }: ProductProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const userRole = localStorage.getItem("userRole");

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login page if not logged in
      navigate("/login");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
      });
      setMessage("Added to cart!");
      setTimeout(() => setMessage(null), 2000);
      // Notify navbar to update cart count
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      if (err.response?.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setMessage("Failed to add to cart");
        setTimeout(() => setMessage(null), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white border border-neutral-300 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:border-neutral-900">
      <div
        className="relative overflow-hidden aspect-square bg-neutral-50 cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.imageUrl}
          alt={product.imageUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      </div>
      <div className="p-6">
        <div
          className="flex justify-between items-start mb-3 cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          <h3 className="font-light text-lg text-neutral-900 tracking-wide hover:underline">
            {product.name}
          </h3>
          <p className="text-neutral-700 text-sm font-light">
            ${product.price.toFixed(2)}
          </p>
        </div>
        <p
          className="text-neutral-600 text-xs font-light leading-relaxed mb-4 line-clamp-2 cursor-pointer"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.description}
        </p>
        {userRole !== "Admin" && (
          <>
            {message && (
              <p
                className={`text-xs font-light mb-2 text-center ${
                  message.includes("Failed") ? "text-red-600" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-2.5 text-sm font-light tracking-wide hover:bg-neutral-800 active:bg-neutral-950 transition-all duration-300 cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed"
            >
              {loading ? "Adding..." : "Add to Cart"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
