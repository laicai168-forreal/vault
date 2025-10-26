
import { createSlice, createAsyncThunk, PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit';
import { AuthenticationDetails, CognitoAccessToken, CognitoIdToken, CognitoRefreshToken, CognitoUser, CognitoUserAttribute, CognitoUserPool, CognitoUserSession, ICognitoUserData } from 'amazon-cognito-identity-js';
import * as AWS from 'aws-sdk/global';

interface AuthState {
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
    loading: boolean,
    error: string | null,
}

export interface SignInData {
    userId: string;
    password: string;
}

export interface SignOutData {
    userId: string;
}

const initialState: AuthState = {
    isAuthenticated: false,
    loading: false,
    error: null,
};

export const signIn = createAsyncThunk(
    'auth/signin',
    async ({ userId, password }: SignInData, { rejectWithValue }) => {
        try {
            const authData = await signInService(userId, password)
                .then((result: CognitoUserSession) => {
                    const formatResult = {
                        idToken: result.getIdToken().getJwtToken(),
                        refreshToken: result.getRefreshToken().getToken(),
                        accessToken: result.getAccessToken().getJwtToken(),
                        userData: result.getIdToken().decodePayload(),
                        isValid: result.isValid(),
                    }
                    localStorage.setItem('@malo_auth', JSON.stringify(formatResult));
                    return formatResult;
                });
            return authData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const signOut = createAsyncThunk(
    'auth/signout',
    async ({ userId }: SignOutData, { rejectWithValue }) => {
        try {
            const authData = await signOutService(userId);
            return authData;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || '',
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
};
const userPool = new CognitoUserPool(poolData);

const _inputSignInData = (state: AuthState, action: PayloadAction<SignInData>) => {
    state.inputUserId = action.payload.userId;
    state.inputPW = action.payload.password;
}

const _checkLocalAuth = (state: AuthState) => {
    const localAuthData = localStorage.getItem('@malo_auth');
    state.authData = localAuthData ? JSON.parse(localAuthData) : undefined;
    state.isAuthenticated = !!localAuthData;
}

const signInService = (userId: string, password: string) => {
    const authenticationData = {
        Username: userId,
        Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(
        authenticationData
    );
    const userData: ICognitoUserData = {
        Username: userId,
        Pool: userPool,
    };

    const cognitoUser = new CognitoUser(userData);


    return new Promise<CognitoUserSession>((resolve, reject) => {
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                const accessToken = result.getAccessToken().getJwtToken();

                AWS.config.region = 'us-east-1';

                const configCredentials = new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: 'us-east-1:8ef005a4-8101-405d-9be9-d5d132124b41',
                    Logins: {
                        'cognito-idp.us-east-1.amazonaws.com/us-east-1_Fin5RlUdn': result
                            .getIdToken()
                            .getJwtToken(),
                    },
                });

                AWS.config.credentials = configCredentials;

                //refreshes credentials using AWS.CognitoIdentity.getCredentialsForIdentity()
                configCredentials.refresh(error => {
                    if (error) {
                        console.error(error);
                    } else {
                        console.log('Successfully logged!');
                    }
                });
                // setToken(accessToken);

                resolve(result);
            },

            onFailure: function (err) {
                if (err.name === "UserNotConfirmedException") {
                    alert(err.message || JSON.stringify(err));
                    reject(err);
                }
            },
        });
    })
};

const signOutService = (userId: string) => {
    if (userId) {
        const userData: ICognitoUserData = {
            Username: userId,
            Pool: userPool,
        };

        const cognitoUser = new CognitoUser(userData);

        return new Promise((resolve, reject) => {
            cognitoUser.globalSignOut({
                onSuccess: (data) => {
                    resolve(data);
                },
                onFailure: (err) => {
                    reject(err)
                }
            })
        })
    }

};

const signInBuilder = (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
        .addCase(signIn.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(signIn.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.res = action.payload;
            state.authData = undefined;
            state.isAuthenticated = true;
        })
        .addCase(signIn.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        });
}

const signOutBuilder = (builder: ActionReducerMapBuilder<AuthState>) => {
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
            state.error = action.payload as string;
        });
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        inputSignInData: _inputSignInData,
        checkLocalAuth: _checkLocalAuth,
    },
    extraReducers: (builder) => {
        signInBuilder(builder);
        signOutBuilder(builder);
    },
})
const authReducer = authSlice.reducer;

export default authReducer;
export const {
    inputSignInData,
    checkLocalAuth
} = authSlice.actions;