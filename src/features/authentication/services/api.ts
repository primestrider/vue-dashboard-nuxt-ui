import axiosInstance from "@/plugins/axios";
import type { ApiResponse, CustomAxiosRequestConfig } from "@/shared/models/api";
import type { LoginRequest, LoginResponse } from "../models/login.model";

export const requestLogin = async (payload: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const configRequest: CustomAxiosRequestConfig<LoginRequest> = {
    url: "/authentication/login",
    method: "POST",
    data: payload,
    meta: {
      requiresAuth: false,
    },
  };

  const { data } = await axiosInstance.request(configRequest);

  return data;
};
