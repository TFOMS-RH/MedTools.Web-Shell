import { useEffect, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import apiClient from "../../../../../../shared/api/client/apiClient";
import { useRControlWorkspaceStore } from "../../model/store/useRControlWorkspaceStore";
import { useRControlWorkspacePanelStore } from "../../model/store/useRControlWorkspacePanelStore";

/** Development-only transport fixtures; the actual hooks, controls and selection rules run unchanged. */
export default function RControlWorkspaceDemoProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      }),
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const originalAdapter = apiClient.defaults.adapter;
    const forward = axios.getAdapter(originalAdapter);
    const workspace = useRControlWorkspaceStore.getState();
    const panel = useRControlWorkspacePanelStore.getState();
    panel.selectTargetDb(null);
    workspace.setInvoicesTablePagination({ page: 0 });
    apiClient.defaults.adapter = async (config) => {
      const path = config.url ?? "";
      if (!path.startsWith("med-tools/rcontrol/")) return forward(config);
      const flags = new URLSearchParams(window.location.search);
      const params = config.params as Record<string, string | number>;
      let kind = "Other";
      let value: unknown = null;
      if (path.endsWith("/lookups/medical-organizations")) {
        kind = "Organizations";
        value = {
          medicalOrganizations: [
            {
              medicalOrganizationCode: "001",
              medicalOrganizationName: "ДЕМО-РКОНТРОЛ: первая организация",
            },
            {
              medicalOrganizationCode: "002",
              medicalOrganizationName: "ДЕМО-РКОНТРОЛ: вторая организация",
            },
          ],
        };
      } else if (path.endsWith("/lookups/billing-periods")) {
        kind = "Periods";
        value = {
          billingPeriods: [
            { billingYear: 2026, billingMonths: [1, 2] },
            { billingYear: 2025, billingMonths: [12] },
          ],
        };
      } else if (path.endsWith("/invoices")) {
        kind = "Invoices";
        value = {
          recordsCount: 2,
          invoices: [11, 12].map((uid) => ({
            invoiceUid: uid,
            number: `ДЕМО-${params.targetDb}-${uid}`,
            billingDate: "2026-01-03",
            amount: 1234.56,
            medicalCasesCount: 2,
            status: 0,
          })),
        };
      } else if (/\/invoices\/\d+\/summary$/.test(path)) {
        kind = "Summary";
        value = {
          invoiceSummary: {
            invoiceUid: Number(path.split("/").at(-2)),
            filename: "demo-invoice.xml",
            invoiceUploadDate: "2026-01-03",
            invoiceAmount: 1234.56,
            approvedAmount: 0,
            medicalEconomicControlPenalty: 0,
            medicalEconomicExpertisePenalty: 0,
            medicalCareQualityExpertisePenalty: 0,
            insuranceCompanyApprovedAmount: 0,
            insuranceCompanyMedicalEconomicControlPenalty: 0,
            insuranceCompanyMedicalEconomicExpertisePenalty: 0,
            insuranceCompanyMedicalCareQualityExpertisePenalty: 0,
          },
        };
      } else if (/\/invoices\/\d+\/completed-cases$/.test(path)) {
        kind = "Completed";
        const parent = Number(path.split("/").at(-2));
        value = {
          totalCount: 2,
          completedCases: [1, 2].map((index) => ({
            completedCaseUid: parent * 10 + index,
            entryNumber: parent * 100 + index,
            entryPositionNumber: index,
            patientLastName: "Демонстрационный",
            patientFirstName: `Пациент ${index}`,
            patientMiddleName: "",
            medicalCareConditions: 0,
            insurancePolicySeries: null,
            insurancePolicyNumber: "0000000000000000",
            amountBilled: 1234.56,
            approvedAmount: null,
            insuranceCompanyApprovedAmount: null,
          })),
        };
      } else if (/\/completed-cases\/\d+\/medical-cases$/.test(path)) {
        kind = "Medical";
        const parent = Number(path.split("/").at(-2));
        value = {
          medicalCases: [1, 2].map((index) => ({
            medicalCaseUid: parent * 10 + index,
            medicalProfile: null,
            isPediatric: false,
            physicianSpecialty: 0,
            treatmentStartDate: "2026-01-01",
            treatmentEndDate: "2026-01-03",
            primaryDiagnosis: "",
            paidUnits: index,
            unitRate: null,
            amountBilled: 1234.56,
            approvedAmount: null,
            insuranceCompanyApprovedAmount: null,
          })),
        };
      }
      const mode =
        flags.get(`demo${kind}`) ?? (kind === "Other" ? "error" : "ready");
      const requestedDelay = Number(flags.get("demoDelay") ?? 200);
      const delay =
        mode === "loading"
          ? 30000
          : Math.max(
              0,
              Math.min(
                5000,
                Number.isFinite(requestedDelay) ? requestedDelay : 200,
              ),
            );
      await new Promise((resolve) => window.setTimeout(resolve, delay));
      if (mode === "empty") {
        value =
          kind === "Organizations"
            ? { medicalOrganizations: [] }
            : kind === "Periods"
              ? { billingPeriods: [] }
              : kind === "Invoices"
                ? { invoices: [], recordsCount: 0 }
                : kind === "Completed"
                  ? { completedCases: [], totalCount: 0 }
                  : kind === "Medical"
                    ? { medicalCases: [] }
                    : { invoiceSummary: null };
      }
      const error =
        kind === "Other"
          ? "Демонстрационные данные этого раздела не подготовлены."
          : `Демонстрационная ошибка: ${kind}`;
      return {
        config,
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json" },
        data:
          mode === "error"
            ? {
                isFailure: true,
                isSuccess: false,
                error,
                clientMessage: error,
                value: null,
              }
            : {
                isFailure: false,
                isSuccess: true,
                error: "",
                clientMessage: "",
                value,
              },
      };
    };
    setReady(true);
    return () => {
      apiClient.defaults.adapter = originalAdapter;
      client.clear();
      useRControlWorkspacePanelStore.setState(panel);
      useRControlWorkspaceStore.setState(workspace);
    };
  }, [client]);
  return ready ? (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  ) : null;
}
