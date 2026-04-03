import axios from "axios";
export const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5001/api"
      : "https://chatify-8o6x-j72vu4kk6-adarshrajput0s-projects.vercel.app/api",
  withCredentials: true,
});
