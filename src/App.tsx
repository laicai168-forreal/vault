
import { RouterProvider } from 'react-router';
import router from './routes/routes';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useEffect, useState } from 'react';
import useAppDispatch from './hooks/useAppDispatch';
import { checkLocalAuth, refreshToken } from './store/auth/authSlice';

const AppContent = () => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    dispatch(refreshToken()).then(() => setIsInitialized(true));

    const interval = setInterval(() => {
      dispatch(refreshToken());
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
