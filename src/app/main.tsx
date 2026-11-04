import { createRoot } from "react-dom/client";
import { lazy, Suspense } from "react";
import { Home } from "../components/pages/Home/Home";
import { Login } from "../components/pages/Login/Login";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router";
import { PlainLayout } from "../components/layouts/PlainLayout/PlainLayout";
import { RControl } from "../modules/rControl/pages/RControl";
import { MedView } from "../modules/medView/pages/MedView";
import { MainLayout } from "../components/layouts/MainLayout/MainLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/client/queryClient";
import { HTMain } from "../modules/healthTrack/pages/HTMain/HTMain";
import { HTNotistackProvider } from "../modules/healthTrack/ui/HTNotistackProvider/HTNotistackProvider";
import { AuthSession } from "../modules/auth/components/AuthSession";
import { AdminUsers } from "../modules/admin/pages/AdminUsers";
import { AdminAccessCatalog } from "../modules/admin/pages/AdminAccessCatalog";

import "./styles/global.scss";

const AdminDemo = import.meta.env.DEV
  ? lazy(() => import("../modules/admin/demo/AdminDemoRoute"))
  : null;

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <HTNotistackProvider>
      <BrowserRouter>
        <Routes>
          {AdminDemo && (
            <Route element={<MainLayout />}>
              <Route path="/admin" element={<Suspense fallback={null}><AdminDemo /></Suspense>} />
            </Route>
          )}
          <Route element={<AuthSession><Outlet /></AuthSession>}>
            <Route element={<PlainLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/rcontrol" element={<RControl />} />
              <Route path="/med-view" element={<MedView />} />
              <Route path="/health-track" element={<HTMain />} />
              {!AdminDemo && <Route path="/admin" element={<Navigate to="/admin/users" replace />} />}
              <Route
                path="/admin/users"
                element={<AdminUsers />}
              />
              <Route
                path="/admin/roles"
                element={<AdminAccessCatalog kind="role" />}
              />
              <Route
                path="/admin/permissions"
                element={<AdminAccessCatalog kind="permission" />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </HTNotistackProvider>
  </QueryClientProvider>,
);
