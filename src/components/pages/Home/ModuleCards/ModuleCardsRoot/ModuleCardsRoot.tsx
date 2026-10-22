import { ModuleCard } from "../ModuleCard/ModuleCard";
import projects from "../../../../../../projects.json";
import styles from "./styles.module.scss";

const modules = [
  {
    ...projects.RControl,
    navigatePath: "/rcontrol",
    accentColor: "#24876D",
    coverBackground: "#E5F4EE",
  },
  {
    ...projects.MedView,
    navigatePath: "/med-view",
    accentColor: "#7654B8",
    coverBackground: "#EEE8FC",
  },
  {
    ...projects.HealthTrack,
    navigatePath: "/health-track",
    accentColor: "#CA7C20",
    coverBackground: "#FFF0DC",
  },
];

export const ModuleCardsRoot = () => {
  return (
    <section className={styles.modulesGroup}>
      {modules.map((module) => (
        <ModuleCard
          key={module.navigatePath}
          displayName={module.DisplayName}
          moduleDescription={module.Description}
          navigatePath={module.navigatePath}
          accentColor={module.accentColor}
          coverBackground={module.coverBackground}
        />
      ))}
    </section>
  );
};
