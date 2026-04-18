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

// Customer suggestion payload. The backend stores this as a pending review request
// instead of mutating the `cars` table directly.
export type CarChangeRequestPayload = {
	car_id?: string;
	request_type: string;
	payload: Record<string, unknown>;
	uploaded_images?: Array<Record<string, unknown>>;
};

// Lightweight quota summary used by the customer editor banner and submit guard.
export type CarChangeRequestSummary = {
	weeklyLimit: number;
	usedCount: number;
	remainingCount: number;
	windowDays: number;
	resetAt: string | null;
};

export type CarChangeRequestItem = {
	id: string;
	car_id?: string | null;
	car_title?: string | null;
	submitted_by?: string;
	submitted_by_username?: string | null;
	reviewed_by?: string | null;
	reviewed_by_username?: string | null;
	status: 'pending' | 'approved' | 'rejected';
	request_type: string;
	payload: Record<string, any>;
	uploaded_images?: Array<Record<string, any>>;
	review_notes?: string | null;
	created_at: string;
	reviewed_at?: string | null;
};

export type CarChangeRequestDetail = {
	request: CarChangeRequestItem;
	currentCar: Record<string, any> | null;
};

export type ReviewCarChangeRequestPayload = {
	status: 'approved' | 'rejected';
	reviewNotes?: string;
	finalPayload?: Record<string, unknown>;
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

// Admin-only direct create. This calls the user/admin API because writes are gated by role.
export const createAdminCar = async (payload: AdminCarPayload) => {
	const response = await adminApi.post('/admin/cars', payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

// Admin-only direct update for an existing car row.
export const updateAdminCar = async (carId: string, payload: AdminCarPayload) => {
	const response = await adminApi.post(`/admin/cars/${carId}`, payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

// Admin-only hard delete for maintenance workflows.
export const deleteAdminCar = async (carId: string) => {
	const response = await adminApi.delete(`/admin/cars/${carId}`, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

// Admin-only duplicate endpoint. The backend clones the source car, then applies overrides from payload.
export const duplicateAdminCar = async (carId: string, payload: AdminCarPayload) => {
	const response = await adminApi.post(`/admin/cars/${carId}/duplicate`, payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

// Customer-facing suggestion submit. This creates a pending request for admin review.
export const submitCarChangeRequest = async (payload: CarChangeRequestPayload) => {
	const response = await adminApi.post('/car-change-requests', payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

// Customer-facing quota summary used to show remaining weekly chances in the editor.
export const fetchCarChangeRequestSummary = async (): Promise<CarChangeRequestSummary> => {
	const response = await adminApi.get('/car-change-requests/summary', {
		headers: getAuthHeaders(),
	});
	return response.data;
};

// Admin-only lookup data for normalized car fields.
// `productLines` includes `brand_id` so the editor can filter options by selected brand.
export const fetchAdminCarFormOptions = async (): Promise<AdminCarFormOptions> => {
	const response = await adminApi.get('/admin/car-form-options', {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const fetchAdminCarChangeRequests = async (params?: {
	status?: string;
	limit?: number;
	offset?: number;
}): Promise<CarChangeRequestItem[]> => {
	// Admin queue listing used by the maintenance/review surface.
	const response = await adminApi.get('/admin/car-change-requests', {
		headers: getAuthHeaders(),
		params,
	});
	return response.data;
};

export const fetchAdminCarChangeRequestDetail = async (requestId: string): Promise<CarChangeRequestDetail> => {
	// Includes both the request row and the latest linked car for side-by-side review.
	const response = await adminApi.get(`/admin/car-change-requests/${requestId}`, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const reviewAdminCarChangeRequest = async (
	requestId: string,
	payload: ReviewCarChangeRequestPayload,
): Promise<{ request: CarChangeRequestItem; car?: Record<string, unknown> | null }> => {
	// Admin review can either reject, or approve with a refined final payload.
	const response = await adminApi.post(`/admin/car-change-requests/${requestId}/review`, payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const fetchMyCarChangeRequests = async (params?: {
	status?: string;
	limit?: number;
	offset?: number;
}): Promise<CarChangeRequestItem[]> => {
	// Customer history list for "My Suggestions".
	const response = await adminApi.get('/car-change-requests', {
		headers: getAuthHeaders(),
		params,
	});
	return response.data;
};

export const fetchMyCarChangeRequestDetail = async (requestId: string): Promise<CarChangeRequestDetail> => {
	// Rehydrates a pending request back into the customer editor for updates.
	const response = await adminApi.get(`/car-change-requests/${requestId}`, {
		headers: getAuthHeaders(),
	});
	return response.data;
};

export const updateMyCarChangeRequest = async (
	requestId: string,
	payload: Partial<CarChangeRequestPayload>,
): Promise<CarChangeRequestDetail> => {
	// Partial update so the editor can revise just the pending request fields it owns.
	const response = await adminApi.post(`/car-change-requests/${requestId}`, payload, {
		headers: getAuthHeaders(),
	});
	return response.data;
};
