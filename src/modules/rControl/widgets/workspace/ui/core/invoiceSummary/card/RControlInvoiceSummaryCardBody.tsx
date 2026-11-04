import type { InvoiceSummaryDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/invoices/GetInvoiceSummaryResult";
import { formatCurrency } from "../../../../../../../../shared/helpers/formatCurrency";
import { formatDate } from "../../../../../../../../shared/helpers/formatDate";
import { Skeleton } from "@mui/material";
import styles from "./styles.module.scss";

const metricGroups = [
  {
    title: "Суммы", fields: [
      ["Предъявлено", "invoiceAmount"],
      ["Принято ТФОМС", "approvedAmount"],
      ["Принято СМО", "insuranceCompanyApprovedAmount"],
    ]
  },
  {
    title: "Снято ТФОМС", fields: [
      ["ТФОМС снято МЭК", "medicalEconomicControlPenalty"],
      ["ТФОМС снято МЭЭ", "medicalEconomicExpertisePenalty"],
      ["ТФОМС снято ЭКМР", "medicalCareQualityExpertisePenalty"],
    ]
  },
  {
    title: "Снято СМО", fields: [
      ["СМО снято МЭК", "insuranceCompanyMedicalEconomicControlPenalty"],
      ["СМО снято МЭЭ", "insuranceCompanyMedicalEconomicExpertisePenalty"],
      ["СМО снято ЭКМР", "insuranceCompanyMedicalCareQualityExpertisePenalty"],
    ]
  },
] as const;

export const RControlInvoiceSummaryCardBody = ({ invoiceSummary, isPending }: {
  invoiceSummary?: InvoiceSummaryDto;
  isPending: boolean;
}) => (
  <div className={styles.body}>
    <div className={styles.metrics}>
      {metricGroups.map(group => (
        <div className={styles.metricGroup} key={group.title}>
          <h4>{group.title}</h4>
          <dl>
            {group.fields.map(([label, key]) => (
              <div className={styles.metric} key={key}>
                <dt>{label}</dt>
                <dd>{isPending ? <Skeleton /> : formatCurrency(invoiceSummary![key])}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
    <dl className={styles.metadata}>
      <div><dt>Имя файла</dt><dd>{isPending ? <Skeleton /> : invoiceSummary?.filename}</dd></div>
      <div><dt>Дата выгрузки</dt><dd>{isPending ? <Skeleton /> : formatDate(invoiceSummary!.invoiceUploadDate)}</dd></div>
      <div><dt>UID счета</dt><dd>{isPending ? <Skeleton /> : invoiceSummary?.invoiceUid}</dd></div>
    </dl>
  </div>
);
