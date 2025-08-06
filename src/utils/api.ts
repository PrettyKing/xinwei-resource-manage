// API 工具函数

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  token?: string | null;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 创建带认证的API请求
export async function apiRequest<T = any>(
  url: string, 
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body, token } = options;

  // 设置默认headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // 添加认证头
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // 准备请求配置
  const config: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // 添加请求体（如果有）
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  } catch (error) {
    console.error(`API请求失败 [${method} ${url}]:`, error);
    throw error;
  }
}

// 便捷方法
export const api = {
  get: <T = any>(url: string, token?: string | null) =>
    apiRequest<T>(url, { method: 'GET', token }),

  post: <T = any>(url: string, body: any, token?: string | null) =>
    apiRequest<T>(url, { method: 'POST', body, token }),

  put: <T = any>(url: string, body: any, token?: string | null) =>
    apiRequest<T>(url, { method: 'PUT', body, token }),

  delete: <T = any>(url: string, token?: string | null) =>
    apiRequest<T>(url, { method: 'DELETE', token }),
};

export default api;