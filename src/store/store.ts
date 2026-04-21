import { configureStore } from '@reduxjs/toolkit';
import carReducer from './cars/carsSlice';
import authReducer from './auth/authSlice';
import userCollectionReducer from './userCollection/userCollectionSlice';
import filterReducer from './filter/filterSlice';
import userReducer from './user/userSlice';
import { initApi } from '../api/apiContext';


export const store = configureStore({
  reducer: {
    cars: carReducer,
    auth: authReducer,
    filter: filterReducer, // TODO: deprecated
    userCollection: userCollectionReducer,
    user: userReducer,
  }
});

initApi({
  getIdToken: () => store.getState().auth.authData?.idToken as unknown as string | undefined,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
