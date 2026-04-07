import { configureStore } from '@reduxjs/toolkit';
import carReducer from './cars/carsSlice';
import authReducer from './auth/authSlice';
import userCollectionReducer from './userCollection/userCollectionSlice';
import filterReducer from './filter/filterSlice';
import { initApi } from '../api/apiContext';


export const store = configureStore({
  reducer: {
    cars: carReducer,
    auth: authReducer,
    filter: filterReducer, // TODO: deprecated
    userCollection: userCollectionReducer,
  }
});

initApi({
  getAccessToken: () => store.getState().auth.authData?.accessToken,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
