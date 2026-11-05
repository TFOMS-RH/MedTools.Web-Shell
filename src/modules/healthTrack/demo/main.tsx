import { useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PageContainer } from "../../../components/layouts/PageContainer/PageContainer";
import { useAuthStore } from "../../auth/stores/authStore";
import apiClient from "../../../shared/api/client/apiClient";
import { MemoryRouter } from "react-router";
import { HTMain } from "../pages/HTMain/HTMain";
import { HTNotistackProvider } from "../ui/HTNotistackProvider/HTNotistackProvider";
import { createDocumentsDemoTransport, type DemoMode } from "./transport";
import "../../../app/styles/global.scss";
import styles from "./styles.module.scss";

if (import.meta.env.DEV && window.parent !== window) {
  const transport = createDocumentsDemoTransport();
  // Both the adapter and store below belong exclusively to the iframe's realm.
  apiClient.defaults.adapter = transport.adapter;
  useAuthStore.setState({ accessToken: null, user: null, isInitialized: true, organizationCode: "19000",
    permissions: ["healthtrack.documents.read", "healthtrack.documents.read_details",
      "healthtrack.documents.check", "healthtrack.documents.delete",
      "healthtrack.export.aggregated", "healthtrack.export.responses"],
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } } });

  // oxlint-disable-next-line react/only-export-components -- Standalone development entry point.
  function Preview() {
    const [mode, setMode] = useState<DemoMode>("ready");
    const [count, setCount] = useState(100);
    const [organization, setOrganization] = useState("19000");
    const [operationError, setOperationError] = useState(false);
    return <><PageContainer width="wide">
      <aside className={styles.controls} aria-label="Настройки превью">
        <p>Превью HealthTrack. Данные вымышлены, операции выполняются в памяти. Выгрузки — пустые демонстрационные ZIP-архивы.</p>
        <label>Состояние списка<select value={mode} onChange={(event) => {
          const next = event.target.value as DemoMode;
          setMode(next); transport.setMode(next); void client.resetQueries();
        }}>
          <option value="ready">Данные</option><option value="loading">Загрузка / обновление (3 секунды)</option>
          <option value="empty">Пустой список</option><option value="error">Ошибка запроса</option>
        </select></label>
        <label>Количество документов<select value={count} onChange={(event) => {
          const next = Number(event.target.value);
          setCount(next); transport.setCount(next); void client.resetQueries();
        }}>{[25, 50, 100, 200, 400].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label>Вариант организации<select value={organization} onChange={(event) => {
          setOrganization(event.target.value); useAuthStore.setState({ organizationCode: event.target.value });
        }}><option value="19000">ТФОМС — шесть форм</option><option value="190006">МО — GF / PF</option>
          <option value="19001">СМО — DSPN / PROF</option></select></label>
        <label className={styles.checkbox}><input type="checkbox" checked={operationError} onChange={(event) => {
          setOperationError(event.target.checked); transport.setOperationError(event.target.checked);
        }} />Ошибки операций</label>
      </aside>
    </PageContainer><MemoryRouter initialEntries={["/health-track"]}><HTMain /></MemoryRouter></>;
  }

  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={client}><HTNotistackProvider><Preview /></HTNotistackProvider></QueryClientProvider>,
  );
}
