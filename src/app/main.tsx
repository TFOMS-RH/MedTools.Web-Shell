import { createRoot } from "react-dom/client";
import { Home } from "../components/pages/Home/Home";
import { Login } from "../components/pages/Login/Login";
import { BrowserRouter, Route, Routes } from "react-router";
import { WithoutHeaderLayout } from "../components/layouts/WithoutHeaderLayout/WithoutHeaderLayout";
import { RControl } from "../modules/rControl/pages/RControl";
import { MedView } from "../modules/medView/pages/MedView";
import { AppLayout } from "../components/layouts/AppLayout/AppLayout";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../shared/api/client/queryClient";
import { HTMain } from "../modules/healthTrack/pages/HTMain/HTMain";
import { HTNotistackProvider } from "../modules/healthTrack/ui/HTNotistackProvider/HTNotistackProvider";
import { AuthSession } from "../modules/auth/components/AuthSession";
import { RequirePermission } from "../modules/auth/components/RequirePermission";
import { AdminUsers } from "../modules/admin/pages/AdminUsers";
import { adminPermissions } from "../modules/admin/model/permissions";

import "./styles/global.scss";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <HTNotistackProvider>
      <BrowserRouter>
        <AuthSession>
          <Routes>
            <Route element={<WithoutHeaderLayout />}>
              <Route path="/login" element={<Login />} />
            </Route>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/rcontrol" element={<RControl />} />
              <Route path="/med-view" element={<MedView />} />
              <Route path="/health-track" element={<HTMain />} />
              <Route
                path="/admin/users"
                element={
                  <RequirePermission permission={adminPermissions.readUsers}>
                    <AdminUsers />
                  </RequirePermission>
                }
              />
            </Route>
          </Routes>
        </AuthSession>
      </BrowserRouter>
    </HTNotistackProvider>
  </QueryClientProvider>,
);
