import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { addCollection, deleteCollection, deleteCollectionEntry, dislikeCollection, getCollection, getCollectionByCarId, getCollectionMetaData, likeCollection, updateCollection } from '../../api/userCollectionApi';
import { Car } from '../../types/Car';
import { CollectionEntry, GetUserCollectionByCarParams, GetUserCollectionParams, StorageLocation, UserCollectionParams } from '../../types/UserCollection';

export type UserCollection = {
	carId: string;
	count: number;
	title: string;
	brand: string;
	images: Record<string, any>[];
	addedAt: string;
	originalId: string;
}

export interface UserCollectionState {
	res: any;
	metadata: {
		conditionTypes?: [];
		locations?: StorageLocation[];
		totalLocations?: number;
	};
	userCollectionsByPage: Record<number, UserCollection[]>;
	currentCollectionPage: number;
	totalCollectionCount: number;
	totalCollectionPageCount: number;
	editingCar: Car | undefined;
	entriesByCar: CollectionEntry[];
	loading: boolean;
	loadingCarId?: string;
	error: string | null;
}

//THUNK
const initialState: UserCollectionState = {
	res: null,
	metadata: {},
	userCollectionsByPage: {},
	currentCollectionPage: 1,
	totalCollectionCount: 0,
	totalCollectionPageCount: 0,
	editingCar: undefined,
	entriesByCar: [],
	loading: false,
	error: null,
};

export const addUserCollection = createAsyncThunk(
	'userCollection/addCollection',
	async (userCollectionEntry: UserCollectionParams, { rejectWithValue }) => {
		try {
			const res = await addCollection(userCollectionEntry);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const updateUserCollection = createAsyncThunk(
	'userCollection/updateCollection',
	async (userCollectionEntry: UserCollectionParams, { rejectWithValue }) => {
		try {
			const res = await updateCollection(userCollectionEntry);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const getUserCollection = createAsyncThunk(
	'userCollection/getCollection',
	async (params: GetUserCollectionParams, { rejectWithValue }) => {
		try {
			const res = await getCollection(params);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const getUserCollectionByCarId = createAsyncThunk(
	'userCollection/getCollectionByCarId',
	async (params: GetUserCollectionByCarParams, { rejectWithValue }) => {
		try {
			const res = await getCollectionByCarId(params);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const getUserCollectionMetaData = createAsyncThunk(
	'userCollection/getUserCollectionMetaData',
	async (params: CollectionEntry, { rejectWithValue }) => {
		try {
			const res = await getCollectionMetaData(params);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const deleteUserCollection = createAsyncThunk(
	'userCollection/deleteCollection',
	async (carId: string, { rejectWithValue }) => {
		try {
			const res = await deleteCollection(carId);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const deleteUserCollectionEntry = createAsyncThunk(
	'userCollection/deleteUserCollectionEntry',
	async (params: CollectionEntry, { rejectWithValue }) => {
		try {
			const res = await deleteCollectionEntry(params);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const likeUserCollection = createAsyncThunk(
	'userCollection/likeCollection',
	async (userCollectionEntry: CollectionEntry, { rejectWithValue }) => {
		try {
			const res = await likeCollection(userCollectionEntry);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const dislikeUserCollection = createAsyncThunk(
	'userCollection/dislikeCollection',
	async (carId: string, { rejectWithValue }) => {
		try {
			const res = await dislikeCollection(carId);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

//SLICE
const userCollectionSlice = createSlice({
	name: 'userCollection',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			// addUserCollection
			.addCase(addUserCollection.pending, (state, action) => {
				state.error = null;
				state.loading = true;
			})
			.addCase(addUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
				state.res = action.payload;
				state.loading = false;
			})
			.addCase(addUserCollection.rejected, (state, action) => {
				state.error = action.payload as string;
				state.loading = false;
			})
			// updateUserCollection
			.addCase(updateUserCollection.pending, (state, action) => {
				state.error = null;
				state.loading = true;
			})
			.addCase(updateUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
				state.res = action.payload;
				state.loading = false;
			})
			.addCase(updateUserCollection.rejected, (state, action) => {
				state.error = action.payload as string;
				state.loading = false;
			})
			// getUserCollection
			.addCase(getUserCollection.pending, (state) => {
				state.error = null;
				state.loading = true;
			})
			.addCase(getUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
				state.loading = false;
				const { items, totalPages, totalItems, page } = action.payload;
				state.userCollectionsByPage[page] = items;
				state.totalCollectionPageCount = totalPages;
				state.totalCollectionCount = totalItems;
			})
			.addCase(getUserCollection.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload as string;
			})
			// getCollectionByCarId
			.addCase(getUserCollectionByCarId.pending, (state, action) => {
				state.error = null;
				state.entriesByCar = [];
				state.editingCar = undefined;
			})
			.addCase(getUserCollectionByCarId.fulfilled, (state, action: PayloadAction<any>) => {
				state.entriesByCar = action.payload.items;
				state.editingCar = action.payload.car;
			})
			.addCase(getUserCollectionByCarId.rejected, (state, action) => {
				state.error = null
			})
			// getCollectionMetaData
			.addCase(getUserCollectionMetaData.pending, (state, action) => {
				state.error = null;
				state.metadata = {};
				state.loading = true;
			})
			.addCase(getUserCollectionMetaData.fulfilled, (state, action: PayloadAction<any>) => {
				state.metadata = action.payload;
				state.loading = false;
			})
			.addCase(getUserCollectionMetaData.rejected, (state, action) => {
				state.error = null
				state.metadata = {};
				state.loading = false;
			})
			// deleteUserCollection
			.addCase(deleteUserCollection.pending, (state, action) => {
				state.error = null;
				state.loading = true;
			})
			.addCase(deleteUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
				state.res = action.payload;
			})
			.addCase(deleteUserCollection.rejected, (state, action) => {
				state.error = action.payload as string;
				state.loading = false;
			})
			// deleteUserCollectionEntry
			.addCase(deleteUserCollectionEntry.pending, (state, action) => {
				state.error = null;
				state.loading = true;
			})
			.addCase(deleteUserCollectionEntry.fulfilled, (state, action: PayloadAction<any>) => {
				state.res = action.payload;
				state.loading = false;
			})
			.addCase(deleteUserCollectionEntry.rejected, (state, action) => {
				state.error = action.payload as string;
				state.loading = false;
			})
			// likeUserCollection
			.addCase(likeUserCollection.pending, (state, action) => {
				state.error = null;
			})
			.addCase(likeUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
				state.res = action.payload;
			})
			.addCase(likeUserCollection.rejected, (state, action) => {
				state.error = action.payload as string;
			})
			// dislikeUserCollection
			.addCase(dislikeUserCollection.pending, (state, action) => {
				state.error = null;
			})
			.addCase(dislikeUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
				state.res = action.payload;
			})
			.addCase(dislikeUserCollection.rejected, (state, action) => {
				state.error = action.payload as string;
			});
	},
})
const userCollectionReducer = userCollectionSlice.reducer;

export default userCollectionReducer;
