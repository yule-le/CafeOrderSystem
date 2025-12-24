import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://localhost:7059/api",
});

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  username: string;
  password: string;
}

export const register = async (data: RegisterData) => {
  const response = await api.post("/Auth/register", data);
  return response.data;
};

export const login = async (data: LoginData) => {
  const response = await api.post("/Auth/login", data);
  return response.data;
};
