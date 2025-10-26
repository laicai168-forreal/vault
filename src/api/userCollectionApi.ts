import axios, { InternalAxiosRequestConfig } from 'axios';
import { AddCollectionEntity } from '../types/UserCollection';

const api = axios.create({
  baseURL: 'https://mgc81wtktl.execute-api.us-east-1.amazonaws.com/prod/',
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
    const userRoutes = ['/collections'];

    // check if this request needs user info
    if (config.url && userRoutes.some(route => config.url?.includes(route))) {
      if (config.method && ['post', 'put', 'patch'].includes(config.method)) {
        config.data = { ...(config.data || {}), userId };
      }

      if (config.method && ['get', 'delete']) {
        config.params = { ...(config.params || {}), userId };
      }
    }

    // optional: always add header for debugging/logging
    // config.headers['X-User-Id'] = userId;
  }

  return config;
});

export const addCollection = async (userCollectionEntry: AddCollectionEntity) => {
  const response = await api.post('/collections', userCollectionEntry);
  return response.data;
};

export const getCollection = async () => {
  const response = await api.get('/collections');
  return response.data;
};

export const deleteCollection = async (userCollectionEntry: AddCollectionEntity) => {
  const response = await api.delete('/collections', { data: userCollectionEntry });
  return response.data;
};