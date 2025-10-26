import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { addCollection, deleteCollection, getCollection } from '../../api/userCollectionApi';
import { AddCollectionEntity } from '../../types/UserCollection';

interface UserCollectionState {
	res: any;
	userCollections: any;
	loading: boolean;
	error: string | null;
}

const initialState: UserCollectionState = {
	res: null,
	userCollections: null,
	loading: false,
	error: null,
};

export const addUserCollection = createAsyncThunk(
	'userCollection/addCollection',
	async (userCollectionEntry: AddCollectionEntity, { rejectWithValue }) => {
		try {
			const res = await addCollection(userCollectionEntry);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const getUserCollection = createAsyncThunk(
	'userCollection/getCollection',
	async (_, { rejectWithValue }) => {
		try {
			const res = await getCollection();
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

export const deleteUserCollection = createAsyncThunk(
	'userCollection/deleteCollection',
	async (userCollectionEntry: AddCollectionEntity, { rejectWithValue }) => {
		try {
			const res = await deleteCollection(userCollectionEntry);
			return res;
		} catch (error: any) {
			return rejectWithValue(error.message);
		}
	}
);

const addUserCollectionBuilder = (builder: ActionReducerMapBuilder<UserCollectionState>) => {
	builder
		.addCase(addUserCollection.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(addUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
			state.loading = false;
			state.res = action.payload;
		})
		.addCase(addUserCollection.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
}

const getUserCollectionBuilder = (builder: ActionReducerMapBuilder<UserCollectionState>) => {
	builder
		.addCase(getUserCollection.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(getUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
			state.loading = false;
			state.userCollections = action.payload;
		})
		.addCase(getUserCollection.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
}

const deleteUserCollectionBuilder = (builder: ActionReducerMapBuilder<UserCollectionState>) => {
	builder
		.addCase(deleteUserCollection.pending, (state) => {
			state.loading = true;
			state.error = null;
		})
		.addCase(deleteUserCollection.fulfilled, (state, action: PayloadAction<any>) => {
			state.loading = false;
			state.res = action.payload;
		})
		.addCase(deleteUserCollection.rejected, (state, action) => {
			state.loading = false;
			state.error = action.payload as string;
		});
}

const userCollectionSlice = createSlice({
	name: 'userCollection',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		addUserCollectionBuilder(builder);
		getUserCollectionBuilder(builder);
		deleteUserCollectionBuilder(builder);
	},
})
const userCollectionReducer = userCollectionSlice.reducer;

export default userCollectionReducer;