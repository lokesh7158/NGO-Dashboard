import axios from "axios";

const base_url = (import.meta.env.VITE_BASE_URL as string) || "http://localhost:5000";

const API = axios.create({
  baseURL: `${base_url}/api`,
});

// Attach JWT automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token && req.headers) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
