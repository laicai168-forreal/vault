import axios from 'axios';
import { apiConfig } from './config';
import { getBearerAuthHeaders } from './authHeaders';
import {
    CreateProfileImageUploadPayload,
    FollowStatus,
    ProfileImageUploadResponse,
    PublicUserConnectionListResponse,
    PublicUserProfileResponse,
    UpdateUserProfilePayload,
    UserProfile
} from '../types/User';

export type AdminUserListItem = {
    id?: string;
    username?: string | null;
    email?: string | null;
    cognitoSub?: string | null;
    role?: 'customer' | 'admin' | null;
    profileImageUrl?: string | null;
    createdAt?: string | null;
};

const api = axios.create({
    baseURL: apiConfig.userApiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

const normalizeAdminUserListItem = (data: any): AdminUserListItem => ({
    id: data?.id,
    username: data?.username ?? null,
    email: data?.email ?? null,
    cognitoSub: data?.cognito_sub ?? data?.cognitoSub ?? null,
    role: data?.role ?? 'customer',
    profileImageUrl: data?.profile_image_url ?? data?.profileImageUrl ?? null,
    createdAt: data?.created_at ?? data?.createdAt ?? null,
});

export const createCurrentUser = async (idToken?: string) => {
    const response = await api.post('/users', undefined, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const getCurrentUserProfile = async (idToken?: string): Promise<UserProfile> => {
    const response = await api.get('/users/me', {
        headers: getBearerAuthHeaders(idToken),
    });

    return normalizeUserProfile(response.data);
};

export const updateCurrentUserProfile = async (
    payload: UpdateUserProfilePayload,
    idToken?: string
): Promise<UserProfile> => {
    await api.post('/users/me', payload, {
        headers: getBearerAuthHeaders(idToken),
    });

    return getCurrentUserProfile(idToken);
};

export const createProfileImageUpload = async (
    payload: CreateProfileImageUploadPayload,
    idToken?: string
): Promise<ProfileImageUploadResponse> => {
    const response = await api.post('/users/profile-image/upload', payload, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const promoteUserRole = async (
    payload: { cognitoSub: string; role: 'customer' | 'admin' },
    idToken?: string
): Promise<{ message: string; role: 'customer' | 'admin' }> => {
    const response = await api.post('/users/admin/promote', payload, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const deleteAdminUser = async (
    userId: string,
    idToken?: string
): Promise<{ message: string }> => {
    // Admin-only hard delete used from the user-roles page. The backend may
    // reject deletes that are blocked by required foreign-key references.
    const response = await api.delete(`/users/admin/${userId}`, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const listAdminUsers = async (
    params?: { keyword?: string; limit?: number; offset?: number },
    idToken?: string
): Promise<{ items: AdminUserListItem[]; total: number; limit: number; offset: number }> => {
    const response = await api.get('/users/admin/list', {
        params,
        headers: getBearerAuthHeaders(idToken),
    });

    return {
        items: (response.data?.items || []).map(normalizeAdminUserListItem),
        total: response.data?.total || 0,
        limit: response.data?.limit || params?.limit || 50,
        offset: response.data?.offset || params?.offset || 0,
    };
};

export const getPublicUserProfile = async (
    userId: string,
    params?: { limit?: number; offset?: number }
): Promise<PublicUserProfileResponse> => {
    const response = await api.get(`/profiles/${userId}`, {
        params,
    });

    return response.data;
};

export const getFollowStatus = async (
    userId: string,
    idToken?: string
): Promise<FollowStatus> => {
    const response = await api.get(`/users/follows/${userId}`, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const followUser = async (
    userId: string,
    idToken?: string
): Promise<FollowStatus> => {
    const response = await api.post(`/users/follows/${userId}`, undefined, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const unfollowUser = async (
    userId: string,
    idToken?: string
): Promise<FollowStatus> => {
    const response = await api.delete(`/users/follows/${userId}`, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};

export const getPublicFollowers = async (
    userId: string,
    params?: { limit?: number; offset?: number }
): Promise<PublicUserConnectionListResponse> => {
    const response = await api.get(`/profiles/${userId}/followers`, {
        params,
    });

    return response.data;
};

export const getPublicFollowing = async (
    userId: string,
    params?: { limit?: number; offset?: number }
): Promise<PublicUserConnectionListResponse> => {
    const response = await api.get(`/profiles/${userId}/following`, {
        params,
    });

    return response.data;
};

export const removeFollower = async (
    userId: string,
    idToken?: string
): Promise<{ message: string }> => {
    const response = await api.delete(`/users/followers/${userId}`, {
        headers: getBearerAuthHeaders(idToken),
    });

    return response.data;
};
