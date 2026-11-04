import { useMedViewWorkspaceStore } from "../../../../../model/stores/useMedViewWorkspaceStore";
import styles from "./styles.module.scss";

const DefaultCategory = () => {
  const { selectedCompletedCaseUid, selectedMedicalCaseUid, targetCategory } =
    useMedViewWorkspaceStore();
  const [title, description] = selectedCompletedCaseUid === null
    ? ["Выберите законченный случай", "Нажмите на строку в таблице законченных случаев."]
    : selectedMedicalCaseUid === null
      ? ["Выберите медицинский случай", "Выберите карточку медицинского случая выше."]
      : targetCategory === "export"
        ? ["Экспорт пока недоступен", "Для просмотра сведений выберите информационный раздел."]
        : ["Выберите раздел", "Используйте вкладки для просмотра сведений о медицинском случае."];

  return (
    <div className={styles.categoryDefaultRoot} role="status">
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
    </div>
  );
};

export default DefaultCategory;
