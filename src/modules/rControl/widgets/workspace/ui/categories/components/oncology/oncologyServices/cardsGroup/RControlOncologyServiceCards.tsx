import type { OncologyServiceDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/oncology/GetOncologyServicesResult";
import { codeDescription } from "../../presentation";
import styles from "../../styles.module.scss";
interface RControlOncologyServiceCardsProps {
  oncologyServices: OncologyServiceDto[];
  selectedOncologyServiceUid: number | null;
  selectOncologyService: (uid: number | null) => void;
}
export const RControlOncologyServiceCards = ({
  oncologyServices,
  selectedOncologyServiceUid,
  selectOncologyService,
}: RControlOncologyServiceCardsProps) => (
  <div
    className={[
      styles.selectionList,
      oncologyServices.length > 3 ? styles.selectionListLong : "",
    ].join(" ")}
    aria-label="Выбор онкологической услуги"
    role="group"
  >
    {oncologyServices.map((service) => (
      <article
        key={service.oncologyServiceUid}
        data-oncology-service
        role="button"
        tabIndex={0}
        aria-pressed={selectedOncologyServiceUid === service.oncologyServiceUid}
        className={styles.selectionCard}
        onClick={() => selectOncologyService(service.oncologyServiceUid)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!event.repeat)
              selectOncologyService(service.oncologyServiceUid);
          }
        }}
      >
        <h4 className={styles.selectionTitle}>
          {codeDescription(service.serviceType, service.serviceTypeCode)}
        </h4>
        <div className={styles.selectionDetails}>
          {(service.surgicalTreatmentType?.trim() ||
            service.surgicalTreatmentTypeCode != null) && (
            <p className={styles.recordText}>
              <span className={styles.detailLabel}>
                Тип хирургического лечения:{" "}
              </span>
              {codeDescription(
                service.surgicalTreatmentType,
                service.surgicalTreatmentTypeCode,
              )}
            </p>
          )}
          {(service.drugTherapyLine?.trim() ||
            service.drugTherapyLineCode != null) && (
            <p className={styles.recordText}>
              <span className={styles.detailLabel}>
                Линия лекарственной терапии:{" "}
              </span>
              {codeDescription(
                service.drugTherapyLine,
                service.drugTherapyLineCode,
              )}
            </p>
          )}
          {(service.radiotherapyType?.trim() ||
            service.radioTherapyTypeCode != null) && (
            <p className={styles.recordText}>
              <span className={styles.detailLabel}>Тип лучевой терапии: </span>
              {codeDescription(
                service.radiotherapyType,
                service.radioTherapyTypeCode,
              )}
            </p>
          )}
          <p className={styles.recordText}>
            <span className={styles.detailLabel}>
              Проведение профилактики тошноты:{" "}
            </span>
            {service.isAntiemeticProphylaxis === null
              ? "—"
              : service.isAntiemeticProphylaxis
                ? "Да"
                : "Нет"}
          </p>
        </div>
      </article>
    ))}
  </div>
);
