import axiosInstance from '@/plugins/axios'
import type { ApiResponse, CustomAxiosRequestConfig } from '@/shared/models/api'
import type { AuthenticationRequestPayload } from '../models'

export const AuthenticationRequest = async (payload: AuthenticationRequestPayload): Promise<ApiResponse> => {
  const configRequest: CustomAxiosRequestConfig<AuthenticationRequestPayload> = {
    url: '/authentication/request',
    method: 'POST',
    data: payload,
    meta: {
      requiresAuth: true,
    },
  }
  const { data } = await axiosInstance.request(configRequest)
  return data
}
