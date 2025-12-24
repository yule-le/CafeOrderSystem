import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder } from "../api/orderApi";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../components/StripePaymentForm";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartId } = location.state || {};
  const [formData, setFormData] = useState({
    orderType: "DineIn",
    paymentMethod: "Cash",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethodId, setPaymentMethodId] = useState<string | null>(null);

  // Reset payment method ID when switching away from Credit Card
  useEffect(() => {
    if (formData.paymentMethod !== "CreditCard") {
      setPaymentMethodId(null);
    }
  }, [formData.paymentMethod]);

  const handleStripeSuccess = (pmId: string) => {
    setPaymentMethodId(pmId);
    setError(null);
  };

  const handleStripeError = (errorMsg: string) => {
    setError(errorMsg);
    setPaymentMethodId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartId) {
      setError("Invalid cart. Please go back to your cart and try again.");
      return;
    }

    // If Credit Card is selected, ensure we have a payment method ID
    if (formData.paymentMethod === "CreditCard" && !paymentMethodId) {
      setError(
        "Please complete your card information before placing the order."
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createOrder({
        cartId,
        orderType: formData.orderType,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
        paymentMethodId: paymentMethodId || undefined,
      });

      if (res.success) {
        // Notify navbar to update cart count (backend already cleared the cart)
        window.dispatchEvent(new Event("cartUpdated"));
        alert("Order placed successfully!");
        navigate("/my-orders");
      }
    } catch (err: any) {
      console.error("Order creation error:", err);
      console.error("Error response:", err.response?.data);
      console.error("Validation errors:", err.response?.data?.errors);
      console.error("Error status:", err.response?.status);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.title ||
          JSON.stringify(err.response?.data?.errors || err.response?.data) ||
          "Failed to place order";
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 tracking-wide mb-8">
          Checkout
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-neutral-300 p-6"
        >
          <div className="mb-6">
            <label className="block text-sm font-light text-neutral-900 mb-2">
              Order Type
            </label>
            <select
              value={formData.orderType}
              onChange={(e) =>
                setFormData({ ...formData, orderType: e.target.value })
              }
              className="w-full border border-neutral-300 px-3 py-2 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-500"
            >
              <option value="DineIn">Dine In</option>
              <option value="TakeAway">Takeaway</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-light text-neutral-900 mb-2">
              Payment Method
            </label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              className="w-full border border-neutral-300 px-3 py-2 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-500"
            >
              <option value="Cash">Cash</option>
              <option value="CreditCard">Credit Card</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-light text-neutral-900 mb-2">
              Order Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={4}
              placeholder="Any special requests or delivery instructions..."
              className="w-full border border-neutral-300 px-3 py-2 text-sm font-light text-neutral-900 focus:outline-none focus:border-neutral-500 resize-none"
            />
          </div>

          {/* Stripe Payment Form - Only show when Credit Card is selected */}
          {formData.paymentMethod === "CreditCard" && stripePromise && (
            <div className="mb-6">
              <label className="block text-sm font-light text-neutral-900 mb-3">
                Card Information
              </label>
              <Elements stripe={stripePromise}>
                <StripePaymentForm
                  onSuccess={handleStripeSuccess}
                  onError={handleStripeError}
                />
              </Elements>
              {paymentMethodId && (
                <p className="text-xs text-green-600 mt-2">✓ Card validated</p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate("/cart")}
              disabled={loading}
              className="flex-1 bg-neutral-200 text-neutral-900 py-3 text-sm font-light tracking-wide hover:bg-neutral-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-neutral-900 text-white py-3 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Place Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
