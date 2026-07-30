export type LoginRequest = {
  email: string;
  password: string;
  remember_me?: boolean;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
};
