/** Payload sent to the login endpoint. */
export type LoginRequest = {
  email: string
  password: string
  /** When true, the session may be persisted longer by the backend. */
  remember_me?: boolean
}

/** Token pair returned after a successful login. */
export type LoginResponse = {
  access_token: string
  refresh_token: string
}
