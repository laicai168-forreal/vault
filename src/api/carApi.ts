import axios, { InternalAxiosRequestConfig } from 'axios';
import { apiConfig } from './config';
import { getApiContext } from './apiContext';

const api = axios.create({
	baseURL: apiConfig.carApiBaseUrl,
	headers: {
		'Content-Type': 'application/json',
	},
});

const adminApi = axios.create({
	baseURL: apiConfig.userApiBaseUrl,
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

export type AdminCarPayload = {
	code?: string;
	brand_id?: string;
	brand?: string;
	title?: string;
	make_id?: string;
	make?: string;
	model_ai?: string;
	scale?: string;
	product_line_id?: string;
	product_line?: string;
	original_id?: string;
	source_url?: string;
	release_date_approximate?: string;
	description_ai?: string;
	is_chase?: boolean;
	is_limited?: boolean;
	limited_pieces?: number | null;
	images?: Array<Record<string, unknown>>;
};

export type CarChangeRequestPayload = {
	car_id?: string;
	request_type: string;
	payload: Record<string, unknown>;
	uploaded_images?: Array<Record<string, unknown>>;
};

export type CarChangeRequestSummary = {
	weeklyLimit: number;
	usedCount: number;
	remainingCount: number;
	windowDays: number;
	resetAt: string | null;
};

export type CarFormLookupOption = {
	id: string;
	name: string;
	brand_id?: string;
};

export type AdminCarFormOptions = {
	brands: CarFormLookupOption[];
	makes: CarFormLookupOption[];
	productLines: CarFormLookupOption[];
};

const getAuthHeaders = () => {
	const token = getApiContext()?.getIdToken();

	return token
		? {
			Authorization: `Bearer ${token}`,
		}
		: {};
};

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

export const createAdminCar = async (payload: AdminCarPayload) => {
	const response = await adminApi.post('/admin/cars', payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const updateAdminCar = async (carId: string, payload: AdminCarPayload) => {
	const response = await adminApi.post(`/admin/cars/${carId}`, payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const deleteAdminCar = async (carId: string) => {
	const response = await adminApi.delete(`/admin/cars/${carId}`, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const duplicateAdminCar = async (carId: string, payload: AdminCarPayload) => {
	const response = await adminApi.post(`/admin/cars/${carId}/duplicate`, payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const submitCarChangeRequest = async (payload: CarChangeRequestPayload) => {
	const response = await adminApi.post('/car-change-requests', payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const fetchCarChangeRequestSummary = async (): Promise<CarChangeRequestSummary> => {
	const response = await adminApi.get('/car-change-requests/summary', {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const fetchAdminCarFormOptions = async (): Promise<AdminCarFormOptions> => {
	const response = await adminApi.get('/admin/car-form-options', {
		headers: getAuthHeaders(),
	});
	return response.data;
};
