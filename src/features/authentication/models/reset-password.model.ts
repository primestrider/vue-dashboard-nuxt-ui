export type ResetPasswordRequest = {
  password: string;
  confirm_password: string;
  reset_token: string;
};

export type ResetPasswordResponse = {};
