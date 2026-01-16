import axios from "axios";

const API = axios.create({
  baseURL: "https://ideal-yodel-7vww9gg9ppxqfwwxj-5000.app.github.dev/api",
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
