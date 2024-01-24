import { AxiosError } from "axios";
import { ResponseDataType } from "../types/index";
import forbidden from "./hooks/forbidden";
import refreshToken from "./hooks/refreshToken";
import { ServerError } from "../types/error";

const handleError = (error: AxiosError<ResponseDataType>) => {
  const response = error.response?.data;
  if (response && response.message) {
    return Promise.reject(new ServerError(response.message));
  }
  return Promise.reject(error);
};

export default (error: AxiosError<ResponseDataType>) => {
  const statusCode = error.response?.status;
  const path = error.response?.config.url;
  switch (statusCode) {
    case 401:
      if (path?.startsWith("/users/auth")) {
        return handleError(error);
      }
      // 一些操作，例如：刷新令牌，如令牌刷新失败时退出到登录页面
      return refreshToken(error);
    case 403:
      return forbidden();
    default:
      return handleError(error);
  }
};
