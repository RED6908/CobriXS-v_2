import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "bootstrap-icons/font/bootstrap-icons.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./Styles/layout.css";
import { SettingsProvider } from "./context/SettingsContext";
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
);
