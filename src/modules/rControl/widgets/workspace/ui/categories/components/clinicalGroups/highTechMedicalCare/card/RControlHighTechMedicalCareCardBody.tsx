import type { HighTechMedicalCareDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetHighTechMedicalCareResult";
import { Skeleton } from "@mui/material";
import { displayValue, formatVmpDate } from "../../presentation";
import styles from "../../styles.module.scss";

interface RControlHighTechMedicalCareCardBodyProps {
  highTechMedicalCare: HighTechMedicalCareDto;
  isPending: boolean;
}

export const RControlHighTechMedicalCareCardBody = ({
  highTechMedicalCare,
  isPending,
}: RControlHighTechMedicalCareCardBodyProps) => (
  <dl className={styles.fields} aria-busy={isPending}>
    <div><dt>Вид</dt><dd>{isPending ? <Skeleton /> : displayValue(highTechMedicalCare?.highTechCareTypeCode)}</dd></div>
    <div><dt>Метод</dt><dd>{isPending ? <Skeleton /> : displayValue(highTechMedicalCare?.highTechCareMethodCode)}</dd></div>
    <div className={styles.wideField}><dt>Номер талона</dt><dd>{isPending ? <Skeleton /> : displayValue(highTechMedicalCare?.voucherNumber)}</dd></div>
    <div><dt>Дата выдачи талона</dt><dd>{isPending ? <Skeleton /> : formatVmpDate(highTechMedicalCare?.voucherIssueDate)}</dd></div>
    <div><dt>Дата планируемой госпитализации</dt><dd>{isPending ? <Skeleton /> : formatVmpDate(highTechMedicalCare?.plannedAdmissionDate)}</dd></div>
  </dl>
);
