import { Outlet } from "react-router-dom";
import { StoreProvider } from "../context/StoreContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  return (
    <StoreProvider>
      <div className="d-flex vh-100">
        <Sidebar />
        <div className="cobrixs-main">
          <Topbar />
          <main className="cobrixs-content">
            <Outlet />
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}
