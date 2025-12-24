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

export const getProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const getProductById = async (id: number) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}) => {
  const payload = {
    Name: data.name,
    Description: data.description,
    Price: data.price,
    Category: data.category,
    ImageUrl: data.imageUrl,
  };
  console.log("Creating product with payload:", payload);
  const response = await api.post("/products", payload);
  return response.data;
};

export const updateProduct = async (
  id: number,
  data: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
  }
) => {
  const payload = {
    Name: data.name,
    Description: data.description,
    Price: data.price,
    Category: data.category,
    ImageUrl: data.imageUrl,
  };
  console.log("Updating product with payload:", payload);
  const response = await api.put(`/products/${id}`, payload);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};
