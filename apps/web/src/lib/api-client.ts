import axios from 'axios';

import { USE_LOCAL_BACKEND } from '@/config/runtime';
import { LocalApiAdapter } from '@/lib/local-api';

const baseURL = import.meta.env.VITE_API_URL;

let accessToken: string | null = null;
let refreshingPromise: Promise<string | null> | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

const refreshAccessToken = async () => {
  if (USE_LOCAL_BACKEND) return null;

  if (!refreshingPromise) {
    refreshingPromise = axios
      .post(
        `${baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        const token = response.data?.accessToken as string | undefined;
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

const realApi = axios.create({
  baseURL,
  withCredentials: true,
});

realApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

realApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const status = error.response?.status as number | undefined;
    const isRefreshCall = (originalRequest?.url as string | undefined)?.includes('/auth/refresh');

    if (!originalRequest || originalRequest._retry || status !== 401 || isRefreshCall) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const token = await refreshAccessToken();
    if (!token) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${token}`;
    return realApi(originalRequest);
  },
);

export const api = USE_LOCAL_BACKEND ? new LocalApiAdapter() : realApi;
