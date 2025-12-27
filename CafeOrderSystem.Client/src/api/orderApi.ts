import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7059/api",
});

// Add authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createOrder = async (data: {
  cartId: number;
  orderType: string;
  paymentMethod: string;
  notes?: string;
  paymentMethodId?: string;
}) => {
  const payload = {
    CartId: data.cartId,
    Notes: data.notes || null,
    Type: data.orderType,
    PaymentMethod: data.paymentMethod,
    PaymentMethodId: data.paymentMethodId || null,
  };
  const response = await api.post("/Orders", payload);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get("/Orders/my-orders");
  return response.data;
};

export const getAllOrders = async () => {
  const response = await api.get("/Orders");
  return response.data;
};

export const updateOrderStatus = async (orderId: number, newStatus: string) => {
  const response = await api.patch(`/Orders/${orderId}/status`, newStatus, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
