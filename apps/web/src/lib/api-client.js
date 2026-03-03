import axios from 'axios';
const baseURL = import.meta.env.VITE_API_URL;
let accessToken = null;
let refreshingPromise = null;
export const setAccessToken = (token) => {
    accessToken = token;
};
export const getAccessToken = () => accessToken;
const refreshAccessToken = async () => {
    if (!refreshingPromise) {
        refreshingPromise = axios
            .post(`${baseURL}/auth/refresh`, {}, {
            withCredentials: true,
        })
            .then((response) => {
            const token = response.data?.accessToken;
            if (!token) {
                setAccessToken(null);
                return null;
            }
            setAccessToken(token);
            return token;
        })
            .catch(() => {
            setAccessToken(null);
            return null;
        })
            .finally(() => {
            refreshingPromise = null;
        });
    }
    return refreshingPromise;
};
export const api = axios.create({
    baseURL,
    withCredentials: true,
});
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');
    if (!originalRequest || originalRequest._retry || status !== 401 || isRefreshCall) {
        return Promise.reject(error);
    }
    originalRequest._retry = true;
    const token = await refreshAccessToken();
    if (!token) {
        return Promise.reject(error);
    }
    originalRequest.headers.Authorization = `Bearer ${token}`;
    return api(originalRequest);
});
