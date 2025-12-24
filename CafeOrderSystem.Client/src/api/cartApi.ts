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

interface AddToCartData {
  productId: number;
  quantity: number;
}

export const addToCart = async (data: AddToCartData) => {
  const payload = {
    ProductId: data.productId,
    Quantity: data.quantity,
  };
  const response = await api.post("/Cart/items", payload);
  return response.data;
};

export const getCart = async () => {
  const response = await api.get("/Cart");
  return response.data;
};

export const removeFromCart = async (productId: number) => {
  const response = await api.delete(`/Cart/items/${productId}`);
  return response.data;
};

export const updateCartItem = async (productId: number, quantity: number) => {
  const payload = { Quantity: quantity };
  const response = await api.put(`/Cart/items/${productId}`, payload);
  return response.data;
};
