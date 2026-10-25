import { useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Navigate, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminUsers } from "../pages/AdminUsers";
import { AdminAccessCatalog } from "../pages/AdminAccessCatalog";
import { useAuthStore } from "../../auth/stores/authStore";
import { adminPermissions } from "../model/permissions";
import apiClient from "../../../shared/api/client/apiClient";
import { createAdminDemoTransport, type DemoState } from "./transport";
import "../../../app/styles/global.scss";

if (import.meta.env.DEV && window.parent !== window) {
  const transport = createAdminDemoTransport();
  apiClient.defaults.adapter = transport.adapter;
  // This store belongs to the iframe's JS realm, never the main application session.
  useAuthStore.setState({ accessToken: null, isInitialized: true, permissions: Object.values(adminPermissions), user: {
    id: "demo-session", organizationId: "00000000-0000-0000-0000-000000000001", userName: "demo.admin",
    firstName: "Демонстрационный", lastName: "Администратор", middleName: null,
    email: null, contactPhone: null, birthDate: null,
  } });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });
  // oxlint-disable-next-line react/only-export-components -- Standalone development entry point.
  function Demo() {
    const [mode, setMode] = useState<DemoState>("ready");
    return <>
      <aside style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "12px" }} aria-label="Настройки демонстрации">
        <p>Демонстрационный Admin. Все данные вымышлены; операции выполняются только в памяти этого стенда.</p>
        <label>Состояние запросов <select value={mode} onChange={event => {
          const value = event.target.value as DemoState;
          setMode(value); transport.setMode(value); void client.resetQueries();
        }}>
          <option value="ready">Данные</option><option value="loading">Загрузка (5 секунд)</option>
          <option value="empty">Пустые списки</option><option value="error">Ошибка</option>
        </select></label>
        <label><input type="checkbox" onChange={event => transport.setMutationError(event.target.checked)} /> Ошибка сохранения</label>
      </aside>
      <Routes>
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/roles" element={<AdminAccessCatalog kind="role" />} />
        <Route path="/admin/permissions" element={<AdminAccessCatalog kind="permission" />} />
        <Route path="*" element={<Navigate to="/admin/users" replace />} />
      </Routes>
    </>;
  }
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={client}><MemoryRouter initialEntries={["/admin/users"]}><Demo /></MemoryRouter></QueryClientProvider>,
  );
}
