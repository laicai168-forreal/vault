import { configureStore } from '@reduxjs/toolkit';
import carReducer from './cars/carsSlice';
import authReducer from './auth/authSlice';
import userCollectionReducer from './userCollection/userCollectionSlice';


export const store = configureStore({
  reducer: {
    cars: carReducer,
    auth: authReducer,
    userCollection: userCollectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;