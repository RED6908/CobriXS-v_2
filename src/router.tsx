import { createBrowserRouter } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./layout/DashboardLayout";
import Users from "./pages/Users";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Cashier from "./pages/Cashier";
import SupplierPayments from "./pages/SupplierPayments";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),

    children: [

      {
        index: true,
        element: <Dashboard />,
      },

      {
        path: "usuarios",
        element: <Users />,
      },

      {
        path: "productos",
        element: <Products />,
      },

      {
        path: "inventario",
        element: <Inventory />,
      },

      {
        path: "pos",
        element: <Cashier />,
      },

      {
        path: "provedores",
        element: <SupplierPayments />,
      },

      {
        path: "reportes",
        element: (
          <ProtectedRoute role="admin">
            <Reports />
          </ProtectedRoute>
        ),
      },

      {
        path: "configuracion",
        element: <Settings />,
      },

    ],
  },

]);