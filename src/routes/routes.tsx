import { createBrowserRouter } from "react-router-dom";
import Home from "../layout/pages/Home";
import Settings from "../layout/pages/Settings";
import Account from "../layout/pages/Account";
import Login from "../layout/auth/Login";
import ProtectedLayout from "../layout/ProtectedLayout";
import CreateAccount from "../layout/auth/CreateAccount";
import ConfirmRegitstration from "../layout/auth/ConfirmRegitstration";
import Brands from "../layout/pages/Brands";
import Cars from "../layout/pages/Cars";
import CarDetail from "../layout/pages/CarDetail";
import CarEditor from "../layout/pages/CarEditor";
import AdditionalDataHelper from "../layout/pages/AdditionalDataHelper";
import ForgetPassword from "../layout/auth/ForgetPassword";
import CollectionsList from "../layout/pages/user/CollectionsList";
import MGTCrawlHelper from "../layout/pages/crawler/MGTCrawlHelper";
import Crawlers from "../layout/pages/crawler/Crawlers";
import TWCrawlHelper from "../layout/pages/crawler/TWCrawlHelper";
import InnoCrawlHelper from "../layout/pages/crawler/InnoCrawlHelper";
import PopraceCrawlHelper from "../layout/pages/crawler/PopraceCrawlHelper";
import CollectionDetail from "../layout/pages/user/CollectionDetail";
import AdminCars from "../layout/pages/admin/AdminCars";

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <CreateAccount /> },
      { path: "confirm_registration", element: <ConfirmRegitstration /> },
      { path: "forget_password", element: <ForgetPassword /> },
      { path: "home", element: <Home /> },
      { path: "cars", element: <Cars /> },
      { path: "cars/edit", element: <CarEditor /> },
      { path: "admin/cars", element: <AdminCars /> },
      { path: "car_detail", element: <CarDetail /> },
      { path: "brands", element: <Brands /> },
      { path: "settings", element: <Settings /> },
      { path: "account", element: <Account /> },
      { path: "collection_list", element: <CollectionsList /> },
      { path: "collection_detail", element: <CollectionDetail /> },
      { path: "crawlers", element: <Crawlers /> },
      { path: "crawlers/mini_gt", element: <MGTCrawlHelper /> },
      { path: "crawlers/tarmac", element: <TWCrawlHelper /> },
      { path: "crawlers/inno", element: <InnoCrawlHelper /> },
      { path: "crawlers/pop_race", element: <PopraceCrawlHelper /> },
      { path: "additional_data", element: <AdditionalDataHelper /> },
    ],
  },
]);

export default router;
