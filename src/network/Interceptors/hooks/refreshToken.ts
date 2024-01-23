import { AxiosError } from "axios";
import { ResponseDataType } from "../../types";
import { Local } from "../../utils/storage";
import ApiInstance from "../../api";
import { messageFailed } from "../../utils/showMessage";
import { UserApi } from "../../api/user";
import { useRouter } from "vue-router";

const MAX_ERROR_COUNT = 5;
let currentCount = 0;
const queue: ((t: string) => any)[] = [];
let isRefreshing = false;
const router = useRouter();
/*
如使用react-router / vue-route请将 `window.location.replace('/login')` 推荐替换对应Api方法
*/
export default async function refreshToken(
  error: AxiosError<ResponseDataType>
) {
  if (!error.config) return Promise.reject(error);
  const logout = () => {
    messageFailed("身份过期，请重新登录");
    router.replace("/account/signin");
    Local.clear();
    return Promise.reject(error);
  };
  if (error.config?.url?.includes("refresh")) {
    logout();
  }
  const { config } = error;
  if (!isRefreshing) {
    isRefreshing = true;
    if (currentCount > MAX_ERROR_COUNT) {
      logout();
    }
    currentCount += 1;

    try {
      const {
        data: { accessToken },
      } = await UserApi.refreshAccessToken();
      Local.set("accessToken", accessToken);
      currentCount = 0;
      // 重新请求
      queue.forEach((cb) => cb(accessToken));
      return ApiInstance.request(error.config);
    } catch {
      messageFailed("请重新登录");
      Local.clear();
      router.replace("/account/signin");
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  } else {
    return new Promise((resolve) => {
      // 缓存网络请求，等token刷新后直接执行
      queue.push((newToken: string) => {
        Reflect.set(config.headers!, "Authorization", newToken);
        // @ts-ignore
        resolve(ApiInstance.request<ResponseDataType<any>>(config));
      });
    });
  }
}
