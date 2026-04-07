export type GetUserCollectionParams = { page?: number, pageSize?: number, order?: string, keyword?: string, q?: string };

export type GetUserCollectionByCarParams = { carId: string }

export type UserCollectionParams = {
    items?: CollectionEntry[];
    storageLocationId?: string;
    storageLocationName?: string;
}

export type CollectionEntry = {
    carId?: string;
    userId?: string;
    itemId?: string,
    condition?: string,
    purchasePrice?: string,
    purchasedAt?: string,
    photos?: string[],
    createdAt?: string,
    attributes?: {},
    count?: number | string,
    updatedAt?: string,
    isPublished?: boolean,
    isInMarket?: boolean,
    metadata?: boolean,
    storageLocation?: StorageLocation,
    storageLocationName?: string,
    storageLocationId?: string,
    notes?: string,
}

export type StorageLocation = {
    id?: string;
    name?: string;
}