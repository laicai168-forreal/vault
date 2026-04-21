import axios from 'axios';
import { CollectionEntry, GetUserCollectionByCarParams, GetUserCollectionParams, UserCollectionParams } from '../types/UserCollection';
import { getBearerAuthHeaders } from './authHeaders';
import { apiConfig } from './config';

const api = axios.create({
    baseURL: apiConfig.collectionApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const authHeaders = getBearerAuthHeaders();

    if (authHeaders.Authorization) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = authHeaders.Authorization;
    }

    return config;
});

export const addCollection = async (userCollectionParams: UserCollectionParams) => {
    const response = await api.post('/collections', userCollectionParams);
    return response.data;
};

export const updateCollection = async (userCollectionParams: UserCollectionParams) => {
    const response = await api.post('/collections', userCollectionParams);
    return response.data;
};

export const getCollection = async ({
    page,
    pageSize,
    order,
    keyword,
}: GetUserCollectionParams) => {
    const params: GetUserCollectionParams = {};
    params.page = page || 1;
    if (pageSize) params.pageSize = pageSize;
    if (order) params.order = order;
    if (keyword) params.q = keyword;

    const response = await api.get('/collections', { params });
    return response.data;
};

export const getCollectionByCarId = async (params: GetUserCollectionByCarParams) => {
    const response = await api.get('/collections', { params });
    return response.data;
};

export const getCollectionMetaData = async (params: CollectionEntry) => {
    const response = await api.get('/collections', { params });
    return response.data;
};

export const deleteCollection = async (carId: string) => {
    const response = await api.delete('/collections', { params: { carId, deleteAll: true }, });
    return response.data;
};

export const deleteCollectionEntry = async (params: CollectionEntry) => {
    const { carId, itemId } = params;
    const response = await api.delete('/collections', { params: { carId, itemId }, });
    return response.data;
};

export const likeCollection = async (userCollectionEntry: CollectionEntry) => {
    const response = await api.post('/likes', userCollectionEntry);
    return response.data;
};

export const dislikeCollection = async (carId: string) => {
    const response = await api.delete('/likes', { params: { carId }, });
    return response.data;
};
