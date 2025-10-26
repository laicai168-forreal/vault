
import { RouterProvider } from 'react-router';
import router from './routes/routes';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { useEffect } from 'react';
import useAppDispatch from './hooks/useAppDispatch';
import { checkLocalAuth } from './store/auth/authSlice';

const AppContent = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkLocalAuth());
  }, [dispatch]);

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
