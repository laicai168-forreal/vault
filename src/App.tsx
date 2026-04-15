
import { RouterProvider } from 'react-router';
import router from './routes/routes';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useEffect, useState } from 'react';
import useAppDispatch from './hooks/useAppDispatch';
import { refreshToken } from './store/auth/authSlice';
import { bootstrapCurrentUser, clearUserState } from './store/user/userSlice';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    dispatch(refreshToken()).then(async (action: any) => {
      if (refreshToken.fulfilled.match(action)) {
        await dispatch(bootstrapCurrentUser(action.payload.idToken));
      } else {
        dispatch(clearUserState());
      }
      setIsInitialized(true);
    });

    const interval = setInterval(() => {
      dispatch(refreshToken()).then((action: any) => {
        if (refreshToken.fulfilled.match(action)) {
          dispatch(bootstrapCurrentUser(action.payload.idToken));
        } else {
          dispatch(clearUserState());
        }
      });
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  if (!isInitialized) {
    return <div>Loading</div>
  }
  return <RouterProvider router={router} />;
};

const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
