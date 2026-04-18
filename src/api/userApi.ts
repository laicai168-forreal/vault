import axios from 'axios';
import { apiConfig } from './config';
import { getApiContext } from './apiContext';
import {
    CreateProfileImageUploadPayload,
    ProfileImageUploadResponse,
    UpdateUserProfilePayload,
    UserProfile
} from '../types/User';

const api = axios.create({
    baseURL: apiConfig.userApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

const getAuthHeaders = (accessToken?: string) => {
    const token = accessToken || getApiContext()?.getIdToken();

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
};

const normalizeUserProfile = (data: any): UserProfile => ({
    id: data?.id,
    username: data?.username,
    // `role` comes from `/users/me` and is used to gate admin-only UI.
    role: data?.role ?? null,
    email: data?.email ?? null,
    phoneNumber: data?.phone_number ?? data?.phoneNumber ?? null,
    bio: data?.bio ?? null,
    address: data?.address ?? null,
    age: data?.age ?? null,
    profileImageUrl: data?.profile_image_url ?? data?.profileImageUrl ?? null,
});

export const createCurrentUser = async (idToken?: string) => {
    const response = await api.post('/users', undefined, {
        headers: getAuthHeaders(idToken),
    });

    return response.data;
};

export const getCurrentUserProfile = async (idToken?: string): Promise<UserProfile> => {
    const response = await api.get('/users/me', {
        headers: getAuthHeaders(idToken),
    });

    return normalizeUserProfile(response.data);
};

export const updateCurrentUserProfile = async (
    payload: UpdateUserProfilePayload,
    idToken?: string
): Promise<UserProfile> => {
    await api.post('/users/me', payload, {
        headers: getAuthHeaders(idToken),
    });

    return getCurrentUserProfile(idToken);
};

export const createProfileImageUpload = async (
    payload: CreateProfileImageUploadPayload,
    idToken?: string
): Promise<ProfileImageUploadResponse> => {
    const response = await api.post('/users/profile-image/upload', payload, {
        headers: getAuthHeaders(idToken),
    });

    return response.data;
};
