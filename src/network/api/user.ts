import ApiInstance from "./index";
import { User } from "@/types/users";

export namespace UserApi {
  export interface LoginResponseDataType {
    user: User;
    accessToken: string;
  }

  export type RegisterResponseDataType = LoginResponseDataType;

  export const register = (data: {
    username: string;
    nickname: string;
    password: string;
    email: string;
    emailCode: string;
  }) =>
    ApiInstance.request<RegisterResponseDataType>({
      url: "/users",
      method: "POST",
      data,
      withCredentials: true,
    });

  export const login = (data: { username: string; password: string }) =>
    ApiInstance.request<LoginResponseDataType>({
      url: "/users/auth/login",
      method: "POST",
      data,
      withCredentials: true,
    });

  export const sendEmailCode = (email: string) =>
    ApiInstance.request({
      url: "/users/verify/email",
      method: "POST",
      data: { email },
    });

  export const refreshAccessToken = () =>
    ApiInstance.request<{ accessToken: string }>({
      url: "/users/auth/refresh-token",
      method: "POST",
      withCredentials: true,
    });

  export const recoverPasswordRequest = (email: string) =>
    ApiInstance.request({
      url: "/users/recover/password/request",
      method: "POST",
      data: { email },
    });

  export const recoverPasswordVerify = (data: {
    token: string;
    newPassword: string;
  }) =>
    ApiInstance.request({
      url: "/users/recover/password/verify",
      method: "POST",
      data: {
        token: data.token,
        new_password: data.newPassword,
      },
    });
}
