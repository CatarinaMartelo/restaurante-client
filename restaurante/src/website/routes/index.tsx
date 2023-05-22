import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Orders from "../pages/Orders";
import NotFound from "../pages/NotFound";
import Home from "../pages/Home";
import Cart from "../pages/Cart";
import Profile from "../pages/Profile";
import Bookings from "../pages/Bookings";
import Menu from "../pages/Menu";
import UpdateProfile from "../pages/UpdateProfile";
import ProfileInfo from "../pages/ProfileInfo";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/update-profile",
        element: <UpdateProfile />,
      },
      {
        path: "/profile-info",
        element: <ProfileInfo />,
      },
      {
        path: "/bookings",
        element: <Bookings />,
      },
      {
        path: "/products",
        element: <Menu />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
