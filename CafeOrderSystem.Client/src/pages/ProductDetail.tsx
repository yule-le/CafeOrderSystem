import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../api/productApi";
import { addToCart } from "../api/cartApi";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getProductById(parseInt(id))
        .then((res) => {
          if (res.success && res.data) {
            setProduct(res.data);
          } else {
            setError("Product not found");
          }
        })
        .catch(() => {
          setError("Failed to load product");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    setCartMessage(null);

    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
      });
      setCartMessage("Added to cart!");
      setTimeout(() => setCartMessage(null), 2000);
      // Notify navbar to update cart count
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setCartMessage("Failed to add to cart");
        setTimeout(() => setCartMessage(null), 2000);
      }
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="text-neutral-900 hover:underline"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => navigate("/")}
          className="text-neutral-700 hover:text-neutral-900 mb-6 text-sm font-light"
        >
          ← Back to Products
        </button>

        <div className="bg-white border border-neutral-300 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            <div className="aspect-square bg-neutral-50">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 mb-4 tracking-wide">
                  {product.name}
                </h1>
                <p className="text-2xl text-neutral-700 font-light mb-6">
                  ${product.price.toFixed(2)}
                </p>
                <p className="text-neutral-600 font-light leading-relaxed mb-8">
                  {product.description}
                </p>
              </div>

              <div>
                {cartMessage && (
                  <p
                    className={`text-sm font-light mb-3 ${
                      cartMessage.includes("Failed")
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {cartMessage}
                  </p>
                )}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full bg-neutral-900 text-white py-3 text-sm font-light tracking-wide hover:bg-neutral-800 active:bg-neutral-950 transition-all duration-300 cursor-pointer disabled:bg-neutral-400 disabled:cursor-not-allowed"
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
