export enum AuthenticationPageName {
  LOGIN = "Login",
  FORGET_PASSWORD = "ForgetPassword",
  RESET_PASSWORD = "ResetPassword",
}

export type AuthenticationRequestPayload = {
  name: string
}
