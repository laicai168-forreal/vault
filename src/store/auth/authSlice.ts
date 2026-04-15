
import { ActionReducerMapBuilder, createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
    CognitoAccessToken,
    CognitoIdToken,
    CognitoRefreshToken,
} from 'amazon-cognito-identity-js';
import { confirmSignUpService, forgetPassword, refreshSessionService, resendConfirmationService, signInService, signOutService, signUpService, verifyCodeAndSetNewPassword } from './cognitoServices';

export interface AuthState {
    isAuthenticated: boolean,
    authData?: {
        idToken: CognitoIdToken,
        refreshToken: CognitoRefreshToken,
        accessToken: CognitoAccessToken,
        isValid: boolean,
        userData: any,
    },
    res?: any,
    inputPW?: string | null;
    inputUserId?: string | null;
    newRegisterUserName?: string;
    needConfirmation?: boolean;
    loading: boolean,
    error: string | null,
    showLoginModal?: boolean,
}

export interface SignInData {
    userId: string;
    password: string;
}

export interface SignOutData {
    userId: string;
}

export type SignUpData = {
    email?: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    displayedName: string;
};

export type ConfirmEmailData = {
    username: string;
    code: string;
};

const initialState: AuthState = {
    isAuthenticated: false,
    loading: false,
    error: null,
};

// THUNKS
export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { rejectWithValue }) => {
        try {
            const session = await refreshSessionService();

            const formatResult = {
                idToken: session.getIdToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken(),
                accessToken: session.getAccessToken().getJwtToken(),
                userData: session.getIdToken().decodePayload(),
                isValid: session.isValid(),
            }

            localStorage.setItem('@malo_auth', JSON.stringify(formatResult));
            return formatResult;
        } catch (err: any) {
            return rejectWithValue(err?.message || "Token refresh failed");
        }
    }
);

export const signIn = createAsyncThunk(
    'auth/signin',
    async ({ userId, password }: SignInData, { rejectWithValue }) => {
        try {
            const res = await signInService(userId, password);
            const formatResult = {
                idToken: res.getIdToken().getJwtToken(),
                refreshToken: res.getRefreshToken().getToken(),
                accessToken: res.getAccessToken().getJwtToken(),
                userData: res.getIdToken().decodePayload(),
                isValid: res.isValid(),
            }
            localStorage.setItem('@malo_auth', JSON.stringify(formatResult));
            return formatResult;
        } catch (error: any) {
            return rejectWithValue({
                message: error.message,
                name: error.name
            });
        }
    }
);

export const signOut = createAsyncThunk(
    'auth/signout',
    async ({ userId }: SignOutData, { rejectWithValue }) => {
        try {
            const authData = await signOutService(userId);
            localStorage.setItem('@malo_auth', '{}');
            return authData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const signUp = createAsyncThunk(
    'auth/signup',
    async (signUpData: SignUpData, { rejectWithValue }) => {
        try {
            const res = await signUpService(signUpData);
            return res;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const confirmEmail = createAsyncThunk(
    'auth/confirmemail',
    async (data: ConfirmEmailData, { rejectWithValue }) => {
        try {
            return await confirmSignUpService(data);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const sendConfirmEmail = createAsyncThunk(
    'auth/sendconfirmemail',
    async (username: string, { rejectWithValue }) => {
        try {
            return await resendConfirmationService(username);
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const sendForgetPasswordEmail = createAsyncThunk(
    'auth/forgetpasswordemail',
    async (email: string, { rejectWithValue }) => {
        try {
            const res = await forgetPassword(email);
            return res;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const verifyCodeAndSetPassword = createAsyncThunk(
    'auth/verifycodeandsetpassword',
    async (
        verifyCodeAndSetPasswordData: {
            code: string,
            newPassword: string,
            email: string
        },
        { rejectWithValue }) => {
        const { code, newPassword, email } = verifyCodeAndSetPasswordData;
        try {
            const res = await verifyCodeAndSetNewPassword(code, newPassword, email);
            return res;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

//ACTIONS
const inputSignInDataAcion = (state: AuthState, action: PayloadAction<SignInData>) => {
    state.inputUserId = action.payload.userId;
    state.inputPW = action.payload.password;
}

const checkLocalAuthAction = (state: AuthState) => {
    const localAuthData = localStorage.getItem('@malo_auth');
    state.authData = localAuthData ? JSON.parse(localAuthData) : undefined;
    state.isAuthenticated = !!localAuthData;
}

const showLoginModalAction = (state: AuthState) => {
    state.showLoginModal = true;
}

const hideLoginModalAction = (state: AuthState) => {
    state.showLoginModal = false;
}

const refreshTokenAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(refreshToken.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(
            refreshToken.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.authData = action.payload;
                state.isAuthenticated = true;
            }
        )
        .addCase(refreshToken.rejected, (state, action) => {
            state.loading = false;
            // state.error = action.payload as string;
            state.isAuthenticated = false;
        });
}

export const signInAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(signIn.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.needConfirmation = false;
        })
        .addCase(signIn.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.res = action.payload;
            state.authData = action.payload;
            state.isAuthenticated = true;
            state.needConfirmation = false;
        })
        .addCase(signIn.rejected, (state, action) => {
            console.log(action.payload)
            if ((action.payload as any).name === "UserNotConfirmedException") {
                state.needConfirmation = true;
            }
            state.loading = false;
            state.error = (action.payload as any).message;
        });
}

const signOutAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(signOut.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(signOut.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.authData = action.payload;
            state.isAuthenticated = false;
        })
        .addCase(signOut.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.authData = undefined;
            state.error = action.payload as string;
        });
}

const signUpAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(signUp.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(
            signUp.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.authData = action.payload;
                state.newRegisterUserName = action.payload.user.username;
            }
        )
        .addCase(signUp.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
}

const confirmEmailAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(confirmEmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(
            confirmEmail.fulfilled,
            (state) => {
                state.loading = false;
                state.needConfirmation = false;
                state.isAuthenticated = false;
            }
        )
        .addCase(confirmEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
            state.isAuthenticated = false;
        });
}

const sendConfirmationEmailAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(sendConfirmEmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(
            sendConfirmEmail.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.authData = action.payload;
            }
        )
        .addCase(sendConfirmEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
}

const sendForgetPasswordEmailAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(sendForgetPasswordEmail.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(
            sendForgetPasswordEmail.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.authData = action.payload;
            }
        )
        .addCase(sendForgetPasswordEmail.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
}

const verifyCodeAndSetPasswordAction = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(verifyCodeAndSetPassword.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(
            verifyCodeAndSetPassword.fulfilled,
            (state, action: PayloadAction<any>) => {
                state.loading = false;
                state.authData = action.payload;
            }
        )
        .addCase(verifyCodeAndSetPassword.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        inputSignInData: inputSignInDataAcion,
        checkLocalAuth: checkLocalAuthAction,
        showLoginModal: showLoginModalAction,
        hideLoginModal: hideLoginModalAction,
    },
    extraReducers: (builder) => {
        signInAction(builder);
        signOutAction(builder);
        refreshTokenAction(builder);
        signUpAction(builder);
        confirmEmailAction(builder);
        sendConfirmationEmailAction(builder);
        sendForgetPasswordEmailAction(builder);
        verifyCodeAndSetPasswordAction(builder);
    },
})
const authReducer = authSlice.reducer;

export default authReducer;
export const {
    inputSignInData,
    checkLocalAuth,
    showLoginModal,
    hideLoginModal,
} = authSlice.actions;
