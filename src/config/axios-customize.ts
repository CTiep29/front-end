import { IBackendRes } from "@/types/backend";
import { Mutex } from "async-mutex";
import axiosClient from "axios";
import { store } from "@/redux/store";
import { setRefreshTokenAction } from "@/redux/slice/accountSlide";
import { notification } from "antd";
interface AccessTokenResponse {
    access_token: string;
}

/**
 * Creates an initial 'axios' instance with custom settings.
 */

const instance = axiosClient.create({
    baseURL: import.meta.env.VITE_BACKEND_URL as string,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

const mutex = new Mutex();
const NO_RETRY_HEADER = 'x-no-retry';

const handleRefreshToken = async (): Promise<string | null> => {
    try {
        // Kiểm tra xem có refresh token trong localStorage không
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return null;
        }

        return await mutex.runExclusive(async () => {
            const res = await instance.get<IBackendRes<AccessTokenResponse>>('/api/v1/auth/refresh');
            if (res && res.data) return res.data.access_token;
            return null;
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return null;
    }
};

instance.interceptors.request.use(function (config) {
    // Chỉ thêm token cho các request không phải là login
    if (config.url !== '/api/v1/auth/oauth2-login' && config.url !== '/api/v1/auth/login') {
        const accessToken = localStorage.getItem('access_token');
        if (accessToken) {
            config.headers.Authorization = 'Bearer ' + accessToken;
        }
    }
    if (!config.headers.Accept && config.headers["Content-Type"]) {
        config.headers.Accept = "application/json";
        config.headers["Content-Type"] = "application/json; charset=utf-8";
    }
    return config;
});

/**
 * Handle all responses. It is possible to add handlers
 * for requests, but it is omitted here for brevity.
 */
instance.interceptors.response.use(
    (res) => res.data,
    async (error) => {
        if (!error || !error.response) {
            notification.error({
                message: "Lỗi kết nối",
                description: "Không thể kết nối đến server. Vui lòng thử lại sau.",
                duration: 5
            });
            return Promise.reject(error);
        }

        // Xử lý lỗi 401 - Unauthorized
        if (error.config && error.response
            && +error.response.status === 401
            && error.config.url !== '/api/v1/auth/login'
            && error.config.url !== '/api/v1/auth/oauth2-login'
            && !error.config.headers[NO_RETRY_HEADER]
        ) {
            const access_token = await handleRefreshToken();
            error.config.headers[NO_RETRY_HEADER] = 'true'
            if (access_token) {
                error.config.headers['Authorization'] = `Bearer ${access_token}`;
                localStorage.setItem('access_token', access_token)
                return instance.request(error.config);
            } else {
                // Nếu không refresh được token, chuyển về trang login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                if (location.pathname.startsWith("/admin")) {
                    window.location.href = '/login';
                }
            }
        }

        // Xử lý lỗi 400 khi refresh token
        if (
            error.config && error.response
            && +error.response.status === 400
            && error.config.url === '/api/v1/auth/refresh'
        ) {
            const message = error?.response?.data?.error ?? "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.";
            store.dispatch(setRefreshTokenAction({ status: true, message }));
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            if (location.pathname.startsWith("/admin")) {
                window.location.href = '/login';
            }
        }

        // Xử lý lỗi 403 - Forbidden
        if (error.response?.status === 403) {
            notification.error({
                message: error?.response?.data?.message ?? "Không có quyền truy cập",
                description: error?.response?.data?.error ?? "Bạn không có quyền thực hiện hành động này"
            });
            // Nếu là trang admin và không có quyền, chuyển về trang login
            if (location.pathname.startsWith("/admin")) {
                window.location.href = '/login';
            }
        }

        return error?.response?.data ?? Promise.reject(error);
    }
);

/**
 * Replaces main `axios` instance with the custom-one.
 *
 * @param cfg - Axios configuration object.
 * @returns A promise object of a response of the HTTP request with the 'data' object already
 * destructured.
 */
// const axios = <T>(cfg: AxiosRequestConfig) => instance.request<any, T>(cfg);

// export default axios;

export default instance;