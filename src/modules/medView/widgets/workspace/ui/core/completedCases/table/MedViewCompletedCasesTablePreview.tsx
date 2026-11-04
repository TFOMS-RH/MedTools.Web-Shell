import { useState } from "react";
import type { CompletedCaseListItemDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetCompletedCaseListItemsResult";
import type { PaginationState } from "../../../../../../../../shared/types/PaginationState";
import { Divider } from "../../../../../../../../components/ui/Divider/Divider";
import { MedViewCompletedCasesTableHeader } from "./MedViewCompletedCasesTableHeader";
import { MedViewCompletedCasesTableBody } from "./MedViewCompletedCasesTableBody";
import styles from "./styles.module.scss";

const patients = [
  ["Иванов", "Иван", "Иванович"],
  ["Петрова", "Анна", "Сергеевна"],
  ["Константинопольский-Александровский", "Александр", "Константинович"],
  ["Смирнова", "Екатерина", "Александровна"],
  ["Кузнецов", "Михаил", "Андреевич"],
];

// Synthetic records for the development-only table preview.
const completedCases: CompletedCaseListItemDto[] = Array.from(
  { length: 100 },
  (_, index) => {
    const [patientLastName, patientFirstName, patientMiddleName] =
      patients[index % patients.length];

    return {
      completedCaseUid: index + 1,
      entryPositionNumber: index + 1,
      entryNumber: 100001 + index,
      patientLastName,
      patientFirstName,
      patientMiddleName,
      medicalCareConditions: (index % 3) + 1,
      insurancePolicySeries: index % 3 === 0 ? null : "0000",
      insurancePolicyNumber: String(index + 1).padStart(16, "0"),
      amountBilled: index % 10 === 2 ? 123456789012.34 : 12500 + index * 713.25,
      approvedAmount: index % 4 === 0 ? null : 11250 + index * 613.5,
      insuranceCompanyApprovedAmount:
        index % 5 === 0 ? null : 10500 + index * 513.75,
    };
  },
);

export default function MedViewCompletedCasesTablePreview() {
  const [pagination, setPagination] = useState<PaginationState>({
    page: 0,
    pageSize: 10,
  });
  const [selectedUid, setSelectedUid] = useState<number | null>(null);
  const start = pagination.page * pagination.pageSize;

  return (
    <section className={styles.CompletedCasesTableRoot}>
      <p className={styles.previewNotice}>
        Демонстрационные данные. Фильтры к этим записям не применяются.
      </p>
      <MedViewCompletedCasesTableHeader
        totalCount={completedCases.length}
        pagination={pagination}
        onPageChange={(_event, page) => {
          setPagination({ ...pagination, page });
          setSelectedUid(null);
        }}
        onRowsPerPageChange={(event) => {
          setPagination({ page: 0, pageSize: Number(event.target.value) });
          setSelectedUid(null);
        }}
        disabled={false}
        isLoading={false}
      />
      <Divider />
      <div className={styles.content}>
        <MedViewCompletedCasesTableBody
          completedCases={completedCases.slice(
            start,
            start + pagination.pageSize,
          )}
          isPending={false}
          totalCount={pagination.pageSize}
          selectedCompletedCaseUid={selectedUid}
          selectCompletedCase={setSelectedUid}
        />
      </div>
    </section>
  );
}
