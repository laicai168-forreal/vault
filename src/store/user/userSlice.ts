import { ActionReducerMapBuilder, PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createCurrentUser, getCurrentUserProfile, updateCurrentUserProfile } from '../../api/userApi';
import { UpdateUserProfilePayload, UserProfile } from '../../types/User';

export interface UserState {
    currentUser?: UserProfile;
    loading: boolean;
    saving: boolean;
    initialized: boolean;
    error: string | null;
    saveMessage: string | null;
}

const initialState: UserState = {
    loading: false,
    saving: false,
    initialized: false,
    error: null,
    saveMessage: null,
};

export const bootstrapCurrentUser = createAsyncThunk(
    'user/bootstrapCurrentUser',
    async (idToken: string | undefined, { rejectWithValue }) => {
        try {
            return await getCurrentUserProfile(idToken);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                try {
                    await createCurrentUser(idToken);
                    return await getCurrentUserProfile(idToken);
                } catch (createError: any) {
                    return rejectWithValue(
                        createError?.response?.data?.detail ||
                        createError?.message ||
                        'Unable to create profile'
                    );
                }
            }

            return rejectWithValue(error?.response?.data?.detail || error?.message || 'Unable to load profile');
        }
    }
);

export const fetchCurrentUser = createAsyncThunk(
    'user/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            return await getCurrentUserProfile();
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.detail || error?.message || 'Unable to load profile');
        }
    }
);

export const saveCurrentUser = createAsyncThunk(
    'user/saveCurrentUser',
    async (payload: UpdateUserProfilePayload, { rejectWithValue }) => {
        try {
            return await updateCurrentUserProfile(payload);
        } catch (error: any) {
            return rejectWithValue(error?.response?.data?.detail || error?.message || 'Unable to save profile');
        }
    }
);

const handleBootstrapActions = (builder: ActionReducerMapBuilder<UserState>) => {
    builder
        .addCase(bootstrapCurrentUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(bootstrapCurrentUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
            state.loading = false;
            state.initialized = true;
            state.currentUser = action.payload;
        })
        .addCase(bootstrapCurrentUser.rejected, (state, action) => {
            state.loading = false;
            state.initialized = true;
            state.error = action.payload as string;
            state.currentUser = undefined;
        });
};

const handleFetchActions = (builder: ActionReducerMapBuilder<UserState>) => {
    builder
        .addCase(fetchCurrentUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
            state.loading = false;
            state.initialized = true;
            state.currentUser = action.payload;
        })
        .addCase(fetchCurrentUser.rejected, (state, action) => {
            state.loading = false;
            state.initialized = true;
            state.error = action.payload as string;
            state.currentUser = undefined;
        });
};

const handleSaveActions = (builder: ActionReducerMapBuilder<UserState>) => {
    builder
        .addCase(saveCurrentUser.pending, (state) => {
            state.saving = true;
            state.error = null;
            state.saveMessage = null;
        })
        .addCase(saveCurrentUser.fulfilled, (state, action: PayloadAction<UserProfile>) => {
            state.saving = false;
            state.currentUser = action.payload;
            state.saveMessage = 'Profile updated successfully.';
        })
        .addCase(saveCurrentUser.rejected, (state, action) => {
            state.saving = false;
            state.error = action.payload as string;
        });
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUserState: (state) => {
            state.currentUser = undefined;
            state.loading = false;
            state.saving = false;
            state.initialized = false;
            state.error = null;
            state.saveMessage = null;
        },
        clearUserMessage: (state) => {
            state.saveMessage = null;
        },
    },
    extraReducers: (builder) => {
        handleBootstrapActions(builder);
        handleFetchActions(builder);
        handleSaveActions(builder);
    },
});

export const { clearUserState, clearUserMessage } = userSlice.actions;

export default userSlice.reducer;
