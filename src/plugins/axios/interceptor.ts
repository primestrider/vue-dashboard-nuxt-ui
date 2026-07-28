import type { AxiosError, AxiosInstance } from "axios"

import type { CustomAxiosRequestConfig } from "@/shared/models/api"

// import { useCookies } from '@vueuse/integrations/useCookies'

export function setupInterceptors(axiosInstance: AxiosInstance) {
  // const cookies = useCookies();

  axiosInstance.interceptors.request.use(
    (config) => {
      const customConfig = config as CustomAxiosRequestConfig
      const shouldAttachToken = customConfig.meta?.requiresAuth !== false

      // token from localStorage / cookies
      const authToken = localStorage.getItem("authToken")
      // const authToken = cookies.get("authToken");

      if (shouldAttachToken && authToken) {
        config.headers?.set?.("Authorization", `Bearer ${authToken}`)
      }

      return config
    },
    (error) => {
      console.error("Request error:", error)
      return Promise.reject(error)
    },
  )

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        // Server mengembalikan response error (misalnya 401, 500, dll)
        console.error("Response error:", {
          status: error.response.status,
          data: error.response.data,
        })
      } else if (error.request) {
        // Request sudah dikirim tapi tidak ada response
        console.error("No response from server:", error.request)
      } else {
        // Error lain saat setup request
        console.error("Axios config error:", error.message)
      }

      // bisa custom error object biar lebih clean
      return Promise.reject({
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      })
    },
  )
}
