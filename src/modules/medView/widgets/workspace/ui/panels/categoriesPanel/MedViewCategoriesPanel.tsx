import { Tab, Tabs } from "@mui/material";
import { useMedViewWorkspaceStore } from "../../../model/stores/useMedViewWorkspaceStore";
import styles from "./styles.module.scss";

const categories = [
  ["patient", "Пациент"],
  ["case-details", "Детали случая"],
  ["oncology", "Онкология"],
  ["prescriptions", "Назначения / направления"],
  ["clinical-groups", "КСГ / ВМП"],
  ["provided-services", "Оказанные услуги"],
  ["defects", "Дефекты / санкции"],
] as const;

export const MedViewCategoriesPanel = () => {
  const { targetCategory, setTargetCategory } = useMedViewWorkspaceStore();
  const value = targetCategory === "default" || targetCategory === "export"
    ? false
    : targetCategory;

  return (
    <Tabs
      className={styles.categoriesPanelRoot}
      value={value}
      onChange={(_, category: (typeof categories)[number][0]) => setTargetCategory(category)}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      aria-label="Разделы медицинского случая"
    >
      {categories.map(([id, label], index) => (
        <Tab
          key={id}
          id={`medview-case-tab-${id}`}
          aria-controls="medview-case-panel"
          value={id}
          label={label}
          tabIndex={value === false && index === 0 ? 0 : undefined}
          disableRipple
        />
      ))}
    </Tabs>
  );
};
