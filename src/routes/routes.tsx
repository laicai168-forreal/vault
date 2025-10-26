import { createBrowserRouter, redirect, RouteObject } from "react-router-dom";
import Home from "../layout/pages/Home";
import Settings from "../layout/pages/Settings";
import Account from "../layout/pages/Account";
import AllCollections from "../layout/pages/AllCollections";
import Login from "../layout/auth/Login";
import ProtectedLayout from "../layout/ProtectedLayout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login />},
      { path: "home", element: <Home /> },
      { path: "all", element: <AllCollections /> },
      { path: "settings", element: <Settings /> },
      { path: "account", element: <Account /> },
    ],
  },
]);

export default router;