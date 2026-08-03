/**
 * Authentication API client.
 *
 * @remarks
 * All requests in this module use the shared axios instance.
 * Set `meta.requiresAuth` to control whether the auth interceptor attaches a token.
 */

import axiosInstance from "@/plugins/axios"
import type { ApiResponse, CustomAxiosRequestConfig } from "@/shared/models/api"

import type { LoginRequest, LoginResponse } from "../models/login.model"

/**
 * Authenticates a user with email and password.
 *
 * @param payload - Login credentials and optional remember-me flag.
 * @returns API envelope containing access and refresh tokens on success.
 */
export const requestLogin = async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const configRequest: CustomAxiosRequestConfig<LoginRequest> = {
    url: "/authentication/login",
    method: "POST",
    data: payload,
    meta: {
      requiresAuth: false,
    },
  }

  const { data } = await axiosInstance.request(configRequest)

  return data
}
