import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyOrders } from "../api/orderApi";

interface OrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  notes?: string;
  type: string;
  paymentMethod: string;
  failureReason?: string;
}

const MyOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await getMyOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 tracking-wide mb-8">
          My Orders
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white border border-neutral-300 p-8 text-center">
            <p className="text-neutral-600 font-light mb-4">No orders yet</p>
            <button
              onClick={() => navigate("/")}
              className="bg-neutral-900 text-white px-6 py-2 text-sm font-light tracking-wide hover:bg-neutral-800 transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-neutral-300 p-6"
              >
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-600 font-light">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-neutral-600 font-light">
                      {new Date(order.createdAt).toLocaleDateString()}{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600 font-light mb-1">
                      Status:{" "}
                      <span className="text-neutral-900">{order.status}</span>
                    </p>
                    <p className="text-lg text-neutral-900 font-light">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mb-4 space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-neutral-900 font-light">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="text-neutral-900 font-light">
                        ${(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-neutral-200 space-y-1">
                  <p className="text-sm text-neutral-600 font-light">
                    <span className="text-neutral-900">Type:</span>{" "}
                    {order.type === "DineIn" ? "Dine In" : "Takeaway"}
                  </p>
                  <p className="text-sm text-neutral-600 font-light">
                    <span className="text-neutral-900">Payment:</span>{" "}
                    {order.paymentMethod}
                  </p>
                  {order.notes && (
                    <p className="text-sm text-neutral-600 font-light">
                      <span className="text-neutral-900">Notes:</span>{" "}
                      {order.notes}
                    </p>
                  )}
                  {order.failureReason && (
                    <p className="text-sm text-red-600 font-light">
                      <span className="text-red-700 font-medium">
                        Payment Failed:
                      </span>{" "}
                      {order.failureReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
