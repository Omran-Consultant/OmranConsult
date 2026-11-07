export type ApiHealthResponse = {
  status: "ok";
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export type AdminUserResponse = {
  user: AdminUser;
};

export type AdminLogoutResponse = {
  message: string;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
};
