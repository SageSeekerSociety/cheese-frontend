import Api, { ApiType } from "..";
import { API_BASE_URL } from "../utils";
import {
  responseInterceptor,
  requestInterceptorErr,
  requestInterceptor,
  responseInterceptorErr,
} from "../Interceptors";

const option: ApiType = {
  cfg: {
    baseURL: API_BASE_URL,
    timeout: 5000,
  },
  interceptor: {
    responseInterceptor,
    requestInterceptorErr,
    requestInterceptor,
    responseInterceptorErr,
  },
};

export default new Api(option);
