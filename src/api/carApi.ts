import axios, { InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from './config';

const api = axios.create({
	baseURL: apiConfig.carApiBaseUrl,
	headers: {
		'Content-Type': 'application/json',
	},
});

interface ApiConfigData {

}

export type GetCarParams = {
	limit?: number;
	offset?: number;
	bid?: string;
	keyword?: string;
	obrd?: string;
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

export const fetchCars = async ({ limit, offset, bid, keyword, obrd }: GetCarParams) => {
	const params: GetCarParams = {
		limit: limit || 20,
		bid,
	}
	if (offset) params.offset = offset;
	if (keyword) params.keyword = keyword;
	if (obrd !== undefined) params.obrd = obrd;
	const response = await api.get('/cars', { params });
	return response.data;
};

export const fetchCarById = async (cid: string) => {
	const response = await api.get('/cars', { params: { cid } });
	return response.data;
};
