import axios, { InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  baseURL: 'https://zxhk7nz7ee.execute-api.us-east-1.amazonaws.com/prod',
  headers: {
    'Content-Type': 'application/json',
  },
});

interface ApiConfigData {
  
}

api.interceptors.request.use((config: InternalAxiosRequestConfig<ApiConfigData>) => {
  const { store } = require('../store/store');
  const userId = store.getState().auth.authData?.userData?.sub;

  if (userId) {
    // list of routes that need user context
    const userRoutes = ['/cars'];

    // check if this request needs user info
    if (config.url && userRoutes.some(route => config.url?.includes(route))) {
      if (config.method && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = { ...(config.data || {}), userId };
      }

      if (config.method === 'get') {
        config.params = { ...(config.params || {}), userId };
      }
    }

    // optional: always add header for debugging/logging
    // config.headers['X-User-Id'] = userId;
  }

  return config;
});

export const fetchCars = async () => {
  const response = await api.get('/cars');
  return response.data;
};