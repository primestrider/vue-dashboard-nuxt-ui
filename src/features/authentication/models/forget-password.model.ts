/** Payload sent to initiate a password reset email. */
export type ForgetPasswordRequest = {
  email: string
}

/** Empty response body — success is indicated by the API envelope status. */
export type ForgetPasswordResponse = Record<string, never>
