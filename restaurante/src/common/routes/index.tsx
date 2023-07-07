import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import Login from "../../website/pages/Login";
import Register from "../../website/pages/Register";

import NotFound from "../../website/pages/NotFound";

import Profile from "../../website/pages/Profile";

import Menu from "../../website/pages/Menu";

import ProfileInfo from "../../website/pages/ProfileInfo";
import BookingsList from "../../website/pages/BookingsList";

import BackofficeCreateUser from "../../backoffice/pages/BackofficeCreateUser";
import BackofficeLogin from "../../backoffice/pages/BackofficeLogin";
import Users from "../../backoffice/pages/Users";

import WaitersDashboard from "../../waiters/pages/WaitersDashboard";

import Start from "../../home/Start";
import Home from "../../website/pages/Home";
import WaitersLogin from "../../waiters/pages/WaitersLogin";

import KitchenOrders from "../../kitchen/pages/KitchenOrders";

import EditMenu from "../../backoffice/pages/AddMenuItem";
import BackofficeMenu from "../../backoffice/pages/BackofficeMenu";

import KitchenLogin from "../../kitchen/pages/KitchenLogin";
import DeliveryOrders from "../../waiters/pages/DeliveryOrders";
import WaitersCreateBooking from "../../waiters/pages/WaitersCreateBookings";
import WaitersWalkIn from "../../waiters/pages/WaitersWalkIn";

import WaitersManageTables from "../../waiters/pages/WaitersManageTables";

import BackofficeRegister from "../../backoffice/pages/BackofficeRegister";
import OrdersList from "../../website/pages/OrdersList";

import BackofficeOrdersList from "../../backoffice/pages/BackofficeOrdersList";
import UpdateProfile from "../../website/pages/UpdateProfile";
import Orders from "../../website/pages/Orders";
import BookATable from "../../website/pages/BookATable";
import WaitersOperation from "../../waiters/pages/WaitersOperation";
import WaitersInvoices from "../../waiters/pages/WaitersInvoices";
import WaitersOrders from "../../waiters/pages/WaitersOrders";
import BackofficeDashboard from "../../backoffice/pages/BackofficeDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Start />,
      },
      {
        path: "/home",
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
        element: <BookATable />,
      },
      {
        path: "/mybookings",
        element: <BookingsList />,
      },
      {
        path: "/myorders",
        element: <OrdersList />,
      },
      {
        path: "/menu",
        element: <Menu />,
      },
      {
        path: "/orders",
        element: <Orders />,
      },

      {
        path: "/backoffice/login",
        element: <BackofficeLogin />,
      },
      {
        path: "/backoffice/dashboard",
        element: <BackofficeDashboard />,
      },
      {
        path: "/backoffice/register",
        element: <BackofficeRegister />,
      },
      {
        path: "/backoffice/create-user",
        element: <BackofficeCreateUser />,
      },
      {
        path: "/backoffice/menu",
        element: <BackofficeMenu />,
      },
      {
        path: "/backoffice/orders-list",
        element: <BackofficeOrdersList />,
      },
      {
        path: "/backoffice/menu/edit",
        element: <EditMenu />,
      },

      {
        path: "/backoffice/users",
        element: <Users />,
      },

      {
        path: "/waiters/login",
        element: <WaitersLogin />,
      },
      {
        path: "/waiters/dashboard",
        element: <WaitersDashboard />,
      },

      {
        path: "/waiters/create-booking",
        element: <WaitersCreateBooking />,
      },
      {
        path: "/waiters/walk-in",
        element: <WaitersWalkIn />,
      },
      {
        path: "/waiters/delivery",
        element: <DeliveryOrders />,
      },
      {
        path: "/waiters/tables",
        element: <WaitersOperation />,
      },

      {
        path: "/waiters/manage-tables",
        element: <WaitersManageTables />,
      },

      {
        path: "/waiters/order",
        element: <WaitersOrders />,
      },
      {
        path: "/waiters/invoices",
        element: <WaitersInvoices />,
      },
      {
        path: "/kitchen/login",
        element: <KitchenLogin />,
      },
      {
        path: "/kitchen/orders",
        element: <KitchenOrders />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);
