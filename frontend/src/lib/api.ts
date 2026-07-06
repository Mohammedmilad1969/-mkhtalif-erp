import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mkhtalif_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('mkhtalif_token');
      localStorage.removeItem('mkhtalif_user');
      window.location.href = '/auth/login';
    }
    const message = extractApiError(error);
    if (message) console.error(`API Error [${error.response?.status || 'network'}]: ${message}`);
    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const err = error as any;
    const data = err?.response?.data;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message[0] || data.message.join('; ');
    if (data?.error) return data.error;
    if (err?.message) return err.message;
  }
  return '';
}

export function getApiErrorMessage(error: unknown, fallback?: string): string {
  return extractApiError(error) || fallback || 'Operation failed';
}

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const config: AxiosRequestConfig = {};
  if (params) config.params = params;
  const response: AxiosResponse<T> = await api.get(url, config);
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response: AxiosResponse<T> = await api.post(url, data);
  return response.data;
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response: AxiosResponse<T> = await api.patch(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response: AxiosResponse<T> = await api.put(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<T> {
  const response: AxiosResponse<T> = await api.delete(url);
  return response.data;
}

export default api;
