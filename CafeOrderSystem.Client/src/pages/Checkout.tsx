import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createOrder } from "../api/orderApi";
import { createPaymentIntent } from "../api/paymentApi";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripePaymentForm from "../components/StripePaymentForm";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "",
  {
    locale: "en", // Force English error messages
  }
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
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"order" | "payment">("order");

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cartId) {
      setError("Invalid cart. Please go back to your cart and try again.");
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
      });

      const createdOrderId = res.order.id;

      // If payment method is Credit Card, create payment intent
      if (formData.paymentMethod === "CreditCard") {
        const paymentIntent = await createPaymentIntent(createdOrderId);
        setClientSecret(paymentIntent.clientSecret);
        setPaymentStep("payment");
      } else {
        // For cash payment, order is complete
        window.dispatchEvent(new Event("cartUpdated"));
        alert("Order placed successfully!");
        navigate("/my-orders");
      }
    } catch (err: any) {
      console.error("Order creation error:", err);

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

  const handlePaymentSuccess = () => {
    // Payment confirmed by Stripe
    // Webhook will update order status on backend
    window.dispatchEvent(new Event("cartUpdated"));
    alert("Payment successful! Your order is being processed.");
    navigate("/my-orders");
  };

  const handlePaymentError = (errorMsg: string) => {
    setError(errorMsg);
  };

  return (
    <div className="min-h-screen bg-neutral-100 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 tracking-wide mb-8">
          {paymentStep === "order" ? "Checkout" : "Payment"}
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {paymentStep === "order" ? (
          <form
            onSubmit={handleCreateOrder}
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
                {loading ? "Processing..." : "Continue"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white border border-neutral-300 p-6">
            <h2 className="text-xl font-light text-neutral-900 mb-6">
              Complete Your Payment
            </h2>
            {clientSecret && stripePromise && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripePaymentForm
                  clientSecret={clientSecret}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
