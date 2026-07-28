import axios from "axios"

import { setupInterceptors } from "./interceptor"

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30 * 10000, // 30 seconds
})

setupInterceptors(axiosInstance)

export default axiosInstance
