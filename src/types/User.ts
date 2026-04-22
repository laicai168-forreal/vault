export type UserProfile = {
    id?: string;
    username?: string;
    role?: 'customer' | 'admin' | null;
    email?: string | null;
    phoneNumber?: string | null;
    bio?: string | null;
    address?: string | null;
    age?: number | null;
    profileImageUrl?: string | null;
};

export type UpdateUserProfilePayload = {
    bio?: string | null;
    address?: string | null;
    age?: number | null;
    profileImageUrl?: string | null;
    pendingProfileImageKey?: string | null;
};

export type CreateProfileImageUploadPayload = {
    fileName: string;
    contentType: string;
};

export type ProfileImageUploadResponse = {
    uploadUrl: string;
    objectKey: string;
    fileUrl: string;
};

export type PublicUserCollectionSummary = {
    carId: string;
    title?: string | null;
    brand?: string | null;
    originalId?: string | null;
    images?: Array<Record<string, any>> | null;
    totalCount?: number | null;
    batchCount?: number | null;
    latestAdded?: string | null;
};

export type PublicUserProfileResponse = {
    user: {
        id: string;
        username?: string | null;
        bio?: string | null;
        profile_image_url?: string | null;
        created_at?: string | null;
    };
    stats: {
        followersCount: number;
        followingCount: number;
        collectionsCount: number;
    };
    collections: {
        items: PublicUserCollectionSummary[];
        total: number;
        limit: number;
        offset: number;
    };
};

export type FollowStatus = {
    following: boolean;
    followedBy: boolean;
    isFriend: boolean;
};

export type PublicUserConnectionItem = {
    id: string;
    username?: string | null;
    bio?: string | null;
    profile_image_url?: string | null;
    followed_at?: string | null;
};

export type PublicUserConnectionListResponse = {
    items: PublicUserConnectionItem[];
    total: number;
    limit: number;
    offset: number;
};
