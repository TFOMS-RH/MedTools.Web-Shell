import { useState } from "react";
import type { MedicalCaseDto } from "../../../../../../../../shared/model/types/invoiceStructure/results/medicalCases/GetMedicalCaseListItemsResult";
import { MedViewMedicalCaseCards } from "./MedViewMedicalCaseCards";
import { MedViewMedicalCaseCardSkeletons } from "./MedViewMedicalCaseCardSkeletons";
import styles from "./styles.module.scss";

// Synthetic records, imported only by the development preview.
const medicalCases: MedicalCaseDto[] = Array.from({ length: 8 }, (_, index) => ({
  medicalCaseUid: index + 1,
  medicalProfile: index === 1 ? null : 76,
  isPediatric: index % 2 === 0,
  physicianSpecialty: index % 2 === 0 ? 31 : 53,
  treatmentStartDate: index === 1 ? "" : "2026-01-05",
  treatmentEndDate: index === 1 ? "" : "2026-01-22",
  primaryDiagnosis: index === 1 ? "" : ["A00.0", "J00", "I10", "E11.9"][index % 4],
  paidUnits: index === 1 ? null : index === 3 ? 0 : index + 2,
  unitRate: index === 1 ? null : 2500 + index * 125.5,
  amountBilled: index === 2 ? 123456789012.34 : index === 3 ? 0 : 18500 + index * 750,
  approvedAmount: index === 1 ? null : 17500 + index * 500,
  insuranceCompanyApprovedAmount: index === 1 ? null : index === 3 ? 0 : 16500 + index * 450,
}));

export default function MedViewMedicalCaseCardsPreview() {
  const [count, setCount] = useState(2);
  const [selectedUid, setSelectedUid] = useState<number | null>(
    medicalCases[0].medicalCaseUid,
  );
  const [loading, setLoading] = useState(false);

  return (
    <section className={styles.preview} aria-label="Демонстрация медицинских случаев">
      <div className={styles.previewToolbar}>
        <p>
          Демонстрационные данные. Выбор карточки не изменяет нижние вкладки.
        </p>
        <div className={styles.previewControls}>
          <label>
            Карточек
            <select
              value={count}
              onChange={(event) => {
                setCount(Number(event.target.value));
                setSelectedUid(medicalCases[0].medicalCaseUid);
              }}
            >
              {[1, 2, 8].map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={loading}
              onChange={(event) => setLoading(event.target.checked)}
            />
            Загрузка
          </label>
        </div>
      </div>
      {loading ? (
        <MedViewMedicalCaseCardSkeletons />
      ) : (
        <MedViewMedicalCaseCards
          medicalCases={medicalCases.slice(0, count)}
          selectedMedicalCaseUid={selectedUid}
          selectMedicalCase={setSelectedUid}
        />
      )}
    </section>
  );
}
