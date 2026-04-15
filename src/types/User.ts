export type UserProfile = {
    id?: string;
    username?: string;
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
