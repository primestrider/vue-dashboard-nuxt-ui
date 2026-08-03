/** Payload sent to complete a password reset flow. */
export type ResetPasswordRequest = {
  password: string
  confirm_password: string
  /** One-time token delivered via email or reset link query param. */
  reset_token: string
}

/** Empty response body — success is indicated by the API envelope status. */
export type ResetPasswordResponse = Record<string, never>
