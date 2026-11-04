import type { ClassificationCriterionDto } from "../../../../../../../../../../shared/model/types/invoiceStructure/results/clinicalGroup/GetClassificationCriteriaResult";
import { displayValue } from "../../presentation";
import styles from "./styles.module.scss";

interface ClassificationCriteriaBodyProps {
  classificationCriteria: ClassificationCriterionDto[];
}

export const RControlClassificationCriterionChips = ({
  classificationCriteria,
}: ClassificationCriteriaBodyProps) => (
  <ul className={styles.criteriaList}>
    {classificationCriteria.map((criterion) => (
      <li key={criterion.classificationCriterionUid}>{displayValue(criterion.classificationCriterion)}</li>
    ))}
  </ul>
);
