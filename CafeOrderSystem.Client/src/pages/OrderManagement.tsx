import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders, updateOrderStatus } from "../api/orderApi";

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
  userName: string;
}

const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "Admin") {
      navigate("/");
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      const res = await getAllOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
      } else {
        setError("Failed to load orders");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingOrderId(orderId);
    setError(null);

    try {
      console.log("Updating order:", orderId, "to status:", newStatus);
      const res = await updateOrderStatus(orderId, newStatus);
      console.log("Response from backend:", res);

      if (res.success && res.order) {
        // Update the local state with the order object returned from backend
        setOrders(
          orders.map((order) =>
            order.id === orderId ? { ...order, ...res.order } : order
          )
        );
      } else {
        console.error("Update failed - response:", res);
        setError("Failed to update order status");
      }
    } catch (err: any) {
      console.error("Error updating order status:", err);
      console.error("Error response:", err.response);

      // If we get a 500 error, the database might still be updated
      // Reload the orders to sync with backend
      if (err.response?.status === 500) {
        console.log("Reloading orders due to 500 error...");
        await loadOrders();
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.message || "Failed to update order status"
        );
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCashPayment = (orderId: number) => {
    if (window.confirm("Confirm cash payment received?")) {
      handleStatusUpdate(orderId, "Paid");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";
      case "Paid":
        return "text-blue-600";
      case "Completed":
        return "text-green-600";
      case "Cancelled":
        return "text-red-600";
      case "Failed":
        return "text-red-700";
      default:
        return "text-neutral-900";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl font-light text-neutral-900 tracking-wide mb-8">
          Order Management
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white border border-neutral-300 p-8 text-center">
            <p className="text-neutral-600 font-light">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-neutral-300 p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-600 font-light">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-neutral-600 font-light">
                      Customer:{" "}
                      <span className="text-neutral-900">{order.userName}</span>
                    </p>
                    <p className="text-sm text-neutral-600 font-light">
                      {new Date(order.createdAt).toLocaleDateString()}{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p
                      className={`text-sm font-light mb-1 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      Status: {order.status}
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

                <div className="pt-4 border-t border-neutral-200 space-y-1 mb-4">
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

                {/* Action buttons based on order status */}
                {/* Pending orders - can pay or cancel */}
                {order.status === "Pending" && (
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => handleCashPayment(order.id)}
                      disabled={updatingOrderId === order.id}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.id ? "Updating..." : "Cash"}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(order.id, "Cancelled")}
                      disabled={updatingOrderId === order.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.id ? "Updating..." : "Cancel"}
                    </button>
                  </div>
                )}

                {/* Paid orders - can be completed or cancelled with refund */}
                {order.status === "Paid" && (
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => handleStatusUpdate(order.id, "Completed")}
                      disabled={updatingOrderId === order.id}
                      className="flex-1 bg-green-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.id
                        ? "Updating..."
                        : "Complete"}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(order.id, "Cancelled")}
                      disabled={updatingOrderId === order.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.id
                        ? "Updating..."
                        : "Cancel & Refund"}
                    </button>
                  </div>
                )}

                {/* Failed orders - can change payment method or cancel */}
                {order.status === "Failed" && (
                  <div className="flex gap-3 pt-4 border-t border-neutral-200">
                    <button
                      onClick={() => handleCashPayment(order.id)}
                      disabled={updatingOrderId === order.id}
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.id ? "Updating..." : "Cash"}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(order.id, "Cancelled")}
                      disabled={updatingOrderId === order.id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingOrderId === order.id ? "Updating..." : "Cancel"}
                    </button>
                  </div>
                )}

                {/* Completed orders - no actions available */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
