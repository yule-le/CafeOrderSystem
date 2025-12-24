import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCart, removeFromCart, updateCartItem } from "../api/cartApi";

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  quantity: number;
}

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cartData = await getCart();

      // Map backend response to frontend format
      if (cartData?.items && Array.isArray(cartData.items)) {
        setCartId(cartData.id || cartData.Id || null);
        const mappedItems = cartData.items.map((item: any) => ({
          id: item.id || item.Id,
          productId: item.productId || item.ProductId,
          productName: item.productName || item.ProductName,
          productPrice: item.price || item.Price || 0,
          productImageUrl: item.imageUrl || item.ImageUrl || "/placeholder.jpg",
          quantity: item.quantity || item.Quantity || 1,
        }));
        setCartItems(mappedItems);
      } else if (Array.isArray(cartData)) {
        const mappedItems = cartData.map((item: any) => ({
          id: item.id || item.Id,
          productId: item.productId || item.ProductId,
          productName: item.productName || item.ProductName,
          productPrice: item.price || item.Price || 0,
          productImageUrl: item.imageUrl || item.ImageUrl || "/placeholder.jpg",
          quantity: item.quantity || item.Quantity || 1,
        }));
        setCartItems(mappedItems);
      } else {
        setCartItems([]);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await updateCartItem(itemId, newQuantity);
      setCartItems((items) =>
        items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      // Notify navbar to update cart count
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to update quantity");
      }
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    if (!window.confirm("Remove this item from cart?")) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      await removeFromCart(itemId);
      setCartItems((items) => items.filter((item) => item.id !== itemId));
      // Notify navbar to update cart count
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to remove item");
      }
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    navigate("/checkout", { state: { cartId } });
  };

  const total = cartItems.reduce(
    (sum, item) => sum + (item.productPrice || 0) * (item.quantity || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600">Loading cart...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 tracking-wide mb-8">
          Shopping Cart
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white border border-neutral-300 p-8 text-center">
            <p className="text-neutral-600 font-light mb-4">
              Your cart is empty
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-neutral-900 text-white px-6 py-2 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white border border-neutral-300 mb-6">
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex gap-4 p-4 sm:p-6 ${
                    index !== cartItems.length - 1
                      ? "border-b border-neutral-200"
                      : ""
                  } ${updatingItems.has(item.id) ? "opacity-50" : ""}`}
                >
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover"
                  />
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-light text-neutral-900 mb-1">
                        {item.productName || "Unknown Product"}
                      </h3>
                      <p className="text-neutral-700 text-sm font-light">
                        ${(item.productPrice || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-neutral-300">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={
                            updatingItems.has(item.id) || item.quantity <= 1
                          }
                          className="px-3 py-1 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          −
                        </button>
                        <span className="px-4 py-1 text-neutral-900 font-light min-w-12 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={updatingItems.has(item.id)}
                          className="px-3 py-1 hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <p className="text-neutral-900 font-light min-w-20 text-right">
                        $
                        {(
                          (item.productPrice || 0) * (item.quantity || 0)
                        ).toFixed(2)}
                      </p>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={updatingItems.has(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-light hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-neutral-300 p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-light text-neutral-900">
                  Total:
                </span>
                <span className="text-2xl font-light text-neutral-900">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-neutral-200 text-neutral-900 py-3 text-sm font-light tracking-wide hover:bg-neutral-300 transition-colors"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleCheckout}
                  className="flex-1 bg-neutral-900 text-white py-3 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
