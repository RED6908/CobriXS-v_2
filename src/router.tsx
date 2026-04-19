import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardLayout = lazy(() => import("./layout/DashboardLayout"));
const Users = lazy(() => import("./pages/Users"));
const Products = lazy(() => import("./pages/Products"));
const Inventory = lazy(() => import("./pages/Inventory"));
const Cashier = lazy(() => import("./pages/Cashier"));
const SupplierPayments = lazy(() => import("./pages/SupplierPayments"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));

function RouteFallback() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Cargando…</span>
      </div>
    </div>
  );
}

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
        <Suspense fallback={<RouteFallback />}>
          <DashboardLayout />
        </Suspense>
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },

      {
        path: "usuarios",
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Users />
          </Suspense>
        ),
      },

      {
        path: "productos",
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Products />
          </Suspense>
        ),
      },

      {
        path: "inventario",
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Inventory />
          </Suspense>
        ),
      },

      {
        path: "pos",
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Cashier />
          </Suspense>
        ),
      },

      {
        path: "provedores",
        element: (
          <Suspense fallback={<RouteFallback />}>
            <SupplierPayments />
          </Suspense>
        ),
      },

      {
        path: "reportes",
        element: (
          <ProtectedRoute role="admin">
            <Suspense fallback={<RouteFallback />}>
              <Reports />
            </Suspense>
          </ProtectedRoute>
        ),
      },

      {
        path: "configuracion",
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
]);
